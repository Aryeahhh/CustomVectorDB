"""
Core Vector model for the custom Vector Database.
"""

from typing import Dict, Any, Optional
import numpy as np
import numpy.typing as npt

class Vector:
    """
    Represents a single mathematical vector within the database.
    
    This acts as the fundamental storage item, wrapping a NumPy array
    for raw performance while attaching user-facing IDs and payload metadata.
    """
    
    __slots__ = ['id', 'values', 'metadata']
    
    def __init__(
        self, 
        id: str, 
        values: npt.NDArray[np.float64], 
        metadata: Optional[Dict[str, Any]] = None
    ):
        """
        Initializes a Vector.
        
        Args:
            id (str): A unique string identifier for the vector.
            values (npt.NDArray[np.float64]): The raw vector embeddings. Must be 1-dimensional.
            metadata (Optional[Dict[str, Any]]): Arbitrary metadata attached to the vector.
            
        Raises:
            ValueError: If the input array is not 1-dimensional.
        """
        if values.ndim != 1:
             raise ValueError(f"Vector values must be 1-dimensional, got {values.ndim}D")
             
        self.id = id
        self.values = values
        self.metadata = metadata or {}
        
    @property
    def dim(self) -> int:
        """
        Retrieves the dimensionality of the vector.
        
        Time Complexity: O(1)
        
        Returns:
            int: Number of elements in the vector.
        """
        return self.values.shape[0]
        
    def __repr__(self) -> str:
        """String representation of the Vector."""
        return f"Vector(id='{self.id}', dim={self.dim})"

    def __eq__(self, other: Any) -> bool:
        """Equality comparison for Vectors based on ID and values."""
        if not isinstance(other, Vector):
            return False
        return self.id == other.id and np.array_equal(self.values, other.values)
