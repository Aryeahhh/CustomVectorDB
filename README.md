# AetherOS Vector DB

A from-scratch vector database built on a custom HNSW implementation, with a WebGL frontend for real-time graph visualization.

## Stack

- **Backend** — Python, FastAPI, NumPy (no ML libraries)
- **Frontend** — React 19, Three.js (`@react-three/fiber`), Zustand, Tailwind CSS v4
- **Search** — Hierarchical Navigable Small World (HNSW) graph, O(log N) ANN search
- **Projection** — Custom NumPy PCA to map N-dimensional vectors into the isometric 3D viewport

## Running locally

**Backend** (port 8000):
```
.\start.ps1
```
or manually:
```
python -m uvicorn src.api.main:app --reload --port 8000
```

**Frontend** (port 5173):
```
cd frontend
npm install
npm run dev
```

## API

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/vectors` | Ingest a vector |
| `POST` | `/search` | k-NN search |
| `POST` | `/search_visualization` | k-NN search with traversal path |
| `GET`  | `/graph` | Full HNSW graph state (PCA-projected) |
| `DELETE` | `/vectors/{id}` | Soft-delete a vector |
| `GET`  | `/system/memory` | Memory footprint |
| `GET`  | `/system/sensors` | Uptime and status |
| `POST` | `/system/deploy` | Flush and re-seed the index |
| `POST` | `/system/persist` | Flush current store to disk |

## Persistence

The store is serialized to disk via pickle. The path is controlled by the `STORE_PATH` environment variable (default: `./data/vector_store.pkl`). On startup, the server loads from this file if it exists.



