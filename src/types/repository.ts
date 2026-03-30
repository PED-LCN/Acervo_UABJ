export type NodeType = "file" | "dir";

export type GraphMode = "hierarchy" | "semantic";

export type ContentCategory =
  | "resumos"
  | "materiais"
  | "listas"
  | "provas"
  | "projetos"
  | "guias"
  | "outros";

export interface RepoNode {
  path: string;
  name: string;
  type: NodeType;
  parentPath: string | null;
  depth: number;
  extension: string | null;
  category: ContentCategory;
  children: string[];
  size?: number;
  htmlUrl: string;
  rawUrl: string;
  downloadUrl: string;
}

export interface RepositoryIndex {
  owner: string;
  repo: string;
  branch: string;
  rootPath: string;
  nodesByPath: Record<string, RepoNode>;
  allPaths: string[];
  dirPaths: string[];
  filePaths: string[];
  fetchedAt: string;
}

export interface SearchFilters {
  categories: ContentCategory[];
  extension: string | null;
  types: NodeType[];
}

export interface SearchResult {
  path: string;
  score: number;
  node: RepoNode;
}
