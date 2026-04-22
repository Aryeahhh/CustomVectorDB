"""
FastAPI application routing and dependency injection.
"""

from fastapi import FastAPI, HTTPException, status

from src.api.schemas import VectorIngestRequest, VectorSearchRequest, QueryResponse, VectorResponse
from src.engine.store import VectorStore

app = FastAPI(
    title="Custom Vector DB",
    description="A purely mathematical, from-scratch vector database powered by HNSW.",
    version="1.0.0"
)

# Global Store Instance (For simplicity, we use global state. In prod, this might be injected)
# We default to a dimensionality of 3 for testing, but ideally this is configured via env
VECTOR_DIMENSION = 3
store = VectorStore(dim=VECTOR_DIMENSION)


@app.post("/vectors", status_code=status.HTTP_201_CREATED)
def ingest_vector(payload: VectorIngestRequest):
    """
    Ingests a new mathematical vector into the indexing engine.
    """
    try:
        store.add_vector(
            id=payload.id,
            values=payload.values,
            metadata=payload.metadata or {}
        )
        return {"status": "success", "message": f"Successfully ingested vector {payload.id}"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/search", response_model=QueryResponse)
def search_vectors(payload: VectorSearchRequest):
    """
    Queries the HNSW graph for the nearest approximate neighbors.
    """
    try:
        results = store.query(query_vals=payload.query, k=payload.k)
        
        # Serialize the internal Vector objects to Pydantic responses
        response_data = [
            VectorResponse(id=vec.id, metadata=vec.metadata)
            for vec in results
        ]
        
        return QueryResponse(results=response_data)
        
    except ValueError as e:
         raise HTTPException(status_code=400, detail=str(e))


@app.delete("/vectors/{vector_id}")
def delete_vector(vector_id: str):
    """
    Soft-deletes a vector from the database.
    """
    success = store.delete(vector_id)
    if not success:
        raise HTTPException(status_code=404, detail="Vector not found or already deleted.")
        
    return {"status": "success", "message": f"Vector {vector_id} soft-deleted."}
