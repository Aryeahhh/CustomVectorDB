"""
VectorStore: facade over the HNSW index with soft-delete and persistence.
"""

from typing import List, Set
import os
import json
import numpy as np
from src.core.vector import Vector
from src.indexing.hnsw import HNSW


class VectorStore:

    def __init__(self, dim: int, m: int = 16, ef_construction: int = 40):
        self.dim = dim
        self.hnsw = HNSW(m=m, ef_construction=ef_construction)
        
        self.deleted_ids: Set[str] = set()

    def add_vector(self, id: str, values: List[float], metadata: dict) -> None:
        if len(values) != self.dim:
            raise ValueError(f"Expected dimensionality {self.dim}, got {len(values)}.")

        np_values = np.array(values, dtype=np.float64)
        vec = Vector(id=id, values=np_values, metadata=metadata)

        if id in self.deleted_ids:
            self.deleted_ids.remove(id)
            self.hnsw.nodes[id] = vec
        else:
            self.hnsw.insert(vec)
            
    def query(self, query_vals: List[float], k: int = 5) -> List[Vector]:
        if len(query_vals) != self.dim:
            raise ValueError(f"Query dimensionality {len(query_vals)} does not match store ({self.dim}).")

        q_arr = np.array(query_vals, dtype=np.float64)
        search_k = min(k + len(self.deleted_ids), max(len(self.hnsw.nodes), 1))
        raw_results, _ = self.hnsw.search_with_path(q_arr, k=search_k)
        return [vec for vec, _ in raw_results if vec.id not in self.deleted_ids][:k]

    def query_with_path(self, query_vals: List[float], k: int = 5):
        if len(query_vals) != self.dim:
            raise ValueError("Dimensionality mismatch.")

        q_arr = np.array(query_vals, dtype=np.float64)
        search_k = min(k + len(self.deleted_ids), max(len(self.hnsw.nodes), 1))
        raw_results, trace = self.hnsw.search_with_path(q_arr, k=search_k)
        filtered = [(vec, dist) for vec, dist in raw_results if vec.id not in self.deleted_ids][:k]
        return filtered, trace

    def brute_force_query(self, query_vals: List[float], k: int = 5) -> List[Vector]:
        if len(query_vals) != self.dim:
            raise ValueError("Dimensionality mismatch.")
        
        q_arr = np.array(query_vals, dtype=np.float64)
        active_nodes = [vec for node_id, vec in self.hnsw.nodes.items() if node_id not in self.deleted_ids]
        
        if not active_nodes:
            return []
            
        distances = []
        for vec in active_nodes:
            dist = np.linalg.norm(vec.values - q_arr)
            distances.append((vec, dist))
            
        distances.sort(key=lambda x: x[1])
        return [vec for vec, _ in distances[:k]]

    def delete(self, vector_id: str) -> bool:
        if vector_id not in self.hnsw.nodes or vector_id in self.deleted_ids:
            return False
        self.deleted_ids.add(vector_id)
        return True

    def save(self, filepath: str) -> None:
        os.makedirs(os.path.dirname(filepath) or ".", exist_ok=True)
        if filepath.endswith('.pkl'):
            filepath = filepath[:-4] + '.json'
            
        data = {
            "dim": self.dim,
            "deleted_ids": list(self.deleted_ids),
            "hnsw": {
                "m": self.hnsw.m,
                "ef_construction": self.hnsw.ef_construction,
                "m0_max": self.hnsw.m0_max,
                "max_layer": self.hnsw.max_layer,
                "entry_point": self.hnsw.entry_point,
                "graphs": {str(k): v for k, v in self.hnsw.graphs.items()},
                "nodes": {
                    node_id: {
                        "id": vec.id,
                        "values": vec.values.tolist(),
                        "metadata": vec.metadata
                    } for node_id, vec in self.hnsw.nodes.items()
                }
            }
        }
        with open(filepath, "w") as f:
            json.dump(data, f)

    @classmethod
    def load(cls, filepath: str) -> "VectorStore":
        if filepath.endswith('.pkl'):
            filepath = filepath[:-4] + '.json'
            
        with open(filepath, "r") as f:
            data = json.load(f)
            
        store = cls(
            dim=data["dim"], 
            m=data["hnsw"]["m"], 
            ef_construction=data["hnsw"]["ef_construction"]
        )
        store.deleted_ids = set(data.get("deleted_ids", []))
        
        store.hnsw.m0_max = data["hnsw"]["m0_max"]
        store.hnsw.max_layer = data["hnsw"]["max_layer"]
        store.hnsw.entry_point = data["hnsw"]["entry_point"]
        
        graphs = data["hnsw"]["graphs"]
        store.hnsw.graphs = {int(k): v for k, v in graphs.items()}
        
        nodes = data["hnsw"]["nodes"]
        for node_id, node_data in nodes.items():
            vec = Vector(
                id=node_data["id"],
                values=np.array(node_data["values"], dtype=np.float64),
                metadata=node_data.get("metadata", {})
            )
            store.hnsw.nodes[node_id] = vec
            
        return store
