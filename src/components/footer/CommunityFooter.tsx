import { useEffect, useState } from "react";
import { fetchContributors } from "../../services/contributors";
import type { Contributor } from "../../types/contributor";

interface ContributorGroupProps {
  contributors: Contributor[];
  description: string;
  loading: boolean;
  repositoryUrl: string;
  title: string;
}

function ContributorGroup({ contributors, description, loading, repositoryUrl, title }: ContributorGroupProps) {
  return (
    <section className="contributor-group">
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <div className="contributor-avatars" aria-label={title}>
        {loading && Array.from({ length: 3 }, (_, index) => <span className="avatar-placeholder" key={index} />)}
        {!loading && contributors.map((contributor) => (
          <a
            href={contributor.profileUrl}
            key={contributor.id}
            target="_blank"
            rel="noreferrer"
            title={`@${contributor.login} · ${contributor.contributions} contribuição${contributor.contributions === 1 ? "" : "ões"}`}
            aria-label={`Abrir perfil de ${contributor.login} no GitHub`}
          >
            <img src={`${contributor.avatarUrl}&s=96`} alt={`Foto de ${contributor.login}`} loading="lazy" />
          </a>
        ))}
        {!loading && contributors.length === 0 && <a className="contributors-fallback" href={repositoryUrl} target="_blank" rel="noreferrer">Ver no GitHub ↗</a>}
      </div>
    </section>
  );
}

interface CommunityFooterProps {
  onContribute: () => void;
}

export function CommunityFooter({ onContribute }: CommunityFooterProps) {
  const [panelContributors, setPanelContributors] = useState<Contributor[]>([]);
  const [materialContributors, setMaterialContributors] = useState<Contributor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    Promise.allSettled([
      fetchContributors("PED-LCN", "Acervo_UABJ"),
      fetchContributors("FelipePatriota", "uabj-engenharia-computacao"),
    ]).then(([panelResult, materialResult]) => {
      if (cancelled) return;
      if (panelResult.status === "fulfilled") setPanelContributors(panelResult.value);
      if (materialResult.status === "fulfilled") setMaterialContributors(materialResult.value);
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, []);

  return (
    <footer className="community-footer">
      <div className="footer-intro">
        <div><p className="eyebrow">Feito em comunidade</p><h2>Pessoas que mantêm este acervo vivo.</h2></div>
        <div className="footer-links">
          <button onClick={onContribute}>Como contribuir</button>
          <a href="https://github.com/FelipePatriota/uabj-engenharia-computacao" target="_blank" rel="noreferrer">Acessar repositório de materiais ↗</a>
        </div>
      </div>
      <div className="contributor-groups">
        <ContributorGroup
          title="Contribuidores do painel"
          description="Desenvolvem e melhoram esta plataforma."
          contributors={panelContributors}
          loading={loading}
          repositoryUrl="https://github.com/PED-LCN/Acervo_UABJ"
        />
        <ContributorGroup
          title="Contribuidores do acervo"
          description="Compartilham materiais com os outros alunos."
          contributors={materialContributors}
          loading={loading}
          repositoryUrl="https://github.com/FelipePatriota/uabj-engenharia-computacao"
        />
      </div>
      <div className="footer-base"><span>Acervo comunitário da UABJ</span><span>Dados públicos fornecidos pelo GitHub</span></div>
    </footer>
  );
}
