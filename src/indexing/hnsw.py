"""
Hierarchical Navigable Small World (HNSW) graph implementation.

This module provides the core graph index for the database, allowing
O(log N) approximate nearest neighbor searches using pure Python
hash maps and NumPy-vectorized distance metrics.
"""

from typing import Dict, List, Optional, Tuple, Set
import math
import heapq
import numpy as np
import numpy.typing as npt
from src.core.vector import Vector
from src.math.metrics import euclidean_distance

class HNSW:
    """
    HNSW Graph for approximate nearest neighbor search.
    """
    
    def __init__(self, m: int = 16, ef_construction: int = 40, m0_max: Optional[int] = None, seed: int = 42):
        """
        Initializes the HNSW index.
        
        Args:
            m: The maximum number of outgoing connections in graph for layers > 0.
            ef_construction: The size of the dynamic candidate list during construction.
            m0_max: The absolute maximum connections for layer 0. Defaults to 2 * M.
            seed: RNG seed for reproducible layer levels.
        """
        self.m = m
        self.ef_construction = ef_construction
        self.m0_max = m0_max if m0_max is not None else 2 * m
        
        # Mult-level multiplier dictating exponential decay of layers
        self.m_l = 1.0 / math.log(self.m)
        self.rng = np.random.default_rng(seed)
        
        # self.graphs[layer][node_id] = [neighbor_id1, neighbor_id2, ...]
        # Space Complexity: O(N * M) 
        self.graphs: Dict[int, Dict[str, List[str]]] = {0: {}}
        
        # Node storage: Space Complexity O(N * D)
        self.nodes: Dict[str, Vector] = {}
        
        # The ID of the highest inserted element to start searches from
        self.entry_point: Optional[str] = None
        self.max_layer: int = -1

    def _get_random_level(self) -> int:
        """
        Assigns a new vector a random insertion layer.
        
        Using uniformly distributed float(0,1), this creates an 
        exponentially sparse graph at higher layers.
        
        Time Complexity: O(1)
        """
        f = self.rng.uniform(0.0000001, 1.0)
        return math.floor(-math.log(f) * self.m_l)
        
    def _search_layer(self, query: npt.NDArray[np.float64], entry_pts: List[str], ef: int, layer: int) -> List[Tuple[float, str]]:
        """
        Greedy search at a specific layer.
        Maintains a dynamically updated list (size ef) of nearest elements.
        
        Time Complexity: O(ef * M * D) where D is dimension, M is degree.
        Space Complexity: O(ef) for heaps and visited sets.
        """
        visited: Set[str] = set(entry_pts)
        
        # Min-heap to explore closest nodes next
        candidates: List[Tuple[float, str]] = []
        
        # Max-heap to store the `ef` best seen nodes so far. 
        # (Using min-heap with negative distance to simulate max-heap)
        best_nodes: List[Tuple[float, str]] = []
        
        for ep in entry_pts:
            dist = euclidean_distance(query, self.nodes[ep].values)
            heapq.heappush(candidates, (dist, ep))
            heapq.heappush(best_nodes, (-dist, ep))
            
        while candidates:
            c_dist, c_id = heapq.heappop(candidates)
            
            # If the closest candidate is further than the furthest best node, terminate.
            # (Because we reached a local minimum for this layer).
            furthest_best_dist = -best_nodes[0][0]
            if c_dist > furthest_best_dist:
                break
                
            for neighbor in self.graphs[layer].get(c_id, []):
                if neighbor not in visited:
                    visited.add(neighbor)
                    furthest_best_dist = -best_nodes[0][0]
                    
                    neighbor_dist = euclidean_distance(query, self.nodes[neighbor].values)
                    
                    if neighbor_dist < furthest_best_dist or len(best_nodes) < ef:
                        heapq.heappush(candidates, (neighbor_dist, neighbor))
                        heapq.heappush(best_nodes, (-neighbor_dist, neighbor))
                        
                        if len(best_nodes) > ef:
                            heapq.heappop(best_nodes)
                            
        # Return standard list of (distance, id) sorted by distance
        return sorted([(-dist, n_id) for dist, n_id in best_nodes])

    def insert(self, vector: Vector) -> None:
        """
        Inserts a new Vector into the HNSW index.
        
        Time Complexity: O(log N * D * M) where N is graph size, D=dim, M=connections
        Space Complexity: O(M) edge mappings per node assigned.
        """
        self.nodes[vector.id] = vector
        new_layer = self._get_random_level()
        
        if self.entry_point is None:
            self.entry_point = vector.id
            self.max_layer = new_layer
            for lc in range(new_layer + 1):
                if lc not in self.graphs:
                    self.graphs[lc] = {}
                self.graphs[lc][vector.id] = []
            return
            
        current_layer = self.max_layer
        current_ep = self.entry_point
        
        # Phase 1: Search top layers for the closest node to the new vector 
        # until we reach the highest layer the new vector will be inserted into.
        while current_layer > new_layer:
            nearest_nodes = self._search_layer(vector.values, [current_ep], 1, current_layer)
            current_ep = nearest_nodes[0][1]
            current_layer -= 1
            
        entry_points = [current_ep]
        
        # Phase 2: Insert into layers from new_layer down to 0
        for lc in range(min(new_layer, self.max_layer), -1, -1):
            if lc not in self.graphs:
                self.graphs[lc] = {}
            if vector.id not in self.graphs[lc]:
                self.graphs[lc][vector.id] = []
                
            # Search for best nearest neighbors to connect to
            nearest_neighbors = self._search_layer(vector.values, entry_points, self.ef_construction, lc)
            
            # Form connections (simple heuristic: connect to nearest)
            max_conn = self.m if lc > 0 else self.m0_max
            neighbors_to_add = nearest_neighbors[:max_conn]
            
            for _, neighbor_id in neighbors_to_add:
                # Add bidirectional edge
                if neighbor_id not in self.graphs[lc][vector.id]:
                    self.graphs[lc][vector.id].append(neighbor_id)
                if vector.id not in self.graphs[lc].get(neighbor_id, []):
                    self.graphs[lc].setdefault(neighbor_id, []).append(vector.id)
                
                # Trim edges if neighbor exceeded max connections
                if len(self.graphs[lc][neighbor_id]) > max_conn:
                    # Sort neighbor's edges by distance and truncate
                    def dist_to_neighbor(nid: str) -> float:
                        return euclidean_distance(self.nodes[neighbor_id].values, self.nodes[nid].values)
                    
                    self.graphs[lc][neighbor_id].sort(key=dist_to_neighbor)
                    self.graphs[lc][neighbor_id] = self.graphs[lc][neighbor_id][:max_conn]
                    
            entry_points = [n_id for _, n_id in nearest_neighbors]
            
        if new_layer > self.max_layer:
            self.max_layer = new_layer
            self.entry_point = vector.id
            for lc in range(self.max_layer + 1):
                if lc not in self.graphs:
                    self.graphs[lc] = {}
                if vector.id not in self.graphs[lc]:
                    self.graphs[lc][vector.id] = []

    def search(self, query_values: npt.NDArray[np.float64], k: int = 5) -> List[Vector]:
        """
        Approximate Nearest Neighbor (ANN) search.
        
        Time Complexity: O(log N * D * M) 
        
        Args:
            query_values: The raw numpy vector to search.
            k: The number of nearest neighbors to retrieve.
            
        Returns:
            List[Vector]: The top k closest vectors.
        """
        if self.entry_point is None:
            return []
            
        current_ep = self.entry_point
        current_layer = self.max_layer
        
        # Traverse from top to layer 1 using ef=1 to quickly find the locality
        while current_layer > 0:
            nearest = self._search_layer(query_values, [current_ep], 1, current_layer)
            if nearest:
                current_ep = nearest[0][1]
            current_layer -= 1
            
        # At layer 0, use a larger ef for accurate local search
        best_nodes = self._search_layer(query_values, [current_ep], max(self.ef_construction, k), 0)
        
        top_k_ids = [n_id for _, n_id in best_nodes[:k]]
        return [self.nodes[n_id] for n_id in top_k_ids]
