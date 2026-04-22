"""
Unit tests for the Locality-Sensitive Hashing module.
"""

import unittest
import numpy as np
from src.core.vector import Vector
from src.indexing.lsh import LocalitySensitiveHashing

class TestLSH(unittest.TestCase):
    
    def test_lsh_hashing_consistency(self):
        """Ensure identical vectors receive the exact same hash."""
        lsh = LocalitySensitiveHashing(dim=128, num_planes=8, seed=42)
        vec_values = np.random.rand(128)
        
        hash1 = lsh._hash_vector(vec_values)
        hash2 = lsh._hash_vector(vec_values)
        
        self.assertEqual(hash1, hash2)
        self.assertEqual(len(hash1), 8)

    def test_lsh_indexing_and_querying(self):
        """Test if indexed vectors can be accurately retrieved from their buckets."""
        lsh = LocalitySensitiveHashing(dim=3, num_planes=2, seed=42)
        
        # Create vectors highly correlated so they land in the same bucket
        v1 = Vector("doc1", np.array([1.0, 0.9, 0.1]))
        v2 = Vector("doc2", np.array([1.0, 0.8, 0.2]))
        
        # A completely orthogonal/opposite vector that should land elsewhere
        v3 = Vector("doc3", np.array([-1.0, -0.9, -0.1])) 
        
        lsh.index(v1)
        lsh.index(v2)
        lsh.index(v3)
        
        # Querying with v1's values should retrieve at least doc1 and likely doc2
        results = lsh.query_bucket(v1.values)
        
        self.assertIn("doc1", results)
        self.assertIn("doc2", results)
        self.assertNotIn("doc3", results)
        
    def test_dimension_mismatch(self):
        """LSH should reject vectors with mismatched dimensions."""
        lsh = LocalitySensitiveHashing(dim=5, num_planes=3)
        bad_vec = Vector("bad", np.array([1.0, 2.0]))
        
        with self.assertRaises(ValueError):
            lsh.index(bad_vec)
            
        with self.assertRaises(ValueError):
            lsh.query_bucket(bad_vec.values)

if __name__ == '__main__':
    unittest.main()
