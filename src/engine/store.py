"""
VectorStore Façade orchestrating the HNSW index and Vector objects.
"""

from typing import List, Set
import numpy as np
from src.core.vector import Vector
from src.indexing.hnsw import HNSW


class VectorStore:
    """
    Central database engine that manages the HNSW index and soft-deletions.
    """

    def __init__(self, dim: int, m: int = 16, ef_construction: int = 40):
        self.dim = dim
        self.hnsw = HNSW(m=m, ef_construction=ef_construction)
        
        # O(1) subset lookup for active vectors vs soft-deleted vectors
        self.deleted_ids: Set[str] = set()

    def add_vector(self, id: str, values: List[float], metadata: dict) -> None:
        """
        Ingests a vector into the store.
        """
        if len(values) != self.dim:
            raise ValueError(f"Expected dimensionality {self.dim}, got {len(values)}.")
            
        # Convert raw python list to numpy optimized float64 array
        np_values = np.array(values, dtype=np.float64)
        vec = Vector(id=id, values=np_values, metadata=metadata)
        
        # If it was previously soft-deleted, simply undelete it.
        # Overwriting values securely in place reduces graph disruption.
        if id in self.deleted_ids:
            self.deleted_ids.remove(id)
            self.hnsw.nodes[id] = vec
        else:
            self.hnsw.insert(vec)
            
    def query(self, query_vals: List[float], k: int = 5) -> List[Vector]:
        """
        Executes a soft-deletion aware ANN search.
        """
        if len(query_vals) != self.dim:
            raise ValueError(f"Query dimensionality {len(query_vals)} does not match store ({self.dim}).")
            
        q_arr = np.array(query_vals, dtype=np.float64)
        
        # O(log N) fast retrieval
        # Request a buffer of extra neighbors to compensate for soft-deletions
        buffer_k = k + len(self.deleted_ids) 
        
        search_k = min(buffer_k, max(len(self.hnsw.nodes), 1))
        raw_results = self.hnsw.search(q_arr, k=search_k)
        
        # Filter deleted points dynamically
        valid_results = [res for res in raw_results if res.id not in self.deleted_ids]
        
        return valid_results[:k]

    def delete(self, vector_id: str) -> bool:
        """
        Soft-deletes a vector in O(1) time.
        """
        if vector_id not in self.hnsw.nodes or vector_id in self.deleted_ids:
            return False
            
        self.deleted_ids.add(vector_id)
        return True
