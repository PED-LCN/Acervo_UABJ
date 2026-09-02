import { useMemo } from "react";
import { formatRepositoryLabel, isContentNode } from "../../services/indexer";
import { useDashboardStore } from "../../state/useDashboardStore";
import type { RepoNode } from "../../types/repository";

const getMaterialIcon = (node: RepoNode) => {
  if (node.extension === "pdf") return "📕";
  if (node.extension === "md") return "📝";
  if (["jpg", "jpeg", "png", "webp", "gif"].includes(node.extension ?? "")) return "🖼️";
  return "📄";
};

const formatSize = (size?: number) => {
  if (!size) return null;
  if (size < 1024 * 1024) return `${Math.ceil(size / 1024)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
};

export const RepositoryBrowser = () => {
  const { repository, selectedPath, setSelectedPath, openFile } = useDashboardStore();
  const currentDirPath = useMemo(() => {
    if (!repository || !selectedPath) return "";
    const selected = repository.nodesByPath[selectedPath];
    return selected?.type === "file" ? (selected.parentPath ?? "") : selected.path;
  }, [repository, selectedPath]);
  if (!repository) return null;

  const currentNode = repository.nodesByPath[currentDirPath];
  const children = currentNode.children.map((path) => repository.nodesByPath[path]).filter(isContentNode);
  const branches = children.filter((node) => node.type === "dir");
  const leaves = children.filter((node) => node.type === "file");
  const crumbs = currentDirPath ? currentDirPath.split("/") : [];
  const select = (node: RepoNode) => { setSelectedPath(node.path); openFile(node.type === "file" ? node.path : null); };

  return (
    <section className="collection-view" aria-labelledby="collection-title">
      <nav className="breadcrumbs" aria-label="Caminho atual">
        <button onClick={() => { setSelectedPath(""); openFile(null); }}>Acervo</button>
        {crumbs.map((crumb, index) => {
          const path = crumbs.slice(0, index + 1).join("/");
          return <span key={path}><span aria-hidden="true">›</span><button onClick={() => { setSelectedPath(path); openFile(null); }}>{formatRepositoryLabel(crumb)}</button></span>;
        })}
      </nav>
      <div className="collection-heading">
        <div><p className="eyebrow">Explorando agora</p><h2 id="collection-title">{currentDirPath ? formatRepositoryLabel(currentNode.name) : "Acervo acadêmico"}</h2><p>{branches.length} seções e {leaves.length} materiais neste nível</p></div>
        {currentDirPath && <a className="text-link" href={currentNode.htmlUrl} target="_blank" rel="noreferrer">Ver fonte no GitHub ↗</a>}
      </div>
      {branches.length > 0 && <div className="branch-grid">{branches.map((node) => (
        <button className="branch-card" key={node.path} onClick={() => select(node)}><span className="branch-icon" aria-hidden="true">🗂️</span><span><strong>{formatRepositoryLabel(node.name)}</strong><small>{node.children.filter((path) => isContentNode(repository.nodesByPath[path])).length} itens</small></span><span className="arrow" aria-hidden="true">→</span></button>
      ))}</div>}
      {leaves.length > 0 && <div className="materials-section"><div className="section-title"><h3>Materiais</h3><span>{leaves.length}</span></div><div className="material-list">{leaves.map((node) => (
        <button className={`material-row ${selectedPath === node.path ? "active" : ""}`} key={node.path} onClick={() => select(node)}><span className="material-icon" aria-hidden="true">{getMaterialIcon(node)}</span><span className="material-info"><strong>{formatRepositoryLabel(node.name)}</strong><small>{node.extension?.toUpperCase() ?? "ARQUIVO"}{formatSize(node.size) ? ` · ${formatSize(node.size)}` : ""}</small></span><span className="preview-label">Visualizar</span></button>
      ))}</div></div>}
      {children.length === 0 && <p className="empty-state">Ainda não há materiais nesta seção.</p>}
    </section>
  );
};
