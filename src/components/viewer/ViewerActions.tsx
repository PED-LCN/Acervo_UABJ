import type { RepoNode } from "../../types/repository";

interface ViewerActionsProps {
  node: RepoNode;
  onExpand: () => void;
}

const copyToClipboard = async (value: string) => {
  await navigator.clipboard.writeText(value);
};

export const ViewerActions = ({ node, onExpand }: ViewerActionsProps) => {
  const deepLink = `${window.location.origin}${window.location.pathname}?path=${encodeURIComponent(
    node.parentPath ?? "",
  )}&file=${encodeURIComponent(node.path)}&mode=hierarchy`;

  return (
    <div className="viewer-actions">
      <button className="ghost" onClick={onExpand}>
        Ampliar
      </button>
      <a className="ghost" href={deepLink} target="_blank" rel="noreferrer">
        Abrir em nova pagina
      </a>
      <a
        className="ghost"
        href={node.downloadUrl}
        target="_blank"
        rel="noreferrer"
      >
        Download
      </a>
      <button className="ghost" onClick={() => copyToClipboard(node.htmlUrl)}>
        Copiar link GitHub
      </button>
      <button className="ghost" onClick={() => copyToClipboard(deepLink)}>
        Copiar link da visualizacao
      </button>
    </div>
  );
};
