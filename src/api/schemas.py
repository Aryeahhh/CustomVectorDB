"""
Pydantic schemas for the FastAPI service.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class VectorIngestRequest(BaseModel):
    """Payload to ingest a new mathematical vector."""
    id: str = Field(..., description="Unique user-defined Document ID.")
    values: List[float] = Field(..., description="The high dimensional array of floats.")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Arbitrary JSON payload.")

class VectorSearchRequest(BaseModel):
    """Payload to query for Nearest Neighbors."""
    query: List[float] = Field(..., description="The query embedding.")
    k: int = Field(5, description="Number of approximate nearest neighbors to return.")

class VectorResponse(BaseModel):
    """Serialized vector response."""
    id: str
    metadata: Dict[str, Any]
    
class QueryResponse(BaseModel):
    """Payload returned from a successful neighbor search."""
    results: List[VectorResponse]
