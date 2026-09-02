import { useEffect, useRef, useState } from "react";
import {
  GlobalWorkerOptions,
  getDocument,
  type PDFDocumentProxy,
  type RenderTask,
} from "pdfjs-dist";

GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

interface PdfViewerProps {
  name: string;
  url: string;
}

export const PdfViewer = ({ name, url }: PdfViewerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [document, setDocument] = useState<PDFDocumentProxy | null>(null);
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    const task = getDocument({ url });

    task.promise
      .then((nextDocument) => {
        if (active) setDocument(nextDocument);
      })
      .catch(() => {
        if (active) setError(true);
      });

    return () => {
      active = false;
      task.destroy();
    };
  }, [url]);

  useEffect(() => {
    if (!document || !canvasRef.current) return;

    let renderTask: RenderTask | null = null;
    let active = true;

    document.getPage(page).then((pdfPage) => {
      if (!active || !canvasRef.current) return;
      const viewport = pdfPage.getViewport({ scale: 1.35 * zoom });
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      if (!context) return;

      const outputScale = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(viewport.width * outputScale);
      canvas.height = Math.floor(viewport.height * outputScale);
      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;

      renderTask = pdfPage.render({
        canvas,
        canvasContext: context,
        viewport,
        transform:
          outputScale === 1
            ? undefined
            : [outputScale, 0, 0, outputScale, 0, 0],
      });
    });

    return () => {
      active = false;
      renderTask?.cancel();
    };
  }, [document, page, zoom]);

  if (error) {
    return (
      <div className="pdf-state" role="alert">
        <strong>Não foi possível abrir este PDF.</strong>
        <span>Use o botão de download para acessar o arquivo original.</span>
      </div>
    );
  }

  return (
    <div className="pdf-viewer">
      <div className="pdf-controls" aria-label="Controles do PDF">
        <div className="pdf-pagination">
          <button
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page === 1}
            aria-label="Página anterior"
          >
            ←
          </button>
          <span>
            {document ? `Página ${page} de ${document.numPages}` : "Carregando PDF..."}
          </span>
          <button
            onClick={() =>
              setPage((current) =>
                document ? Math.min(document.numPages, current + 1) : current,
              )
            }
            disabled={!document || page === document.numPages}
            aria-label="Próxima página"
          >
            →
          </button>
        </div>
        <div className="pdf-zoom">
          <button
            onClick={() => setZoom((current) => Math.max(0.65, current - 0.15))}
            aria-label="Diminuir zoom"
          >
            −
          </button>
          <span>{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom((current) => Math.min(2, current + 0.15))}
            aria-label="Aumentar zoom"
          >
            +
          </button>
        </div>
      </div>
      <div className="pdf-canvas-wrap">
        {!document && <div className="pdf-loading"><span />Preparando {name}...</div>}
        <canvas ref={canvasRef} aria-label={`Prévia de ${name}, página ${page}`} />
      </div>
    </div>
  );
};
