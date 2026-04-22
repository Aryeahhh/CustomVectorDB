"""
PCA projection utilities for dimensionality reduction.
"""

import numpy as np


def pca_project_3d(data: np.ndarray) -> np.ndarray:
    """
    Project N-dimensional data down to 3 components via PCA.
    Pure NumPy — no sklearn dependency.
    """
    mean_vec = np.mean(data, axis=0)
    centered = data - mean_vec

    cov_matrix = np.cov(centered, rowvar=False)
    eigenvalues, eigenvectors = np.linalg.eigh(cov_matrix)

    sorted_idx = np.argsort(eigenvalues)[::-1]
    top_vecs = eigenvectors[:, sorted_idx[:3]]

    return np.dot(centered, top_vecs)
