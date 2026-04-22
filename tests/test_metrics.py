"""
Unit tests for the mathematical metrics module.
"""

import unittest
import numpy as np
from src.math.metrics import euclidean_distance, cosine_similarity

class TestMetrics(unittest.TestCase):
    
    def setUp(self):
        """Prepare sample vectors for each test."""
        self.vec_a = np.array([1.0, 0.0, 0.0], dtype=np.float64)
        self.vec_b = np.array([0.0, 1.0, 0.0], dtype=np.float64)
        self.vec_c = np.array([1.0, 1.0, 0.0], dtype=np.float64)
    
    def test_euclidean_distance(self):
        """Test exactly Euclidean calculations."""
        # Distance between [1,0,0] and [0,1,0] should be sqrt(2) ≈ 1.41421356
        dist = euclidean_distance(self.vec_a, self.vec_b)
        self.assertAlmostEqual(dist, np.sqrt(2.0), places=6)
        
        # Distance to self is 0
        self.assertEqual(euclidean_distance(self.vec_a, self.vec_a), 0.0)
        
    def test_euclidean_dimension_mismatch(self):
        """Ensure mismatching dimensions raise ValueErrors for Euclidean."""
        bad_vec = np.array([1.0, 0.0], dtype=np.float64)
        with self.assertRaises(ValueError):
            euclidean_distance(self.vec_a, bad_vec)

    def test_cosine_similarity(self):
        """Test Cosine calculations bounded [-1.0, 1.0]."""
        # Orthogonal vectors -> cosine similarity = 0.0
        self.assertAlmostEqual(cosine_similarity(self.vec_a, self.vec_b), 0.0, places=6)
        
        # Same vector -> cosine similarity = 1.0
        self.assertAlmostEqual(cosine_similarity(self.vec_a, self.vec_a), 1.0, places=6)
        
        # Parallel but different magnitude
        vec_double = np.array([2.0, 0.0, 0.0], dtype=np.float64)
        self.assertAlmostEqual(cosine_similarity(self.vec_a, vec_double), 1.0, places=6)
        
        # Opposite vectors -> cosine similarity = -1.0
        vec_opp = np.array([-1.0, 0.0, 0.0], dtype=np.float64)
        self.assertAlmostEqual(cosine_similarity(self.vec_a, vec_opp), -1.0, places=6)

    def test_cosine_zero_vector(self):
        """Zero vectors should return 0.0 similarity cleanly without exceptions."""
        zero_vec = np.array([0.0, 0.0, 0.0], dtype=np.float64)
        self.assertEqual(cosine_similarity(self.vec_a, zero_vec), 0.0)
        
    def test_cosine_dimension_mismatch(self):
        """Ensure mismatching dimensions raise ValueErrors for Cosine."""
        bad_vec = np.array([1.0, 0.0], dtype=np.float64)
        with self.assertRaises(ValueError):
            cosine_similarity(self.vec_a, bad_vec)

if __name__ == '__main__':
    unittest.main()
