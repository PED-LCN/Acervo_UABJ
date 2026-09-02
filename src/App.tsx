import { useEffect, useState } from "react";
import { ContributionGuide } from "./components/contribute/ContributionGuide";
import { SearchPanels } from "./components/sidebar/SearchPanels";
import { RepositoryBrowser } from "./components/tree/RepositoryBrowser";
import { FileViewer } from "./components/viewer/FileViewer";
import { fetchRepositoryIndex } from "./services/githubClient";
import { useDashboardStore } from "./state/useDashboardStore";
import { parseDeepLinkState, writeDeepLinkState } from "./utils/deepLink";
import "./App.css";

function App() {
  const [contributionOpen, setContributionOpen] = useState(false);
  const { repository, loading, error, selectedPath, openedFilePath, theme, setRepository, setLoading, setError, toggleTheme, setSelectedPath, openFile } = useDashboardStore();

  useEffect(() => {
    const initial = parseDeepLinkState(window.location.search);
    if (initial.path) setSelectedPath(initial.path);
    if (initial.file) openFile(initial.file);
  }, [openFile, setSelectedPath]);

  useEffect(() => { document.documentElement.setAttribute("data-theme", theme); }, [theme]);

  useEffect(() => {
    let cancelled = false;
    const loadRepository = async () => {
      setLoading(true); setError(null);
      try {
        const nextRepository = await fetchRepositoryIndex();
        if (!cancelled) setRepository(nextRepository);
      } catch (loadError) {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : "Não foi possível carregar o acervo.");
      } finally { if (!cancelled) setLoading(false); }
    };
    loadRepository();
    return () => { cancelled = true; };
  }, [setError, setLoading, setRepository]);

  useEffect(() => { writeDeepLinkState({ path: selectedPath, file: openedFilePath, mode: "hierarchy" }); }, [openedFilePath, selectedPath]);

  const openedNode = openedFilePath && repository ? (repository.nodesByPath[openedFilePath] ?? null) : null;

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href={import.meta.env.BASE_URL} aria-label="Voltar ao início">
          <span className="brand-mark" aria-hidden="true">UA</span>
          <span><strong>Acervo UABJ</strong><small>Engenharia da Computação</small></span>
        </a>
        <SearchPanels />
        <div className="header-actions">
          <button className="contribute-button" onClick={() => setContributionOpen(true)}>Como contribuir</button>
          <button className="theme-button" onClick={toggleTheme} aria-label={`Ativar tema ${theme === "light" ? "escuro" : "claro"}`}>{theme === "light" ? "☾" : "☀"}</button>
        </div>
      </header>

      <main className="main-content">
        {loading && <section className="loading-state"><div className="loader" /><h1>Organizando o acervo...</h1><p>Estamos preparando os materiais para você.</p></section>}
        {error && <section className="error-state"><span>⚠</span><h1>Não foi possível abrir o acervo</h1><p>{error}</p><button onClick={() => window.location.reload()}>Tentar novamente</button></section>}
        {!loading && !error && repository && (
          <>
            {!selectedPath && <section className="welcome"><div><p className="eyebrow">Materiais feitos por alunos, para alunos</p><h1>Encontre o que precisa para continuar aprendendo.</h1><p>Navegue por períodos e disciplinas ou pesquise diretamente por uma prova, lista ou assunto.</p></div><div className="collection-stats"><span><strong>{repository.dirPaths.length}</strong> seções</span><span><strong>{repository.filePaths.length}</strong> materiais</span></div></section>}
            <RepositoryBrowser />
          </>
        )}
      </main>

      {openedNode && <aside className="viewer-drawer" aria-label="Visualizador de material"><FileViewer node={openedNode} /></aside>}
      {contributionOpen && <ContributionGuide onClose={() => setContributionOpen(false)} />}
      <footer><span>Acervo comunitário da UABJ</span><a href="https://github.com/LipeLacross/uabj-engenharia-computacao" target="_blank" rel="noreferrer">Acessar repositório ↗</a></footer>
    </div>
  );
}

export default App;
