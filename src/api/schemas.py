"""
Pydantic schemas for the FastAPI service.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class VectorIngestRequest(BaseModel):
    id: str = Field(..., description="Unique document ID.")
    values: List[float] = Field(..., description="Vector components.")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Arbitrary JSON payload.")


class VectorSearchRequest(BaseModel):
    query: List[float] = Field(..., description="Query vector.")
    k: int = Field(5, description="Number of nearest neighbors to return.")


class VectorResponse(BaseModel):
    id: str
    metadata: Dict[str, Any]
    distance: Optional[float] = None


class QueryResponse(BaseModel):
    results: List[VectorResponse]


class NodePosition(BaseModel):
    id: str
    layer: int
    pos: List[float]
    neighbors: List[str]


class GraphStateResponse(BaseModel):
    nodes: List[NodePosition]


class QueryVisualizationResponse(BaseModel):
    results: List[VectorResponse]
    path: List[Any]
    latency_ms: float = 0.0


class SystemMemoryResponse(BaseModel):
    total_nodes: int
    active_layers: int
    estimated_bytes: int


class SystemSensorsResponse(BaseModel):
    status: str
    uptime_seconds: float
    vector_dim: int


class SystemDeployResponse(BaseModel):
    status: str
    message: str
    nodes_generated: int


class SystemPersistResponse(BaseModel):
    status: str
    message: str
    total_nodes: int

class SystemBenchmarkResponse(BaseModel):
    hnsw_qps: float
    brute_force_qps: float
    recall_at_10: float
