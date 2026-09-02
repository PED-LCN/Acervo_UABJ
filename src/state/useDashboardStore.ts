import { create } from "zustand";
import type {
  RepositoryIndex,
  ThemeMode,
} from "../types/repository";

interface DashboardState {
  repository: RepositoryIndex | null;
  loading: boolean;
  error: string | null;
  selectedPath: string | null;
  openedFilePath: string | null;
  theme: ThemeMode;
  viewerExpanded: boolean;
  query: string;
  setRepository: (repository: RepositoryIndex) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSelectedPath: (path: string | null) => void;
  openFile: (path: string | null) => void;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setViewerExpanded: (expanded: boolean) => void;
  setQuery: (query: string) => void;
}

const THEME_KEY = "panel_ua_theme";

const getInitialTheme = (): ThemeMode => {
  const savedTheme = window.localStorage.getItem(THEME_KEY);
  if (savedTheme === "dark" || savedTheme === "light") {
    return savedTheme;
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

export const useDashboardStore = create<DashboardState>((set) => ({
  repository: null,
  loading: false,
  error: null,
  selectedPath: null,
  openedFilePath: null,
  theme: getInitialTheme(),
  viewerExpanded: false,
  query: "",
  setRepository: (repository) => set(() => ({ repository })),
  setLoading: (loading) => set(() => ({ loading })),
  setError: (error) => set(() => ({ error })),
  setSelectedPath: (selectedPath) => set(() => ({ selectedPath })),
  openFile: (openedFilePath) =>
    set(() => ({
      openedFilePath,
      viewerExpanded: false,
    })),
  setTheme: (theme) => {
    window.localStorage.setItem(THEME_KEY, theme);
    set(() => ({ theme }));
  },
  toggleTheme: () =>
    set((state) => {
      const nextTheme = state.theme === "light" ? "dark" : "light";
      window.localStorage.setItem(THEME_KEY, nextTheme);
      return { theme: nextTheme };
    }),
  setViewerExpanded: (viewerExpanded) => set(() => ({ viewerExpanded })),
  setQuery: (query) => set(() => ({ query })),
}));
