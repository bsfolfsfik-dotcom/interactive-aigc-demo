import { create } from 'zustand';

export const useAppStore = create((set, get) => ({
  // User state
  userId: null,
  setUserId: (userId) => set({ userId }),

  // Generation state
  currentGeneration: null,
  generationStatus: 'idle', // idle, processing, completed, failed
  generationLogs: [],
  generationProgress: 0,

  setCurrentGeneration: (generation) => set({ currentGeneration: generation }),
  setGenerationStatus: (status) => set({ generationStatus: status }),
  addGenerationLog: (log) => set((state) => ({
    generationLogs: [...state.generationLogs, { ...log, timestamp: new Date() }]
  })),
  clearGenerationLogs: () => set({ generationLogs: [] }),
  setGenerationProgress: (progress) => set({ generationProgress: progress }),

  // History state
  history: [],
  historyLoading: false,
  setHistory: (history) => set({ history }),
  setHistoryLoading: (loading) => set({ historyLoading: loading }),

  // Config state
  savedConfigs: [],
  configsLoading: false,
  setSavedConfigs: (configs) => set({ savedConfigs: configs }),
  setConfigsLoading: (loading) => set({ configsLoading: loading }),

  // System health state
  systemHealth: {
    database: false,
    metaso: false,
    claude: false,
    tpu: false,
    lastCheck: null
  },
  setSystemHealth: (health) => set({ systemHealth: health }),

  // UI state
  selectedTab: 0,
  setSelectedTab: (tab) => set({ selectedTab: tab }),

  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  // Modal state
  exportModalOpen: false,
  historyModalOpen: false,
  configModalOpen: false,
  setExportModalOpen: (open) => set({ exportModalOpen: open }),
  setHistoryModalOpen: (open) => set({ historyModalOpen: open }),
  setConfigModalOpen: (open) => set({ configModalOpen: open }),

  // Reset all state
  reset: () => set({
    currentGeneration: null,
    generationStatus: 'idle',
    generationLogs: [],
    generationProgress: 0,
    history: [],
    savedConfigs: []
  })
}));
