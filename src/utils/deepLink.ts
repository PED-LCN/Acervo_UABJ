import type { GraphMode } from "../types/repository";

interface DeepLinkState {
  path: string | null;
  file: string | null;
  mode: GraphMode;
}

interface PartialDeepLinkState {
  path?: string | null;
  file?: string | null;
  mode?: GraphMode | null;
}

const DEFAULT_MODE: GraphMode = "hierarchy";

export const parseDeepLinkState = (search: string): DeepLinkState => {
  const params = new URLSearchParams(search);
  const mode = params.get("mode");

  return {
    path: params.get("path"),
    file: params.get("file"),
    mode: mode === "semantic" ? "semantic" : DEFAULT_MODE,
  };
};

export const writeDeepLinkState = (state: PartialDeepLinkState): void => {
  const params = new URLSearchParams(window.location.search);

  if (state.path) {
    params.set("path", state.path);
  } else {
    params.delete("path");
  }

  if (state.file) {
    params.set("file", state.file);
  } else {
    params.delete("file");
  }

  if (state.mode) {
    params.set("mode", state.mode);
  } else {
    params.delete("mode");
  }

  const nextSearch = params.toString();
  const nextUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ""}`;
  window.history.replaceState(null, "", nextUrl);
};
