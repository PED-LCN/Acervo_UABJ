import { useEffect, useState } from "react";
import { ContributionGuide } from "./components/contribute/ContributionGuide";
import { CommunityFooter } from "./components/footer/CommunityFooter";
import { SchedulePlanner } from "./components/planner/SchedulePlanner";
import { ProfessorsDirectory } from "./components/professors/ProfessorsDirectory";
import { SearchPanels } from "./components/sidebar/SearchPanels";
import { TransportGuide } from "./components/transport/TransportGuide";
import { RepositoryBrowser } from "./components/tree/RepositoryBrowser";
import { FileViewer } from "./components/viewer/FileViewer";
import { fetchRepositoryIndex } from "./services/githubClient";
import { useDashboardStore } from "./state/useDashboardStore";
import { parseDeepLinkState, writeDeepLinkState } from "./utils/deepLink";
import "./App.css";

function App() {
  const [contributionOpen, setContributionOpen] = useState(false);
  const [professorsOpen, setProfessorsOpen] = useState(false);
  const [activeView, setActiveView] = useState<"library" | "planner" | "transport">("library");
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
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 32 32" focusable="false">
              <rect x="8" y="8" width="16" height="16" rx="3" />
              <rect className="chip-core" x="12" y="12" width="8" height="8" rx="1" />
              <path d="M11 4v4m5-4v4m5-4v4M11 24v4m5-4v4m5-4v4M4 11h4m-4 5h4m-4 5h4m16-10h4m-4 5h4m-4 5h4" />
            </svg>
          </span>
          <span><strong>Acervo UABJ</strong><small>Engenharia da Computação</small></span>
        </a>
        {activeView === "library" ? <div className="header-library-tools"><button className="professors-button" onClick={() => setProfessorsOpen(true)}><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3" /><path d="M6 19c.7-3.4 2.7-5 6-5s5.3 1.6 6 5" /></svg>Professores</button><SearchPanels /></div> : <nav className="section-switcher" aria-label="Áreas do site"><button onClick={() => setActiveView("library")}>Acervo</button><button className={activeView === "planner" ? "active" : ""} aria-current={activeView === "planner" ? "page" : undefined} onClick={() => setActiveView("planner")}>Planejador</button><button className={activeView === "transport" ? "active" : ""} aria-current={activeView === "transport" ? "page" : undefined} onClick={() => setActiveView("transport")}>Transporte</button></nav>}
        <div className="header-actions">
          {activeView === "library" && <button className="planner-button" onClick={() => setActiveView("planner")}>Montar grade</button>}
          {activeView === "library" && <button className="transport-button" onClick={() => setActiveView("transport")}>Transporte</button>}
          <button className="contribute-button" onClick={() => setContributionOpen(true)}>Como contribuir</button>
          <button className="theme-button" onClick={toggleTheme} aria-label={`Ativar tema ${theme === "light" ? "escuro" : "claro"}`}>{theme === "light" ? "☾" : "☀"}</button>
        </div>
      </header>

      <main className={`main-content ${activeView === "planner" ? "planner-main" : ""}`}>
        {activeView === "planner" && <SchedulePlanner />}
        {activeView === "transport" && <TransportGuide />}
        {activeView === "library" && <>
        {loading && <section className="loading-state"><div className="loader" /><h1>Organizando o acervo...</h1><p>Estamos preparando os materiais para você.</p></section>}
        {error && <section className="error-state"><span>⚠</span><h1>Não foi possível abrir o acervo</h1><p>{error}</p><button onClick={() => window.location.reload()}>Tentar novamente</button></section>}
        {!loading && !error && repository && (
          <>
            {!selectedPath && <>
              <section className="welcome"><div><p className="eyebrow">Materiais feitos por alunos, para alunos</p><h1>Encontre o que precisa para continuar aprendendo.</h1><p>Navegue por períodos e disciplinas ou pesquise diretamente por uma prova, lista ou assunto.</p></div><div className="collection-stats"><span><strong>{repository.dirPaths.length}</strong> seções</span><span><strong>{repository.filePaths.length}</strong> materiais</span></div></section>
              <section className="project-summary" aria-labelledby="project-summary-title">
                <div>
                  <p className="eyebrow">Sobre o projeto</p>
                  <h2 id="project-summary-title">Uma memória coletiva do curso, mais simples de consultar.</h2>
                </div>
                <p>O Acervo UABJ transforma o repositório colaborativo de Engenharia da Computação em uma plataforma amigável para calouros, veteranos e futuras turmas. Aqui você encontra resumos, listas, provas, projetos, guias e dicas organizados por período e disciplina, pode visualizar os arquivos antes de baixar e usar o planejador como apoio no início do semestre.</p>
                <div className="summary-points" aria-label="Principais características"><span>Organizado por período</span><span>Visualização rápida</span><span>Construído pela comunidade</span></div>
              </section>
            </>}
            <RepositoryBrowser />
          </>
        )}
        </>}
      </main>

      {activeView === "library" && openedNode && <aside className="viewer-drawer" aria-label="Visualizador de material"><FileViewer node={openedNode} /></aside>}
      {contributionOpen && <ContributionGuide onClose={() => setContributionOpen(false)} />}
      {professorsOpen && <ProfessorsDirectory onClose={() => setProfessorsOpen(false)} />}
      <CommunityFooter onContribute={() => setContributionOpen(true)} />
    </div>
  );
}

export default App;
