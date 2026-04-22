"""
VectorStore: facade over the HNSW index with soft-delete and persistence.
"""

from typing import List, Set
import os
import pickle
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

    def delete(self, vector_id: str) -> bool:
        if vector_id not in self.hnsw.nodes or vector_id in self.deleted_ids:
            return False
        self.deleted_ids.add(vector_id)
        return True

    def save(self, filepath: str) -> None:
        os.makedirs(os.path.dirname(filepath) or ".", exist_ok=True)
        with open(filepath, "wb") as f:
            pickle.dump(self, f, protocol=pickle.HIGHEST_PROTOCOL)

    @classmethod
    def load(cls, filepath: str) -> "VectorStore":
        with open(filepath, "rb") as f:
            return pickle.load(f)
