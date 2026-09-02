import { useMemo } from "react";
import { createDefaultSearchFilters, formatRepositoryLabel, searchRepository } from "../../services/indexer";
import { useDashboardStore } from "../../state/useDashboardStore";

const getIcon = (type: "file" | "dir", extension: string | null) => {
  if (type === "dir") return "📁";
  if (extension === "pdf") return "📕";
  if (extension === "md") return "📝";
  if (["png", "jpg", "jpeg", "webp"].includes(extension ?? "")) return "🖼️";
  return "📄";
};

export const SearchPanels = () => {
  const { repository, query, setQuery, setSelectedPath, openFile } = useDashboardStore();
  const results = useMemo(() => {
    if (!repository || query.trim().length < 2) return [];
    return searchRepository(repository, query, createDefaultSearchFilters(), null, 12);
  }, [query, repository]);

  const selectResult = (path: string) => {
    if (!repository) return;
    const node = repository.nodesByPath[path];
    setSelectedPath(path);
    openFile(node.type === "file" ? path : null);
    setQuery("");
  };

  return (
    <div className="search-shell">
      <label className="search-box">
        <span aria-hidden="true">⌕</span>
        <input type="search" placeholder="Busque por disciplina, prova, lista ou assunto..." value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Buscar no acervo" />
        {query && <button onClick={() => setQuery("")} aria-label="Limpar busca">×</button>}
      </label>
      {query.trim().length >= 2 && (
        <div className="search-popover" role="listbox">
          <div className="search-summary"><strong>{results.length} resultados</strong><span>no acervo</span></div>
          {results.map(({ node }) => (
            <button className="search-result" key={node.path} onClick={() => selectResult(node.path)} role="option" aria-selected="false">
              <span className="result-icon" aria-hidden="true">{getIcon(node.type, node.extension)}</span>
              <span><strong>{formatRepositoryLabel(node.name)}</strong><small>{node.path.split("/").slice(0, -1).map(formatRepositoryLabel).join(" › ")}</small></span>
            </button>
          ))}
          {results.length === 0 && <p className="empty-search">Nenhum material encontrado.</p>}
        </div>
      )}
    </div>
  );
};
