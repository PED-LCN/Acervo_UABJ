import { useEffect } from "react";
import { SearchPanels } from "./components/sidebar/SearchPanels";
import { RepositoryGraph } from "./components/graph/RepositoryGraph";
import { RepositoryBrowser } from "./components/tree/RepositoryBrowser";
import { FileViewer } from "./components/viewer/FileViewer";
import { fetchRepositoryIndex } from "./services/githubClient";
import { useDashboardStore } from "./state/useDashboardStore";
import { parseDeepLinkState, writeDeepLinkState } from "./utils/deepLink";
import "./App.css";

function App() {
  const {
    repository,
    loading,
    error,
    selectedPath,
    openedFilePath,
    theme,
    viewerExpanded,
    setRepository,
    setLoading,
    setError,
    toggleTheme,
    setSelectedPath,
    openFile,
  } = useDashboardStore();

  useEffect(() => {
    const initial = parseDeepLinkState(window.location.search);
    if (initial.path) {
      setSelectedPath(initial.path);
      openFile(initial.file ?? null);
    } else if (initial.file) {
      setSelectedPath(initial.file);
      openFile(initial.file);
    }
  }, [openFile, setSelectedPath]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    let cancelled = false;

    const loadRepository = async () => {
      setLoading(true);
      setError(null);

      try {
        const nextRepository = await fetchRepositoryIndex();
        if (!cancelled) {
          setRepository(nextRepository);
        }
      } catch (loadError) {
        if (!cancelled) {
          const errorMessage =
            loadError instanceof Error
              ? loadError.message
              : "Falha ao carregar os arquivos do GitHub.";
          setError(errorMessage);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadRepository();

    return () => {
      cancelled = true;
    };
  }, [setError, setLoading, setRepository]);

  useEffect(() => {
    writeDeepLinkState({
      path: selectedPath,
      file: openedFilePath,
      mode: "hierarchy",
    });
  }, [openedFilePath, selectedPath]);

  const openedNode =
    openedFilePath && repository
      ? (repository.nodesByPath[openedFilePath] ?? null)
      : null;

  return (
    <div className="dashboard-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Repositorio academico visual</p>
          <h1>UABJ Engenharia Dashboard</h1>
        </div>
        <div className="theme-toggle" role="group" aria-label="Tema da interface">
          <button
            className={theme === "light" ? "active" : ""}
            onClick={toggleTheme}
          >
            {theme === "light" ? "Ativar modo escuro" : "Ativar modo claro"}
          </button>
        </div>
      </header>

      <main className={`dashboard-grid ${viewerExpanded ? "viewer-expanded" : ""}`}>
        <aside className="sidebar">
          <SearchPanels />
          <RepositoryBrowser />
        </aside>

        <section className="graph-area">
          {loading && (
            <p className="state-pill">Carregando estrutura do repositorio...</p>
          )}
          {error && <p className="state-pill error">{error}</p>}
          {!loading && !error && repository && <RepositoryGraph />}
        </section>

        <section className="viewer-area">
          <FileViewer node={openedNode} />
        </section>
      </main>
    </div>
  );
}

export default App;
