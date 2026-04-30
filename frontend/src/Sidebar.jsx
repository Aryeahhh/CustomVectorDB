import React from 'react';
import { useVectorStore } from './store/store';

function StatRow({ label, value, accent }) {
    return (
        <div className="flex justify-between items-center border border-blueprint-border p-2">
            <span className="font-label text-label text-blueprint-border uppercase tracking-widest">{label}</span>
            <span className={`font-data-lg text-data-lg ${accent ? 'text-blueprint-accent' : 'text-on-surface'}`}>{value}</span>
        </div>
    );
}

export default function Sidebar({ activePanel, isOpen, onClose }) {
    const activeNodeId = useVectorStore((state) => state.activeNodeId);
    const graphData = useVectorStore((state) => state.graphData);
    const isSearching = useVectorStore((state) => state.isSearching);
    const deleteVector = useVectorStore((state) => state.deleteVector);
    const runBenchmark = useVectorStore((state) => state.runBenchmark);
    const benchmarkResults = useVectorStore((state) => state.benchmarkResults);
    const isBenchmarking = useVectorStore((state) => state.isBenchmarking);
    const searchQuery = useVectorStore((state) => state.searchQuery);
    const executeSearch = useVectorStore((state) => state.executeSearch);
    const searchResults = useVectorStore((state) => state.searchResults);
    const searchPath = useVectorStore((state) => state.searchPath);
    const searchLatency = useVectorStore((state) => state.searchLatency);
    const activeLayerFilters = useVectorStore((state) => state.activeLayerFilters);
    const toggleLayerFilter = useVectorStore((state) => state.toggleLayerFilter);
    const systemMemory = useVectorStore((state) => state.systemMemory);
    const systemSensors = useVectorStore((state) => state.systemSensors);

    const activeNode = activeNodeId !== null ? graphData[activeNodeId] : null;

    const maxLayer = graphData.reduce((max, n) => Math.max(max, n.layer), 0);
    const layerLabels = ['Base Graph', 'Skiplist', 'Express', 'Highway', 'Apex', 'Summit'];

    return (
        <div className={`w-80 flex flex-col bg-[#0F1115] border-l border-blueprint-border h-full overflow-y-auto absolute right-0 top-0 z-40 transform transition-transform duration-200 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} md:relative md:translate-x-0`}>

            {activePanel === 'nearest' && (
                <div className="flex-1 flex flex-col">
                    <div className="bg-slate-900/50 p-2 border-b border-blueprint-border flex items-center justify-between">
                        <span className="font-data-sm text-data-sm text-blueprint-accent uppercase tracking-widest">LIVE_TELEMETRY</span>
                        <button className="md:hidden text-blueprint-border hover:text-blueprint-accent flex items-center" onClick={onClose}>
                            <span className="material-symbols-outlined text-[18px]">close</span>
                        </button>
                    </div>
                    <div className="p-3 min-h-[140px]">
                        {activeNode ? (
                            <div className="space-y-3">
                                <div className="flex justify-between font-label text-label text-blueprint-border border-b border-blueprint-border pb-1">
                                    <span>METRIC</span><span>VALUE</span>
                                </div>
                                <div className="flex justify-between font-data-sm text-data-sm text-on-surface">
                                    <span>NODE_ID</span>
                                    <span className="text-blueprint-accent">{activeNode.id}</span>
                                </div>
                                <div className="flex justify-between font-data-sm text-data-sm text-on-surface">
                                    <span>HNSW_LAYER</span>
                                    <span className="px-1 border border-blueprint-accent text-blueprint-accent">L{activeNode.layer}</span>
                                </div>
                                <div className="flex justify-between font-data-sm text-data-sm text-on-surface">
                                    <span>CONNECTIONS</span>
                                    <span>{activeNode.neighbors.length}</span>
                                </div>
                                <div className="pt-2 border-t border-blueprint-border mt-2">
                                    <button 
                                        onClick={() => deleteVector(activeNode.id)}
                                        className="w-full border border-red-500/50 text-red-400 hover:bg-red-500 hover:text-white p-2 font-data-sm text-xs uppercase tracking-widest transition-colors"
                                    >
                                        DELETE NODE
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p className="font-data-sm text-[10px] text-blueprint-border leading-relaxed uppercase tracking-widest text-center pt-8">
                                HOVER A VECTOR POINT FOR TELEMETRY
                            </p>
                        )}
                    </div>

                    <div className="border-t border-blueprint-border">
                        <div className="bg-slate-900/50 p-2 border-b border-blueprint-border">
                            <span className="font-data-sm text-data-sm text-blueprint-accent uppercase tracking-widest">SEARCH_RESULTS</span>
                        </div>
                        <div className="p-2">
                            {searchResults.length > 0 ? (
                                <div className="space-y-1">
                                    <div className="flex justify-between font-label text-label text-blueprint-border pb-1 border-b border-blueprint-border">
                                        <span>VECTOR_ID</span><span>L2 DIST</span>
                                    </div>
                                    {searchResults.map((r, i) => (
                                        <div key={r.id} className={`flex justify-between font-data-sm text-data-sm p-1 ${i === 0 ? 'text-blueprint-accent border border-blueprint-accent' : 'text-on-surface hover:bg-slate-800'}`}>
                                            <span>{r.id}</span>
                                            <span className="text-right tabular-nums opacity-70">{r.distance != null ? r.distance.toFixed(4) : '—'}</span>
                                        </div>
                                    ))}
                                    <div className="mt-2 space-y-1 font-label text-[9px] text-blueprint-border uppercase tracking-widest">
                                        <p>PATH: {searchPath.length} NODES TRAVERSED</p>
                                        {searchLatency > 0 && <p>LATENCY: {searchLatency.toFixed(2)} ms</p>}
                                    </div>
                                </div>
                            ) : (
                                <p className="font-data-sm text-[10px] text-blueprint-border uppercase tracking-widest text-center py-4">
                                    EXECUTE SEARCH TO VIEW RESULTS
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="p-4 mt-auto border-t border-blueprint-border">
                        <button
                            className={`w-full border border-blueprint-accent p-3 font-data-sm text-sm uppercase tracking-widest transition-all ${isSearching ? 'bg-blueprint-accent text-blueprint-bg animate-pulse' : 'text-blueprint-accent hover:bg-blueprint-accent/10'}`}
                            onClick={() => {
                                const floats = searchQuery.split(',').map(s => parseFloat(s.trim())).filter(f => !isNaN(f));
                                if (floats.length === 3) {
                                    executeSearch(floats);
                                } else {
                                    executeSearch();
                                }
                            }}
                            disabled={isSearching}
                        >
                            {isSearching ? 'TRACING_PATH...' : (searchQuery.trim() ? 'EXECUTE_HNSW_SEARCH' : 'EXECUTE_RANDOM_SEARCH')}
                        </button>
                    </div>
                </div>
            )}

            {activePanel === 'metrics' && (
                <div className="flex-1 flex flex-col">
                    <div className="bg-slate-900/50 p-2 border-b border-blueprint-border flex items-center justify-between">
                        <span className="font-data-sm text-data-sm text-blueprint-accent uppercase tracking-widest">ALGORITHMIC_METRICS</span>
                        <button className="md:hidden text-blueprint-border hover:text-blueprint-accent flex items-center" onClick={onClose}>
                            <span className="material-symbols-outlined text-[18px]">close</span>
                        </button>
                    </div>
                    <div className="p-4 flex flex-col gap-3">
                        <StatRow label="SEARCH" value="O(log N)" />
                        <StatRow label="INSERT" value="O(log N)" />
                        <StatRow label="DELETE" value="O(1)" accent />
                        <StatRow label="TOTAL NODES" value={graphData.length} accent />
                        <StatRow label="LAYERS" value={maxLayer + 1} accent />
                        <StatRow label="DIMENSION" value="3" />
                        <StatRow label="METRIC" value="L2" />
                        {searchPath.length > 0 && (
                            <StatRow label="LAST TRAVERSAL" value={`${searchPath.length} hops`} accent />
                        )}
                    </div>
                </div>
            )}

            {activePanel === 'hnsw' && (
                <div className="flex-1 flex flex-col">
                    <div className="bg-slate-900/50 p-2 border-b border-blueprint-border flex items-center justify-between">
                        <span className="font-data-sm text-data-sm text-blueprint-accent uppercase tracking-widest">LAYER_CONTROLS</span>
                        <button className="md:hidden text-blueprint-border hover:text-blueprint-accent flex items-center" onClick={onClose}>
                            <span className="material-symbols-outlined text-[18px]">close</span>
                        </button>
                    </div>
                    <div className="p-4 space-y-4">
                        {Array.from({ length: maxLayer + 1 }, (_, l) => {
                            const count = graphData.filter(n => n.layer === l).length;
                            return (
                                <label key={l} className="flex items-center gap-3 cursor-crosshair group" onClick={() => toggleLayerFilter(l)}>
                                    <div className={`w-4 h-4 border bg-blueprint-bg flex items-center justify-center ${activeLayerFilters[l] ? 'border-blueprint-accent' : 'border-blueprint-border group-hover:border-blueprint-accent'}`}>
                                        {activeLayerFilters[l] && <div className="w-2 h-2 bg-blueprint-accent"></div>}
                                    </div>
                                    <div className="flex-1 flex justify-between items-center">
                                        <span className={`font-data-sm text-[10px] uppercase tracking-widest ${activeLayerFilters[l] ? 'text-on-surface' : 'text-blueprint-border'}`}>
                                            L{l} ({layerLabels[l] || `Layer ${l}`})
                                        </span>
                                        <span className="font-data-sm text-[10px] text-blueprint-border">{count}</span>
                                    </div>
                                </label>
                            );
                        })}
                    </div>
                    <div className="p-4 border-t border-blueprint-border">
                        <p className="font-label text-[9px] text-blueprint-border leading-relaxed uppercase tracking-widest">
                            Toggle layers to isolate specific routing levels of the HNSW graph structure.
                        </p>
                    </div>
                </div>
            )}

            {activePanel === 'sensors' && (
                <div className="flex-1 flex flex-col">
                    <div className="bg-slate-900/50 p-2 border-b border-blueprint-border flex items-center justify-between">
                        <span className="font-data-sm text-data-sm text-blueprint-accent uppercase tracking-widest">SENSOR_READOUT</span>
                        <button className="md:hidden text-blueprint-border hover:text-blueprint-accent flex items-center" onClick={onClose}>
                            <span className="material-symbols-outlined text-[18px]">close</span>
                        </button>
                    </div>
                    <div className="p-4 flex flex-col gap-3">
                        {systemSensors ? (
                            <>
                                <StatRow label="STATUS" value={systemSensors.status} accent />
                                <StatRow label="UPTIME" value={`${systemSensors.uptime_seconds.toFixed(1)}s`} accent />
                                <StatRow label="VECTOR DIM" value={systemSensors.vector_dim} />
                                <div className="mt-4 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-green-400 animate-pulse block"></span>
                                    <span className="font-data-sm text-[10px] text-green-400 uppercase tracking-widest">ALL SYSTEMS NOMINAL</span>
                                </div>
                            </>
                        ) : (
                            <p className="font-data-sm text-data-sm text-blueprint-border uppercase tracking-widest text-center py-8">FETCHING...</p>
                        )}
                    </div>
                </div>
            )}

            {activePanel === 'memory' && (
                <div className="flex-1 flex flex-col">
                    <div className="bg-slate-900/50 p-2 border-b border-blueprint-border flex items-center justify-between">
                        <span className="font-data-sm text-data-sm text-blueprint-accent uppercase tracking-widest">MEMORY_MAP</span>
                        <button className="md:hidden text-blueprint-border hover:text-blueprint-accent flex items-center" onClick={onClose}>
                            <span className="material-symbols-outlined text-[18px]">close</span>
                        </button>
                    </div>
                    <div className="p-4 flex flex-col gap-3">
                        {systemMemory ? (
                            <>
                                <StatRow label="TOTAL NODES" value={systemMemory.total_nodes} accent />
                                <StatRow label="ACTIVE LAYERS" value={systemMemory.active_layers} accent />
                                <StatRow label="EST. BYTES" value={systemMemory.estimated_bytes.toLocaleString()} />
                                <StatRow label="EST. KB" value={(systemMemory.estimated_bytes / 1024).toFixed(1)} />
                                <div className="mt-2 w-full bg-slate-800 h-2">
                                    <div className="h-full bg-blueprint-accent" style={{ width: `${Math.min((systemMemory.total_nodes / 1000) * 100, 100)}%` }}></div>
                                </div>
                                <p className="font-label text-[9px] text-blueprint-border uppercase tracking-widest">
                                    CAPACITY: {systemMemory.total_nodes}/1000 VECTORS
                                </p>
                            </>
                        ) : (
                            <p className="font-data-sm text-data-sm text-blueprint-border uppercase tracking-widest text-center py-8">FETCHING...</p>
                        )}
                    </div>
                </div>
            )}

            {activePanel === 'benchmarking' && (
                <div className="flex-1 flex flex-col">
                    <div className="bg-slate-900/50 p-2 border-b border-blueprint-border flex items-center justify-between">
                        <span className="font-data-sm text-data-sm text-blueprint-accent uppercase tracking-widest">BENCHMARKING</span>
                        <button className="md:hidden text-blueprint-border hover:text-blueprint-accent flex items-center" onClick={onClose}>
                            <span className="material-symbols-outlined text-[18px]">close</span>
                        </button>
                    </div>
                    <div className="p-4 flex flex-col gap-3">
                        {benchmarkResults ? (
                            <>
                                <StatRow label="HNSW QPS" value={benchmarkResults.hnsw_qps} accent />
                                <StatRow label="BRUTE FORCE QPS" value={benchmarkResults.brute_force_qps} />
                                <StatRow label="RECALL@10" value={`${benchmarkResults.recall_at_10}%`} accent />
                                <div className="mt-4 border-t border-blueprint-border pt-4">
                                    <p className="font-label text-[10px] text-blueprint-border uppercase tracking-widest mb-2">SPEEDUP MULTIPLIER</p>
                                    <p className="font-data-lg text-2xl text-blueprint-accent">
                                        {(benchmarkResults.hnsw_qps / Math.max(benchmarkResults.brute_force_qps, 1)).toFixed(1)}x
                                    </p>
                                </div>
                            </>
                        ) : (
                            <p className="font-data-sm text-[10px] text-blueprint-border leading-relaxed uppercase tracking-widest text-center py-8">
                                RUN BENCHMARK TO COMPARE HNSW VS BRUTE FORCE
                            </p>
                        )}
                    </div>
                    <div className="p-4 mt-auto border-t border-blueprint-border">
                        <button
                            className={`w-full border border-blueprint-accent p-3 font-data-sm text-sm uppercase tracking-widest transition-all ${isBenchmarking ? 'bg-blueprint-accent text-blueprint-bg animate-pulse' : 'text-blueprint-accent hover:bg-blueprint-accent/10'}`}
                            onClick={() => runBenchmark()}
                            disabled={isBenchmarking}
                        >
                            {isBenchmarking ? 'RUNNING...' : 'RUN BENCHMARK'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
