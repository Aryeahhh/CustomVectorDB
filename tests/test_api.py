"""
Unit tests testing the FastAPI layer natively via TestClient.
"""

import unittest
from fastapi.testclient import TestClient
from src.api.main import app, store

class TestFastAPIEndpoints(unittest.TestCase):
    
    def setUp(self):
        self.client = TestClient(app)
        
        # Manually clear the global in-memory store before each test
        store.hnsw.nodes.clear()
        store.hnsw.graphs = {0: {}}
        store.hnsw.entry_point = None
        store.hnsw.max_layer = -1
        store.deleted_ids.clear()
        
    def test_ingest_vector(self):
        response = self.client.post("/vectors", json={
            "id": "doc1",
            "values": [1.0, 2.0, 3.0],
            "metadata": {"author": "Arya"}
        })
        self.assertEqual(response.status_code, 201)
        self.assertEqual(store.hnsw.nodes["doc1"].metadata["author"], "Arya")
        
    def test_search_vectors(self):
        # Insert 2 vectors
        self.client.post("/vectors", json={"id": "doc1", "values": [1.0, 0.0, 0.0]})
        self.client.post("/vectors", json={"id": "doc2", "values": [0.0, 1.0, 0.0]})
        
        response = self.client.post("/search", json={
            "query": [0.9, 0.1, 0.0],
            "k": 1
        })
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        self.assertEqual(len(data["results"]), 1)
        self.assertEqual(data["results"][0]["id"], "doc1")
        
    def test_soft_deletion(self):
        # Ingest and verify
        self.client.post("/vectors", json={"id": "doc1", "values": [1.0, 0.0, 0.0]})
        res = self.client.post("/search", json={"query": [1.0, 0.0, 0.0], "k": 1})
        self.assertEqual(res.json()["results"][0]["id"], "doc1")
        
        # Soft-delete
        del_res = self.client.delete("/vectors/doc1")
        self.assertEqual(del_res.status_code, 200)
        
        # Verify it no longer appears in search since soft_delete excludes it
        res2 = self.client.post("/search", json={"query": [1.0, 0.0, 0.0], "k": 1})
        self.assertEqual(len(res2.json()["results"]), 0)
        
        # Verify 404 on double delete
        del_fail = self.client.delete("/vectors/doc1")
        self.assertEqual(del_fail.status_code, 404)

if __name__ == '__main__':
    unittest.main()
