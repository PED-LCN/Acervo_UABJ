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
    graphMode,
    setRepository,
    setLoading,
    setError,
    setGraphMode,
    setSelectedPath,
    openFile,
  } = useDashboardStore();

  useEffect(() => {
    const initial = parseDeepLinkState(window.location.search);
    if (initial.mode) {
      setGraphMode(initial.mode);
    }
    if (initial.path) {
      setSelectedPath(initial.path);
      openFile(initial.file ?? null);
    } else if (initial.file) {
      setSelectedPath(initial.file);
      openFile(initial.file);
    }
  }, [openFile, setGraphMode, setSelectedPath]);

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
      mode: graphMode,
    });
  }, [graphMode, openedFilePath, selectedPath]);

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
        <div className="mode-toggle" role="group" aria-label="Modo do grafo">
          <button
            className={graphMode === "hierarchy" ? "active" : ""}
            onClick={() => setGraphMode("hierarchy")}
          >
            Hierarquia
          </button>
          <button
            className={graphMode === "semantic" ? "active" : ""}
            onClick={() => setGraphMode("semantic")}
          >
            Semantico
          </button>
        </div>
      </header>

      <main className="dashboard-grid">
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
