"""
Visualization utilities for projecting high-dimensional data down to viewable layouts.
"""

import numpy as np

def pca_project_3d(data: np.ndarray) -> np.ndarray:
    """
    Project N-dimensional arrays down to 3 dimensions using Principal Component Analysis (PCA).
    Pure NumPy implementation to adhere to the project's 'No ML Libraries' rule.
    
    Args:
        data (np.ndarray): The dataset matrix of shape (num_vectors, N).
        
    Returns:
        np.ndarray: The projected dataset of shape (num_vectors, 3).
    """
    # 1. Mean-centering the data
    mean_vec = np.mean(data, axis=0)
    centered_data = data - mean_vec
    
    # 2. Compute Covariance Matrix 
    # rowvar=False treats columns as variables (features), rows as observations
    cov_matrix = np.cov(centered_data, rowvar=False)
    
    # 3. Eigendecomposition (eigh is optimized for symmetric matrices)
    eigenvalues, eigenvectors = np.linalg.eigh(cov_matrix)
    
    # 4. Sort to get top 3 Principal Components
    sorted_indices = np.argsort(eigenvalues)[::-1]
    top_indices = sorted_indices[:3]
    top_eigenvectors = eigenvectors[:, top_indices]
    
    # 5. Project original centered data down to the 3D basis
    projected = np.dot(centered_data, top_eigenvectors)
    
    return projected
