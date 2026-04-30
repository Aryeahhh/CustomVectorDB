import { create } from 'zustand';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const useVectorStore = create((set, get) => ({
    graphData: [],
    setGraphData: (data) => set({ graphData: data }),

    activeNodeId: null,
    setActiveNodeId: (nodeId) => set({ activeNodeId: nodeId }),

    searchPath: [],
    setSearchPath: (path) => set({ searchPath: path }),

    searchResults: [],
    searchLatency: 0,
    searchQuery: "",
    setSearchQuery: (query) => set({ searchQuery: query }),

    isSearching: false,

    clearSearchState: () => set({
        searchPath: [],
        searchResults: [],
        searchLatency: 0,
        activeNodeId: null,
        searchQuery: ""
    }),

    activeLayerFilters: {},
    initLayerFilters: (maxLayer) => {
        const filters = {};
        for (let i = 0; i <= maxLayer; i++) filters[i] = true;
        set({ activeLayerFilters: filters });
    },
    toggleLayerFilter: (layer) => set((state) => ({
        activeLayerFilters: { ...state.activeLayerFilters, [layer]: !state.activeLayerFilters[layer] }
    })),

    systemMemory: null,
    systemSensors: null,

    executeSearch: async (queryVector = null) => {
        if (get().isSearching) return;
        set({ isSearching: true, searchResults: [], searchPath: [], searchLatency: 0 });
        try {
            const q = queryVector || [Math.random(), Math.random(), Math.random()];
            const res = await fetch(`${API_URL}/search_visualization`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: q, k: 5 })
            });
            if (!res.ok) throw new Error("API Offline");
            const data = await res.json();
            set({
                searchPath: data.path,
                searchResults: data.results,
                searchLatency: data.latency_ms || 0,
                isSearching: false
            });
        } catch (err) {
            console.error("Search failed:", err);
            set({ isSearching: false });
        }
    },

    deployIndex: async () => {
        try {
            const res = await fetch(`${API_URL}/system/deploy`, { method: 'POST' });
            if (res.ok) return await res.json();
        } catch (err) { console.error("Deploy failed:", err); }
        return null;
    },

    fetchMemory: async () => {
        try {
            const res = await fetch(`${API_URL}/system/memory`);
            if (res.ok) {
                const data = await res.json();
                set({ systemMemory: data });
                return data;
            }
        } catch (err) { console.error("Memory fetch failed:", err); }
        return null;
    },

    fetchSensors: async () => {
        try {
            const res = await fetch(`${API_URL}/system/sensors`);
            if (res.ok) {
                const data = await res.json();
                set({ systemSensors: data });
                return data;
            }
        } catch (err) { console.error("Sensors fetch failed:", err); }
        return null;
    },

    fetchGraph: async () => {
        try {
            const res = await fetch(`${API_URL}/graph`);
            if (!res.ok) throw new Error("API Offline");
            const data = await res.json();
            if (!data.nodes || data.nodes.length === 0) throw new Error("Empty");
            
            const mapped = data.nodes.map((node) => ({
                id: node.id,
                layer: node.layer,
                pos: [node.pos[0], node.layer * 3.5, node.pos[2]],
                neighbors: node.neighbors
            }));
            const maxL = mapped.reduce((m, n) => Math.max(m, n.layer), 0);
            get().initLayerFilters(maxL);
            set({ graphData: mapped });
        } catch (err) {
            console.error("Fetch graph failed:", err);
        }
    },

    insertVector: async () => {
        try {
            const id = `dynamic_${Math.random().toString(36).substr(2, 9)}`;
            const values = [Math.random(), Math.random(), Math.random()];
            const res = await fetch(`${API_URL}/vectors`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, values, metadata: { source: "ui_insert" } })
            });
            if (res.ok) {
                await get().fetchGraph();
                get().fetchMemory();
            }
        } catch (err) { console.error("Insert failed:", err); }
    },

    deleteVector: async (id) => {
        try {
            const res = await fetch(`${API_URL}/vectors/${id}`, { method: 'DELETE' });
            if (res.ok) {
                set({ activeNodeId: null });
                await get().fetchGraph();
                get().fetchMemory();
            }
        } catch (err) { console.error("Delete failed:", err); }
    },

    benchmarkResults: null,
    isBenchmarking: false,

    runBenchmark: async () => {
        set({ isBenchmarking: true, benchmarkResults: null });
        try {
            const res = await fetch(`${API_URL}/system/benchmark`, { method: 'POST' });
            if (res.ok) {
                const data = await res.json();
                set({ benchmarkResults: data, isBenchmarking: false });
            } else {
                set({ isBenchmarking: false });
            }
        } catch (err) { 
            console.error("Benchmark failed:", err); 
            set({ isBenchmarking: false });
        }
    }
}));
