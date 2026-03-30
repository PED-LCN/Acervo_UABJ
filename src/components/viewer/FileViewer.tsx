import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { fetchTextFile } from "../../services/githubClient";
import type { RepoNode } from "../../types/repository";
import { ViewerActions } from "./ViewerActions";

interface FileViewerProps {
  node: RepoNode | null;
}

const imageExtensions = new Set(["png", "jpg", "jpeg", "webp", "gif", "svg"]);
const officeExtensions = new Set(["docx", "pptx", "xlsx"]);
const codeExtensions = new Set([
  "txt",
  "md",
  "js",
  "jsx",
  "ts",
  "tsx",
  "json",
  "py",
  "java",
  "c",
  "cpp",
  "h",
  "hpp",
  "css",
  "html",
  "yml",
  "yaml",
  "sh",
  "sql",
]);

const extensionLabel = (node: RepoNode | null) =>
  node?.extension?.toLowerCase() ?? "";

export const FileViewer = ({ node }: FileViewerProps) => {
  const [textContent, setTextContent] = useState<string>("");

  useEffect(() => {
    if (!node || node.type !== "file") {
      return;
    }

    const ext = extensionLabel(node);
    const shouldLoadText = ext === "md" || codeExtensions.has(ext);
    if (!shouldLoadText) {
      return;
    }

    let cancelled = false;

    fetchTextFile(node.rawUrl)
      .then((content) => {
        if (!cancelled) {
          setTextContent(content);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setTextContent("");
        }
      })
      .finally(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [node]);

  const content = useMemo(() => {
    if (!node || node.type !== "file") {
      return (
        <p className="muted">Selecione um arquivo para visualizar aqui.</p>
      );
    }

    const ext = extensionLabel(node);

    if (ext === "md") {
      return (
        <article className="markdown-body">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {textContent}
          </ReactMarkdown>
        </article>
      );
    }

    if (codeExtensions.has(ext)) {
      return (
        <SyntaxHighlighter
          language={ext}
          style={oneLight}
          customStyle={{ margin: 0 }}
        >
          {textContent}
        </SyntaxHighlighter>
      );
    }

    if (imageExtensions.has(ext)) {
      return (
        <img src={node.rawUrl} alt={node.name} className="preview-image" />
      );
    }

    if (ext === "pdf") {
      return (
        <iframe
          title={node.name}
          src={node.rawUrl}
          className="preview-iframe"
        />
      );
    }

    if (officeExtensions.has(ext)) {
      return (
        <div className="office-fallback">
          <p>
            Preview nativo para arquivos Office ainda nao esta habilitado no
            MVP.
          </p>
          <a href={node.downloadUrl} target="_blank" rel="noreferrer">
            Baixar arquivo
          </a>
          <a href={node.htmlUrl} target="_blank" rel="noreferrer">
            Abrir no GitHub
          </a>
        </div>
      );
    }

    return (
      <div className="office-fallback">
        <p>Este tipo de arquivo ainda nao tem preview interno.</p>
        <a href={node.downloadUrl} target="_blank" rel="noreferrer">
          Baixar arquivo
        </a>
      </div>
    );
  }, [node, textContent]);

  return (
    <div className="card viewer-card stack-gap">
      <div className="section-header">
        <h2>Visualizador</h2>
        {node && node.type === "file" ? <ViewerActions node={node} /> : null}
      </div>
      {node && node.type === "file" && (
        <p className="viewer-path">{node.path}</p>
      )}
      <div className="viewer-content">{content}</div>
    </div>
  );
};
