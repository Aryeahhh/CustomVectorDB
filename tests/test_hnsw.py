"""
Unit tests for the HNSW module.
"""

import unittest
import numpy as np
from src.core.vector import Vector
from src.indexing.hnsw import HNSW

class TestHNSW(unittest.TestCase):
    
    def test_hnsw_insertion_and_search(self):
        """Test HNSW constructs graph correctly and retrieves nearest neighbors."""
        hnsw = HNSW(m=16, ef_construction=16, seed=42)
        
        # Insert 100 random vectors
        vectors = []
        np.random.seed(42)
        for i in range(100):
            values = np.random.rand(10)
            vec = Vector(id=f"doc_{i}", values=values)
            vectors.append(vec)
            hnsw.insert(vec)
            
        # The query will be an exact duplicate of doc_50
        query_vec = vectors[50].values
        
        results = hnsw.search(query_vec, k=3)
        
        # Check that we got results
        self.assertTrue(len(results) > 0)
        
        # Since the query is an exact match for doc_50, it should be the top result
        self.assertEqual(results[0].id, "doc_50")
        
    def test_empty_graph(self):
        """Ensure search fails gracefully on an empty graph."""
        hnsw = HNSW()
        results = hnsw.search(np.array([1.0, 2.0]), k=3)
        self.assertEqual(len(results), 0)

if __name__ == '__main__':
    unittest.main()
