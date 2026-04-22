"""
Mathematical metrics module for vector operations.

This module provides strictly vectorized operations using NumPy to compute
distances and similarities between vectors. It avoids Python loops to leverage
the C-level performance of NumPy.
"""

import numpy as np
import numpy.typing as npt

def euclidean_distance(a: npt.NDArray[np.float64], b: npt.NDArray[np.float64]) -> float:
    """
    Computes the exact Euclidean distance (L2 norm) between two vectors.
    
    Time Complexity:
        O(D) where D is the dimensionality of the vectors. NumPy vectorizes this,
        but mathematically it scales linearly with the number of dimensions.
        
    Space Complexity:
        O(D) to store the intermediate difference vector (a - b) before summing.

    Args:
        a (npt.NDArray[np.float64]): First vector.
        b (npt.NDArray[np.float64]): Second vector.

    Returns:
        float: The Euclidean distance between vector a and b.
        
    Raises:
        ValueError: If vectors have mismatched dimensions.
    """
    if a.shape != b.shape:
        raise ValueError(f"Vector dimension mismatch: {a.shape} vs {b.shape}")
        
    return float(np.linalg.norm(a - b))

def cosine_similarity(a: npt.NDArray[np.float64], b: npt.NDArray[np.float64]) -> float:
    """
    Computes the cosine similarity between two vectors.
    
    Time Complexity:
        O(D) where D is the dimensionality. We compute the dot product and 
        two L2 norms, each taking O(D) time sequentially.
        
    Space Complexity:
        O(1) auxiliary space beyond the inputs, as dot product and norms 
        reduce to scalar values immediately without large intermediate structures.

    Args:
        a (npt.NDArray[np.float64]): First vector.
        b (npt.NDArray[np.float64]): Second vector.

    Returns:
        float: The cosine similarity [-1.0, 1.0].
               Returns 0.0 if either vector is a zero vector to avoid division by zero.
               
    Raises:
        ValueError: If vectors have mismatched dimensions.
    """
    if a.shape != b.shape:
        raise ValueError(f"Vector dimension mismatch: {a.shape} vs {b.shape}")
        
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    
    if norm_a == 0 or norm_b == 0:
        return 0.0
        
    return float(np.dot(a, b) / (norm_a * norm_b))
