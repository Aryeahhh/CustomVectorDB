"""
FastAPI application routing and dependency injection.
"""

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
import numpy as np

from src.api.schemas import (
    VectorIngestRequest, VectorSearchRequest, QueryResponse, VectorResponse,
    GraphStateResponse, NodePosition, QueryVisualizationResponse
)
from src.engine.store import VectorStore
from src.core.viz_utils import pca_project_3d

app = FastAPI(
    title="Custom Vector DB",
    description="A purely mathematical, from-scratch vector database powered by HNSW.",
    version="1.0.0"
)

# Secure WebGL Frontend Bridge
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Highly permissive for Vercel Free Tier routing. Can be tightened in Prod.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

VECTOR_DIMENSION = 3
store = VectorStore(dim=VECTOR_DIMENSION)

@app.post("/vectors", status_code=status.HTTP_201_CREATED)
def ingest_vector(payload: VectorIngestRequest):
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
    try:
        results = store.query(query_vals=payload.query, k=payload.k)
        response_data = [VectorResponse(id=vec.id, metadata=vec.metadata) for vec in results]
        return QueryResponse(results=response_data)
    except ValueError as e:
         raise HTTPException(status_code=400, detail=str(e))

@app.post("/search_visualization", response_model=QueryVisualizationResponse)
def search_visualization(payload: VectorSearchRequest):
    """
    Executes algorithmic nearest neighbor search while recording the physical paths traversed.
    """
    try:
        # Route specifically to the tracking array function
        results, trace = store.query_with_path(query_vals=payload.query, k=payload.k)
        response_data = [VectorResponse(id=vec.id, metadata=vec.metadata) for vec in results]
        
        return QueryVisualizationResponse(results=response_data, path=trace)
    except ValueError as e:
         raise HTTPException(status_code=400, detail=str(e))

@app.get("/graph", response_model=GraphStateResponse)
def get_graph_state():
    """
    Serializes the entire structural topology of the HNSW database, executes pure-numpy
    PCA dimensional reduction, and strings it to the Three.JS WebGL frontend.
    """
    active_node_ids = [n_id for n_id in store.hnsw.nodes.keys() if n_id not in store.deleted_ids]
    
    if not active_node_ids:
        return GraphStateResponse(nodes=[])
        
    # Extract raw N-dimensional arrays
    raw_arrays = np.array([store.hnsw.nodes[n].values for n in active_node_ids])
    
    # Compress mathematically strictly via PCA down to X, Z WebGL coordinates
    # For a 3D VectorDB it's already 3D, but PCA makes it dynamically agnostic
    pca_coords = pca_project_3d(raw_arrays)
    
    nodes_payload = []
    
    for idx, node_id in enumerate(active_node_ids):
        # Calculate maximum layer assignment for this node structurally
        layer = 0
        for l in range(store.hnsw.max_layer + 1):
            if store.hnsw.graphs.get(l) and node_id in store.hnsw.graphs[l]:
                layer = max(layer, l)
                
        # Resolve mathematical proxy neighbors
        neighbors = []
        if store.hnsw.graphs.get(layer) and node_id in store.hnsw.graphs[layer]:
            # Provide neighbors strictly within its highest routing layer
            neighbors = store.hnsw.graphs[layer][node_id]
            
        nodes_payload.append(
            NodePosition(
                id=node_id,
                layer=layer,
                pos=[float(pca_coords[idx][0]), 0.0, float(pca_coords[idx][2])], # Y is resolved natively by frontend Engine
                neighbors=neighbors
            )
        )
        
    return GraphStateResponse(nodes=nodes_payload)

@app.delete("/vectors/{vector_id}")
def delete_vector(vector_id: str):
    success = store.delete(vector_id)
    if not success:
        raise HTTPException(status_code=404, detail="Vector not found or already deleted.")
    return {"status": "success", "message": f"Vector {vector_id} soft-deleted."}
