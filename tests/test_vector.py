"""
Unit tests for the core Vector model.
"""

import unittest
import numpy as np
from src.core.vector import Vector

class TestVector(unittest.TestCase):
    
    def test_vector_initialization(self):
        """Test proper initialization of the Vector class."""
        vec = Vector(
            id="doc1", 
            values=np.array([1.0, 2.0, 3.0], dtype=np.float64),
            metadata={"source": "test"}
        )
        self.assertEqual(vec.id, "doc1")
        self.assertEqual(vec.dim, 3)
        self.assertEqual(vec.metadata["source"], "test")

    def test_vector_must_be_1d(self):
        """Vectors should strictly enforce 1D numpy array values."""
        bad_values = np.array([[1.0, 2.0], [3.0, 4.0]], dtype=np.float64)
        with self.assertRaises(ValueError):
            Vector(id="doc_bad", values=bad_values)
            
    def test_vector_equality(self):
        """Test equality comparison between vectors."""
        vec1 = Vector(id="doc1", values=np.array([1.0, 2.0], dtype=np.float64))
        vec2 = Vector(id="doc1", values=np.array([1.0, 2.0], dtype=np.float64))
        vec3 = Vector(id="doc2", values=np.array([1.0, 2.0], dtype=np.float64))
        vec4 = Vector(id="doc1", values=np.array([1.0, 3.0], dtype=np.float64))
        
        self.assertEqual(vec1, vec2)
        self.assertNotEqual(vec1, vec3)
        self.assertNotEqual(vec1, vec4)

if __name__ == '__main__':
    unittest.main()
