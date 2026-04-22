import { create } from 'zustand';

// Simple global wrapper for sharing complex graph state between WebGL and Sidebar UI Without prop drilling.
export const useVectorStore = create((set) => ({
    graphData: [],
    setGraphData: (data) => set({ graphData: data }),
    
    // Globally shared pointer state so UI can react when 3D Canvas is hovered
    activeNodeId: null,
    setActiveNodeId: (nodeId) => set({ activeNodeId: nodeId }),

    // Animation trace arrays and execution locks
    searchPath: [],
    setSearchPath: (path) => set({ searchPath: path }),
    
    isSearching: false,
    setIsSearching: (status) => set({ isSearching: status })
}));
