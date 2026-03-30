import {
  GITHUB_BRANCH,
  GITHUB_OWNER,
  GITHUB_REPO,
  GITHUB_TOKEN,
} from "../config/github";
import type {
  ContentCategory,
  RepoNode,
  RepositoryIndex,
} from "../types/repository";

interface GitTreeItem {
  path: string;
  mode: string;
  type: "blob" | "tree";
  sha: string;
  size?: number;
  url: string;
}

interface GitTreeResponse {
  sha: string;
  url: string;
  tree: GitTreeItem[];
  truncated: boolean;
}

const CATEGORY_PATTERNS: Array<{ matcher: RegExp; category: ContentCategory }> =
  [
    { matcher: /(^|\/)resumos(\/|$)/i, category: "resumos" },
    { matcher: /(^|\/)materiais(\/|$)/i, category: "materiais" },
    { matcher: /(^|\/)listas-e-exercicios(\/|$)/i, category: "listas" },
    { matcher: /(^|\/)provas-e-avaliacoes(\/|$)/i, category: "provas" },
    { matcher: /(^|\/)projetos(\/|$)/i, category: "projetos" },
    { matcher: /(^|\/)guias(\/|$)/i, category: "guias" },
  ];

const toRawUrl = (path: string): string =>
  `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${path}`;

const toHtmlUrl = (path: string, type: "file" | "dir"): string => {
  const base = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/blob/${GITHUB_BRANCH}`;
  const treeBase = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/tree/${GITHUB_BRANCH}`;
  return type === "dir" ? `${treeBase}/${path}` : `${base}/${path}`;
};

const inferCategory = (path: string): ContentCategory => {
  const matched = CATEGORY_PATTERNS.find(({ matcher }) => matcher.test(path));
  return matched?.category ?? "outros";
};

const getNameFromPath = (path: string): string => {
  const parts = path.split("/");
  return parts[parts.length - 1] || path;
};

const getParentPath = (path: string): string | null => {
  const parts = path.split("/");
  if (parts.length <= 1) {
    return "";
  }
  return parts.slice(0, -1).join("/");
};

const getExtension = (path: string): string | null => {
  const name = getNameFromPath(path);
  const dotIndex = name.lastIndexOf(".");
  if (dotIndex <= 0 || dotIndex === name.length - 1) {
    return null;
  }
  return name.slice(dotIndex + 1).toLowerCase();
};

const createRootNode = (): RepoNode => ({
  path: "",
  name: "root",
  type: "dir",
  parentPath: null,
  depth: 0,
  extension: null,
  category: "outros",
  children: [],
  htmlUrl: `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}`,
  rawUrl: "",
  downloadUrl: "",
});

const ensureDirectory = (
  path: string,
  nodesByPath: Record<string, RepoNode>,
) => {
  if (path === "" || nodesByPath[path]) {
    return;
  }

  const parentPath = getParentPath(path);
  if (parentPath !== null) {
    ensureDirectory(parentPath, nodesByPath);
  }

  nodesByPath[path] = {
    path,
    name: getNameFromPath(path),
    type: "dir",
    parentPath,
    depth: path.split("/").length,
    extension: null,
    category: inferCategory(path),
    children: [],
    htmlUrl: toHtmlUrl(path, "dir"),
    rawUrl: "",
    downloadUrl: "",
  };
};

const indexTreeItems = (treeItems: GitTreeItem[]): RepositoryIndex => {
  const nodesByPath: Record<string, RepoNode> = {
    "": createRootNode(),
  };

  for (const item of treeItems) {
    const normalizedPath = item.path.replace(/\\/g, "/").trim();
    if (!normalizedPath || normalizedPath === ".github") {
      continue;
    }

    const parentPath = getParentPath(normalizedPath);
    if (parentPath !== null) {
      ensureDirectory(parentPath, nodesByPath);
    }

    const nodeType = item.type === "tree" ? "dir" : "file";
    nodesByPath[normalizedPath] = {
      path: normalizedPath,
      name: getNameFromPath(normalizedPath),
      type: nodeType,
      parentPath,
      depth: normalizedPath.split("/").length,
      extension: nodeType === "file" ? getExtension(normalizedPath) : null,
      category: inferCategory(normalizedPath),
      children: [],
      size: item.size,
      htmlUrl: toHtmlUrl(normalizedPath, nodeType),
      rawUrl: nodeType === "file" ? toRawUrl(normalizedPath) : "",
      downloadUrl: nodeType === "file" ? toRawUrl(normalizedPath) : "",
    };
  }

  for (const node of Object.values(nodesByPath)) {
    if (!node.parentPath && node.path !== "") {
      nodesByPath[""].children.push(node.path);
      continue;
    }

    if (
      node.parentPath !== null &&
      nodesByPath[node.parentPath] &&
      node.path !== ""
    ) {
      nodesByPath[node.parentPath].children.push(node.path);
    }
  }

  for (const node of Object.values(nodesByPath)) {
    node.children.sort((a, b) => {
      const nodeA = nodesByPath[a];
      const nodeB = nodesByPath[b];
      if (nodeA.type !== nodeB.type) {
        return nodeA.type === "dir" ? -1 : 1;
      }
      return nodeA.name.localeCompare(nodeB.name);
    });
  }

  const allPaths = Object.keys(nodesByPath);
  const dirPaths = allPaths.filter((path) => nodesByPath[path].type === "dir");
  const filePaths = allPaths.filter(
    (path) => nodesByPath[path].type === "file",
  );

  return {
    owner: GITHUB_OWNER,
    repo: GITHUB_REPO,
    branch: GITHUB_BRANCH,
    rootPath: "",
    nodesByPath,
    allPaths,
    dirPaths,
    filePaths,
    fetchedAt: new Date().toISOString(),
  };
};

export const fetchRepositoryIndex = async (): Promise<RepositoryIndex> => {
  let requestHeaders: HeadersInit = {
    Accept: "application/vnd.github+json",
  };
  if (GITHUB_TOKEN) {
    requestHeaders = {
      ...requestHeaders,
      Authorization: `Bearer ${GITHUB_TOKEN}`,
    };
  }

  const response = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/git/trees/${GITHUB_BRANCH}?recursive=1`,
    {
      headers: requestHeaders,
    },
  );

  if (!response.ok) {
    throw new Error(
      `GitHub API retornou ${response.status} ao carregar a arvore.`,
    );
  }

  const payload = (await response.json()) as GitTreeResponse;
  return indexTreeItems(payload.tree);
};

export const fetchTextFile = async (rawUrl: string): Promise<string> => {
  const response = await fetch(rawUrl);
  if (!response.ok) {
    throw new Error("Nao foi possivel carregar o arquivo.");
  }
  return response.text();
};
