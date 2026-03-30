import { useMemo } from "react";
import { useDashboardStore } from "../../state/useDashboardStore";
import { isContentNode } from "../../services/indexer";

const pathLabel = (path: string): string => {
  if (!path) {
    return "root";
  }
  const parts = path.split("/");
  return parts[parts.length - 1];
};

export const RepositoryBrowser = () => {
  const { repository, selectedPath, setSelectedPath, openFile } =
    useDashboardStore();

  const currentDirPath = useMemo(() => {
    if (!repository) {
      return "";
    }
    if (!selectedPath) {
      return "";
    }
    const selectedNode = repository.nodesByPath[selectedPath];
    if (!selectedNode) {
      return "";
    }
    if (selectedNode.type === "dir") {
      return selectedNode.path;
    }
    return selectedNode.parentPath ?? "";
  }, [repository, selectedPath]);

  if (!repository) {
    return (
      <section className="card">
        <h2>Explorador</h2>
        <p className="muted">Aguardando dados do repositorio...</p>
      </section>
    );
  }

  const currentNode = repository.nodesByPath[currentDirPath];
  const children = currentNode.children
    .map((childPath) => repository.nodesByPath[childPath])
    .filter((node) => node.type === "dir")
    .filter((node) => isContentNode(node));
  const breadcrumbs = currentDirPath ? currentDirPath.split("/") : [];

  return (
    <section className="card stack-gap">
      <h2>Explorador</h2>

      <nav className="breadcrumbs">
        <button
          onClick={() => {
            setSelectedPath("");
            openFile(null);
          }}
        >
          root
        </button>
        {breadcrumbs.map((crumb, index) => {
          const crumbPath = breadcrumbs.slice(0, index + 1).join("/");
          return (
            <button
              key={crumbPath}
              onClick={() => {
                setSelectedPath(crumbPath);
                openFile(null);
              }}
            >
              {crumb}
            </button>
          );
        })}
      </nav>

      <ul className="browser-list">
        {children.map((node) => (
          <li key={node.path}>
            <button
              className={`browser-item ${selectedPath === node.path ? "active" : ""}`}
              onClick={() => {
                setSelectedPath(node.path);
                if (node.type === "file") {
                  openFile(node.path);
                } else {
                  openFile(null);
                }
              }}
            >
              <span>{node.type === "dir" ? "DIR" : "FILE"}</span>
              <small>{pathLabel(node.path)}</small>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
};
