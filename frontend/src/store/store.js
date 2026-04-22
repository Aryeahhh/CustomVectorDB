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

    isSearching: false,

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
    }
}));
