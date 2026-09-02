import { lazy, Suspense, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { fetchTextFile } from "../../services/githubClient";
import type { RepoNode } from "../../types/repository";
import { ViewerActions } from "./ViewerActions";
import { useDashboardStore } from "../../state/useDashboardStore";

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

const PdfViewer = lazy(() =>
  import("./PdfViewer").then((module) => ({ default: module.PdfViewer })),
);

export const FileViewer = ({ node }: FileViewerProps) => {
  const [textPreview, setTextPreview] = useState<{
    path: string;
    content: string;
    error: boolean;
  }>({ path: "", content: "", error: false });
  const { viewerExpanded, setViewerExpanded } = useDashboardStore();
  const { openFile } = useDashboardStore();

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

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
          setTextPreview({ path: node.path, content, error: false });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setTextPreview({ path: node.path, content: "", error: true });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [node]);

  useEffect(() => {
    if (!viewerExpanded) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setViewerExpanded(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [setViewerExpanded, viewerExpanded]);

  const renderPreview = () => {
    if (!node || node.type !== "file") {
      return (
        <p className="muted">Selecione um arquivo para visualizar aqui.</p>
      );
    }

    const ext = extensionLabel(node);
    const isTextPreview = ext === "md" || codeExtensions.has(ext);
    const textLoading = isTextPreview && textPreview.path !== node.path;
    const textError = isTextPreview && textPreview.path === node.path && textPreview.error;
    const textContent = textPreview.path === node.path ? textPreview.content : "";

    if (textLoading) return <p className="preview-message">Carregando conteúdo...</p>;
    if (textError) return <p className="preview-message">Não foi possível carregar a prévia deste arquivo.</p>;

    if (ext === "md") {
      return (
        <article className="markdown-body">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            urlTransform={(url) => new URL(url, node.rawUrl).toString()}
          >
            {textContent}
          </ReactMarkdown>
        </article>
      );
    }

    if (codeExtensions.has(ext)) {
      return (
        <pre className="code-preview"><code>{textContent}</code></pre>
      );
    }

    if (imageExtensions.has(ext)) {
      return (
        <img src={node.rawUrl} alt={node.name} className="preview-image" />
      );
    }

    if (ext === "pdf") {
      return (
        <Suspense fallback={<p className="preview-message">Preparando o leitor de PDF...</p>}>
          <PdfViewer key={node.path} name={node.name} url={node.rawUrl} />
        </Suspense>
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
  };

  const content = renderPreview();

  return (
    <>
      <div className="card viewer-card stack-gap">
        <div className="section-header">
          <div><p className="eyebrow">Visualizando</p><h2>{node?.name ?? "Material"}</h2></div>
          <button className="close-viewer" onClick={() => openFile(null)} aria-label="Fechar visualizador">×</button>
        </div>
        <div className="viewer-toolbar">
          {node && node.type === "file" ? (
            <ViewerActions
              node={node}
              onExpand={() => setViewerExpanded(true)}
            />
          ) : null}
        </div>
        {node && node.type === "file" && (
          <p className="viewer-path">{node.path}</p>
        )}
        <div className="viewer-content">{content}</div>
      </div>

      {viewerExpanded &&
        node &&
        node.type === "file" &&
        createPortal(
          <div
            className="viewer-modal-overlay"
            onClick={() => setViewerExpanded(false)}
          >
            <section
              className="viewer-modal"
              onClick={(event) => event.stopPropagation()}
            >
              <header className="viewer-modal-header">
                <h2>Visualizacao ampliada</h2>
                <button
                  className="ghost"
                  onClick={() => setViewerExpanded(false)}
                >
                  Fechar
                </button>
              </header>
              <p className="viewer-path">{node.path}</p>
              <div className="viewer-modal-content">{content}</div>
            </section>
          </div>,
          document.body,
        )}
    </>
  );
};
