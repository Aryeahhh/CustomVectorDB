"""
FastAPI application for the vector database.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, status
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import os
import time

from src.api.schemas import (
    VectorIngestRequest, VectorSearchRequest, QueryResponse, VectorResponse,
    GraphStateResponse, NodePosition, QueryVisualizationResponse,
    SystemMemoryResponse, SystemSensorsResponse, SystemDeployResponse,
    SystemPersistResponse, SystemBenchmarkResponse
)
from src.engine.store import VectorStore
from src.core.viz_utils import pca_project_3d

VECTOR_DIMENSION = 3
STORE_PATH = os.environ.get("STORE_PATH", "./data/vector_store.json")
SEED_COUNT = 500
MAX_NODES = 10000

store: VectorStore = None
START_TIME: float = 0.0


def _new_store() -> VectorStore:
    return VectorStore(dim=VECTOR_DIMENSION, m=6, ef_construction=32)


def _seed_store(s: VectorStore, count: int = SEED_COUNT) -> None:
    for i in range(count):
        s.add_vector(
            id=f"doc_{i}",
            values=np.random.rand(VECTOR_DIMENSION).tolist(),
            metadata={"source": "vectorcore_seed", "cluster": i % 5}
        )


@asynccontextmanager
async def lifespan(_app: FastAPI):
    global store, START_TIME
    START_TIME = time.time()

    if os.path.exists(STORE_PATH):
        store = VectorStore.load(STORE_PATH)
    else:
        store = _new_store()
        _seed_store(store)
        store.save(STORE_PATH)

    yield


app = FastAPI(
    title="VectorCore",
    description="From-scratch HNSW vector database.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", include_in_schema=False)
def root():
    return RedirectResponse(url="/docs")


@app.get("/health", include_in_schema=False)
def health_check():
    return {"status": "ok"}


@app.post("/vectors", status_code=status.HTTP_201_CREATED)
def ingest_vector(payload: VectorIngestRequest):
    if len(store.hnsw.nodes) >= MAX_NODES:
        raise HTTPException(status_code=400, detail="Database capacity reached. Cannot ingest more vectors.")
        
    try:
        store.add_vector(
            id=payload.id,
            values=payload.values,
            metadata=payload.metadata or {}
        )
        return {"status": "success", "message": f"Successfully ingested vector {payload.id}"}
    except ValueError as e:
        print(f"Ingest Error: {str(e)}")
        raise HTTPException(status_code=400, detail="Invalid vector data provided.")


@app.post("/search", response_model=QueryResponse)
def search_vectors(payload: VectorSearchRequest):
    try:
        results = store.query(query_vals=payload.query, k=payload.k)
        response_data = [VectorResponse(id=vec.id, metadata=vec.metadata) for vec in results]
        return QueryResponse(results=response_data)
    except ValueError as e:
        print(f"Search Error: {str(e)}")
        raise HTTPException(status_code=400, detail="Invalid search query parameters.")



@app.post("/search_visualization", response_model=QueryVisualizationResponse)
def search_visualization(payload: VectorSearchRequest):
    try:
        t0 = time.time()
        results, trace = store.query_with_path(query_vals=payload.query, k=payload.k)
        latency_ms = (time.time() - t0) * 1000
        response_data = [
            VectorResponse(id=vec.id, metadata=vec.metadata, distance=round(dist, 6))
            for vec, dist in results
        ]
        return QueryVisualizationResponse(
            results=response_data, path=trace, latency_ms=round(latency_ms, 2)
        )
    except ValueError as e:
        print(f"Search Viz Error: {str(e)}")
        raise HTTPException(status_code=400, detail="Invalid search query parameters.")


@app.get("/graph", response_model=GraphStateResponse)
def get_graph_state():
    active_node_ids = [n_id for n_id in store.hnsw.nodes if n_id not in store.deleted_ids]

    if not active_node_ids:
        return GraphStateResponse(nodes=[])

    raw_arrays = np.array([store.hnsw.nodes[n].values for n in active_node_ids])
    pca_coords = pca_project_3d(raw_arrays)

    nodes_payload = []
    for idx, node_id in enumerate(active_node_ids):
        layer = 0
        for l in range(store.hnsw.max_layer + 1):
            if store.hnsw.graphs.get(l) and node_id in store.hnsw.graphs[l]:
                layer = max(layer, l)

        neighbors = []
        if store.hnsw.graphs.get(layer) and node_id in store.hnsw.graphs[layer]:
            neighbors = store.hnsw.graphs[layer][node_id]

        nodes_payload.append(
            NodePosition(
                id=node_id,
                layer=layer,
                pos=[float(pca_coords[idx][0] * 10), 0.0, float(pca_coords[idx][2] * 10)],
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


@app.get("/system/memory", response_model=SystemMemoryResponse)
def get_memory_stats():
    nodes = len(store.hnsw.nodes)
    layers = store.hnsw.max_layer + 1
    bytes_est = nodes * (VECTOR_DIMENSION * 8 + 128)
    return SystemMemoryResponse(
        total_nodes=nodes,
        active_layers=layers,
        estimated_bytes=bytes_est
    )


@app.get("/system/sensors", response_model=SystemSensorsResponse)
def get_sensor_stats():
    return SystemSensorsResponse(
        status="ONLINE",
        uptime_seconds=time.time() - START_TIME,
        vector_dim=VECTOR_DIMENSION
    )


@app.post("/system/deploy", response_model=SystemDeployResponse)
def deploy_index():
    global store
    store = _new_store()
    _seed_store(store)
    store.save(STORE_PATH)
    return SystemDeployResponse(
        status="SUCCESS",
        message="HNSW Index Flushed and Re-Deployed.",
        nodes_generated=len(store.hnsw.nodes)
    )


@app.post("/system/persist", response_model=SystemPersistResponse)
def persist_index():
    store.save(STORE_PATH)
    return SystemPersistResponse(
        status="SUCCESS",
        message=f"VectorStore saved to {STORE_PATH}.",
        total_nodes=len(store.hnsw.nodes)
    )

@app.post("/system/benchmark", response_model=SystemBenchmarkResponse)
def run_benchmark():
    num_queries = 100
    k = 10
    
    queries = [np.random.rand(VECTOR_DIMENSION).tolist() for _ in range(num_queries)]
    
    t0 = time.time()
    hnsw_results = []
    for q in queries:
        hnsw_results.append([vec.id for vec in store.query(query_vals=q, k=k)])
    t1 = time.time()
    hnsw_time = t1 - t0
    hnsw_qps = num_queries / max(hnsw_time, 0.0001)
    
    t0 = time.time()
    bf_results = []
    for q in queries:
        bf_results.append([vec.id for vec in store.brute_force_query(query_vals=q, k=k)])
    t1 = time.time()
    bf_time = t1 - t0
    bf_qps = num_queries / max(bf_time, 0.0001)
    
    total_recall = 0
    valid_queries = 0
    for hnsw_res, bf_res in zip(hnsw_results, bf_results):
        if not bf_res:
            continue
        valid_queries += 1
        intersect = set(hnsw_res).intersection(set(bf_res))
        total_recall += len(intersect) / len(bf_res)
        
    recall_at_10 = (total_recall / valid_queries) * 100 if valid_queries > 0 else 0.0
    
    return SystemBenchmarkResponse(
        hnsw_qps=round(hnsw_qps, 2),
        brute_force_qps=round(bf_qps, 2),
        recall_at_10=round(recall_at_10, 2)
    )
