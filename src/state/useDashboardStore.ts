import { create } from "zustand";
import type {
  GraphMode,
  RepositoryIndex,
  SearchFilters,
} from "../types/repository";
import { createDefaultSearchFilters } from "../services/indexer";

export interface SearchPanelState {
  id: string;
  title: string;
  query: string;
  scopePath: string | null;
  filters: SearchFilters;
}

interface DashboardState {
  repository: RepositoryIndex | null;
  loading: boolean;
  error: string | null;
  selectedPath: string | null;
  openedFilePath: string | null;
  graphMode: GraphMode;
  searchPanels: SearchPanelState[];
  setRepository: (repository: RepositoryIndex) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSelectedPath: (path: string | null) => void;
  openFile: (path: string | null) => void;
  setGraphMode: (mode: GraphMode) => void;
  addSearchPanel: () => void;
  removeSearchPanel: (id: string) => void;
  updateSearchPanel: (
    id: string,
    patch: Partial<Omit<SearchPanelState, "id">>,
  ) => void;
}

let panelCounter = 2;

const createPanel = (title: string): SearchPanelState => ({
  id: crypto.randomUUID(),
  title,
  query: "",
  scopePath: null,
  filters: createDefaultSearchFilters(),
});

export const useDashboardStore = create<DashboardState>((set) => ({
  repository: null,
  loading: false,
  error: null,
  selectedPath: null,
  openedFilePath: null,
  graphMode: "hierarchy",
  searchPanels: [createPanel("Busca A"), createPanel("Busca B")],
  setRepository: (repository) => set(() => ({ repository })),
  setLoading: (loading) => set(() => ({ loading })),
  setError: (error) => set(() => ({ error })),
  setSelectedPath: (selectedPath) => set(() => ({ selectedPath })),
  openFile: (openedFilePath) => set(() => ({ openedFilePath })),
  setGraphMode: (graphMode) => set(() => ({ graphMode })),
  addSearchPanel: () =>
    set((state) => {
      panelCounter += 1;
      return {
        searchPanels: [
          ...state.searchPanels,
          createPanel(`Busca ${panelCounter}`),
        ],
      };
    }),
  removeSearchPanel: (id) =>
    set((state) => {
      if (state.searchPanels.length <= 1) {
        return state;
      }
      return {
        searchPanels: state.searchPanels.filter((panel) => panel.id !== id),
      };
    }),
  updateSearchPanel: (id, patch) =>
    set((state) => ({
      searchPanels: state.searchPanels.map((panel) =>
        panel.id === id ? { ...panel, ...patch } : panel,
      ),
    })),
}));
