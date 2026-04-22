"""
Locality-Sensitive Hashing (LSH) implementation.

This module provides a purely NumPy-driven random projection LSH engine
for approximate nearest neighbor search via angular (cosine) distance.
"""

from typing import Dict, List
import numpy as np
import numpy.typing as npt
from src.core.vector import Vector

class LocalitySensitiveHashing:
    """
    Random Projection LSH index for angular (cosine) similarity.
    
    Generates random hyperplanes. Vectors are hashed based on which side
    of each hyperplane they land on, creating a binary bucket key.
    """
    
    def __init__(self, dim: int, num_planes: int, seed: int = 42):
        """
        Initializes the LSH index with random hyperplanes.
        
        Args:
            dim (int): Dimensionality of the input vectors.
            num_planes (int): Number of random projection hyperplanes. 
                              Determines the number of bits in the hash.
            seed (int): Random seed for reproducibility.
        """
        self.dim = dim
        self.num_planes = num_planes
        
        # Time Complexity to generate: O(D * P) where D=dim, P=num_planes
        # Space Complexity: O(D * P)
        rng = np.random.default_rng(seed)
        self.planes: npt.NDArray[np.float64] = rng.standard_normal((dim, num_planes))
        
        # Hash table: maps string hash keys to lists of Vector IDs
        self.hash_table: Dict[str, List[str]] = {}

    def _hash_vector(self, values: npt.NDArray[np.float64]) -> str:
        """
        Computes the LSH hash for a single vector.
        
        Time Complexity: O(D * P) where D is vector dim, P is number of planes.
        Space Complexity: O(P) to store the result boolean array temporarily.
        
        Args:
            values: A 1D numpy array representing the vector.
            
        Returns:
            str: A string of '0's and '1's representing the binary hash key.
        """
        # Dot product with all planes at once. Shape: (num_planes,)
        # True if positive (one side of hyperplane), False if negative
        projections = np.dot(values, self.planes)
        binary_hash = (projections > 0).astype(int)
        
        # Convert array of 0s and 1s to string key
        return "".join(binary_hash.astype(str))

    def index(self, vector: Vector) -> None:
        """
        Hashes and inserts a vector into the appropriate LSH bucket.
        
        Time Complexity: O(D * P) to hash.
        Space Complexity: O(1) beyond the storage inside the bucket lists.
        
        Args:
            vector (Vector): The vector to index.
        """
        if vector.dim != self.dim:
            raise ValueError(f"Vector dim {vector.dim} does not match LSH dim {self.dim}")
            
        key = self._hash_vector(vector.values)
        if key not in self.hash_table:
            self.hash_table[key] = []
        self.hash_table[key].append(vector.id)

    def query_bucket(self, values: npt.NDArray[np.float64]) -> List[str]:
        """
        Retrieves all vector IDs residing in the same bucket as the query vector.
        
        Time Complexity: O(D * P) to hash + O(1) dictionary lookup.
        Space Complexity: O(C) where C is the number of items in the returned bucket.
        
        Args:
            values: Query vector array.
            
        Returns:
            List[str]: List of vector IDs in the matched bucket.
        """
        if values.shape[0] != self.dim:
             raise ValueError(f"Query vector dim {values.shape[0]} does not match LSH dim {self.dim}")
             
        key = self._hash_vector(values)
        return self.hash_table.get(key, [])
