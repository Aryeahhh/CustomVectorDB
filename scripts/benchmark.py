"""
Benchmarking script comparing HNSW query performance vs O(N) Brute-Force.
"""

import time
import numpy as np
from src.core.vector import Vector
from src.indexing.hnsw import HNSW
from src.math.metrics import euclidean_distance

def run_benchmark():
    DIM = 128
    NUM_VECTORS = 5000
    NUM_QUERIES = 100
    K = 5
    
    print(f"--- Initialization ---")
    print(f"Dimensionality: {DIM}")
    print(f"Index Size: {NUM_VECTORS}")
    print(f"Query Count: {NUM_QUERIES}")
    
    # Generate vectors
    print("\nGenerating synthetic vectors...")
    rng = np.random.default_rng(42)
    corpus = rng.random((NUM_VECTORS, DIM)).astype(np.float64)
    queries = rng.random((NUM_QUERIES, DIM)).astype(np.float64)
    
    # 1. Build HNSW Index
    print("Building HNSW Graph (M=16, ef_construction=40)...")
    start_time = time.time()
    hnsw = HNSW(m=16, ef_construction=40, seed=42)
    
    # Store raw corpus dict separately for brute force
    raw_dict = {}
    for i in range(NUM_VECTORS):
        vid = f"vec_{i}"
        raw_dict[vid] = corpus[i]
        hnsw.insert(Vector(vid, corpus[i]))
        
    build_time = time.time() - start_time
    print(f"HNSW Build Time: {build_time:.4f}s")
    
    # 2. Benchmark Brute Force O(N)
    print("\nExecuting Brute-Force O(N) Linear Scans...")
    brute_force_results = []
    start_time = time.time()
    
    for q_idx in range(NUM_QUERIES):
        q_arr = queries[q_idx]
        
        # Calculate exact euclidean distance against all N vectors
        distances = []
        for vid, v_arr in raw_dict.items():
            # Linear calculation step O(D) inside O(N) loop
            dist = euclidean_distance(q_arr, v_arr)
            distances.append((dist, vid))
            
        distances.sort(key=lambda x: x[0])
        top_k = [x[1] for x in distances[:K]]
        brute_force_results.append(top_k)
        
    bf_time = time.time() - start_time
    print(f"Total Brute-Force Time: {bf_time:.4f}s")
    print(f"Average Brute-Force Latency per query: {(bf_time / NUM_QUERIES) * 1000:.2f}ms")
    
    # 3. Benchmark HNSW O(log N)
    print("\nExecuting HNSW O(log N) Graph Search...")
    hnsw_results = []
    start_time = time.time()
    
    for q_idx in range(NUM_QUERIES):
        q_arr = queries[q_idx]
        res = hnsw.search(q_arr, k=K)
        hnsw_results.append([v.id for v in res])
        
    hnsw_time = time.time() - start_time
    print(f"Total HNSW Time: {hnsw_time:.4f}s")
    print(f"Average HNSW Latency per query: {(hnsw_time / NUM_QUERIES) * 1000:.2f}ms")
    
    # 4. Recall Accuracy Calculation
    print("\nCalculating Recall Accuracy...")
    total_hits = 0
    total_expected = NUM_QUERIES * K
    
    for bf_top, hnsw_top in zip(brute_force_results, hnsw_results):
        hits = len(set(bf_top).intersection(set(hnsw_top)))
        total_hits += hits
        
    recall = total_hits / total_expected
    speedup = bf_time / hnsw_time if hnsw_time > 0 else float('inf')
    
    print(f"----------------------------------------")
    print(f"HNSW Speedup Factor: {speedup:.2f}x")
    print(f"HNSW Recall@5: {recall * 100:.2f}%")
    print(f"----------------------------------------")
    
if __name__ == "__main__":
    run_benchmark()
