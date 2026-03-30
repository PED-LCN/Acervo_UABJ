import type {
  ContentCategory,
  RepositoryIndex,
  SearchFilters,
  SearchResult,
} from "../types/repository";

const tokenize = (value: string): string[] =>
  value.toLowerCase().trim().split(/\s+/).filter(Boolean);

const scorePath = (path: string, terms: string[]): number => {
  const lowerPath = path.toLowerCase();
  let score = 0;
  for (const term of terms) {
    if (lowerPath === term) {
      score += 60;
      continue;
    }
    if (lowerPath.endsWith(`/${term}`) || lowerPath.startsWith(term)) {
      score += 35;
      continue;
    }
    if (lowerPath.includes(term)) {
      score += 15;
    }
  }
  return score;
};

export const createDefaultSearchFilters = (): SearchFilters => ({
  categories: [],
  extension: null,
  types: ["file", "dir"],
});

export const allCategories: ContentCategory[] = [
  "resumos",
  "materiais",
  "listas",
  "provas",
  "projetos",
  "guias",
  "outros",
];

export const searchRepository = (
  repository: RepositoryIndex,
  query: string,
  filters: SearchFilters,
  scopePath: string | null,
  limit = 25,
): SearchResult[] => {
  const terms = tokenize(query);
  const scopedPrefix = scopePath ? `${scopePath}/` : "";

  const candidates = repository.allPaths
    .filter((path) => path !== "")
    .filter((path) => {
      if (!scopePath) {
        return true;
      }
      return path === scopePath || path.startsWith(scopedPrefix);
    })
    .map((path) => repository.nodesByPath[path])
    .filter((node) => filters.types.includes(node.type))
    .filter((node) => {
      if (filters.categories.length === 0) {
        return true;
      }
      return filters.categories.includes(node.category);
    })
    .filter((node) => {
      if (!filters.extension || node.type !== "file") {
        return true;
      }
      return node.extension === filters.extension;
    });

  const scored = candidates
    .map((node) => ({
      node,
      path: node.path,
      score: terms.length === 0 ? 1 : scorePath(node.path, terms),
    }))
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score || a.path.localeCompare(b.path));

  return scored.slice(0, limit);
};
