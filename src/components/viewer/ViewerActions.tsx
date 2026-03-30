import type { RepoNode } from "../../types/repository";

interface ViewerActionsProps {
  node: RepoNode;
}

const copyToClipboard = async (value: string) => {
  await navigator.clipboard.writeText(value);
};

export const ViewerActions = ({ node }: ViewerActionsProps) => {
  const deepLink = `${window.location.origin}${window.location.pathname}?path=${encodeURIComponent(
    node.parentPath ?? "",
  )}&file=${encodeURIComponent(node.path)}&mode=${new URLSearchParams(window.location.search).get("mode") ?? "hierarchy"}`;

  return (
    <div className="viewer-actions">
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
