import { useMemo } from "react";
import { allCategories, searchRepository } from "../../services/indexer";
import {
  useDashboardStore,
  type SearchPanelState,
} from "../../state/useDashboardStore";

interface SearchPanelItemProps {
  panel: SearchPanelState;
}

const SearchPanelItem = ({ panel }: SearchPanelItemProps) => {
  const {
    repository,
    updateSearchPanel,
    removeSearchPanel,
    setSelectedPath,
    openFile,
  } = useDashboardStore();

  const results = useMemo(() => {
    if (!repository) {
      return [];
    }
    return searchRepository(
      repository,
      panel.query,
      panel.filters,
      panel.scopePath,
    ).filter((result) => result.node.type === "dir");
  }, [panel.filters, panel.query, panel.scopePath, repository]);

  return (
    <article className="search-panel">
      <div className="section-header">
        <strong>{panel.title}</strong>
        <button
          className="ghost danger"
          onClick={() => removeSearchPanel(panel.id)}
        >
          Remover
        </button>
      </div>

      <input
        placeholder="buscar por pasta, arquivo ou termo"
        value={panel.query}
        onChange={(event) =>
          updateSearchPanel(panel.id, {
            query: event.target.value,
          })
        }
      />

      <div className="inline-field">
        <label>Categoria</label>
        <select
          value={panel.filters.categories[0] ?? ""}
          onChange={(event) => {
            const nextCategory = event.target.value;
            updateSearchPanel(panel.id, {
              filters: {
                ...panel.filters,
                categories: nextCategory
                  ? [nextCategory as (typeof allCategories)[number]]
                  : [],
              },
            });
          }}
        >
          <option value="">todas</option>
          {allCategories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <ul className="search-results">
        {results.map((result) => (
          <li key={`${panel.id}-${result.path}`}>
            <button
              className="result-link"
              onClick={() => {
                setSelectedPath(result.path);
                openFile(null);
              }}
            >
              <span>DIR</span>
              <small>{result.path}</small>
            </button>
          </li>
        ))}
        {results.length === 0 && (
          <li className="muted">Sem resultados para este painel.</li>
        )}
      </ul>
    </article>
  );
};

export const SearchPanels = () => {
  const { searchPanels, addSearchPanel } = useDashboardStore();

  return (
    <section className="card stack-gap">
      <div className="section-header">
        <h2>Buscas paralelas</h2>
        <button className="ghost" onClick={addSearchPanel}>
          + Painel
        </button>
      </div>

      {searchPanels.map((panel) => (
        <SearchPanelItem key={panel.id} panel={panel} />
      ))}
    </section>
  );
};
