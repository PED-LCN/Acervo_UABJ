import { useEffect } from "react";
import { createPortal } from "react-dom";

interface ContributionGuideProps {
  onClose: () => void;
}

const repositoryUrl =
  "https://github.com/FelipePatriota/uabj-engenharia-computacao";

const steps = [
  {
    number: "01",
    title: "Faça uma cópia",
    description:
      "Crie um fork do repositório para preparar sua contribuição com segurança.",
  },
  {
    number: "02",
    title: "Encontre a disciplina",
    description:
      "Use periodos/XX-periodo/nome-da-disciplina e escolha a categoria correta.",
  },
  {
    number: "03",
    title: "Adicione o material",
    description:
      "Inclua o arquivo com um nome claro e faça um commit descrevendo o conteúdo.",
  },
  {
    number: "04",
    title: "Envie para revisão",
    description:
      "Abra um Pull Request. A comunidade poderá revisar e incorporar o material.",
  },
];

export const ContributionGuide = ({ onClose }: ContributionGuideProps) => {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose]);

  return createPortal(
    <div className="contribution-overlay" onClick={onClose}>
      <section
        className="contribution-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="contribution-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="contribution-header">
          <div>
            <p className="eyebrow">Deixe sua contribuição</p>
            <h2 id="contribution-title">Ajude o acervo a continuar crescendo.</h2>
            <p>
              Compartilhe resumos, listas, exercícios, provas anteriores,
              links úteis ou guias de estudo com as próximas turmas.
            </p>
          </div>
          <button className="close-viewer" onClick={onClose} aria-label="Fechar guia">
            ×
          </button>
        </header>

        <div className="contribution-steps">
          {steps.map((step) => (
            <article key={step.number}>
              <span>{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>

        <div className="contribution-details">
          <div>
            <h3>Onde colocar?</h3>
            <code>periodos/XX-periodo/disciplina/categoria/</code>
            <p>
              Categorias comuns: <strong>resumos</strong>, <strong>materiais</strong>,
              <strong> listas-e-exercicios</strong>, <strong>provas-e-avaliacoes</strong>
              {" e "}<strong>projetos</strong>.
            </p>
          </div>
          <div className="contribution-warning">
            <h3>Antes de enviar</h3>
            <p>
              Não envie materiais protegidos por direitos autorais, conteúdo
              ofensivo ou provas completas acompanhadas de gabarito.
            </p>
          </div>
        </div>

        <footer className="contribution-actions">
          <a className="primary-action" href={`${repositoryUrl}/fork`} target="_blank" rel="noreferrer">
            Fazer fork e contribuir ↗
          </a>
          <a href={`${repositoryUrl}/blob/main/CONTRIBUTING.md`} target="_blank" rel="noreferrer">
            Ler instruções completas
          </a>
          <a href={`${repositoryUrl}/issues/new`} target="_blank" rel="noreferrer">
            Tirar uma dúvida
          </a>
        </footer>
      </section>
    </div>,
    document.body,
  );
};
