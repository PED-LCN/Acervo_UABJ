import { useEffect, useMemo, useState } from "react";
import { professors } from "../../data/professors";
import type { Professor } from "../../types/professor";

interface ProfessorsDirectoryProps {
  onClose: () => void;
}

const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

function ProfessorCard({ professor }: { professor: Professor }) {
  return (
    <article className="professor-card">
      <span className="professor-initials" aria-hidden="true">{professor.name.split(" ").slice(0, 2).map((part) => part[0]).join("")}</span>
      <div>
        <h3>{professor.name}</h3>
        <a href={`mailto:${professor.email}`}>{professor.email}</a>
      </div>
      <div className="professor-links">
        <a className="email-professor" href={`mailto:${professor.email}`} aria-label={`Enviar e-mail para ${professor.name}`} title="Enviar e-mail">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18v12H3zM3 7l9 7 9-7" /></svg>
        </a>
        {professor.linkedinUrl && <a href={professor.linkedinUrl} target="_blank" rel="noreferrer">LinkedIn</a>}
        {professor.sigaaUrl && <a href={professor.sigaaUrl} target="_blank" rel="noreferrer">SIGAA</a>}
      </div>
    </article>
  );
}

export function ProfessorsDirectory({ onClose }: ProfessorsDirectoryProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose]);

  const filtered = useMemo(() => {
    const normalizedQuery = normalize(query.trim());
    return professors.filter((professor) => !normalizedQuery || normalize(`${professor.name} ${professor.email}`).includes(normalizedQuery));
  }, [query]);

  const regular = filtered.filter((professor) => !professor.substitute);
  const substitutes = filtered.filter((professor) => professor.substitute);

  return (
    <div className="professors-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="professors-dialog" role="dialog" aria-modal="true" aria-labelledby="professors-title">
        <header className="professors-header">
          <div><p className="eyebrow">Contatos acadêmicos</p><h2 id="professors-title">Encontre um professor</h2><p>Consulte o e-mail institucional para tirar dúvidas ou solicitar orientações.</p></div>
          <button onClick={onClose} aria-label="Fechar contatos">×</button>
        </header>
        <label className="professors-search">
          <span aria-hidden="true">⌕</span>
          <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nome ou e-mail" />
        </label>
        <div className="professors-content">
          {regular.length > 0 && <section><div className="professors-section-title"><h3>Professores</h3><span>{regular.length}</span></div><div className="professors-grid">{regular.map((professor) => <ProfessorCard professor={professor} key={professor.email} />)}</div></section>}
          {substitutes.length > 0 && <section><div className="professors-section-title"><h3>Professores substitutos</h3><span>{substitutes.length}</span></div><div className="professors-grid">{substitutes.map((professor) => <ProfessorCard professor={professor} key={professor.email} />)}</div></section>}
          {filtered.length === 0 && <div className="professors-empty"><strong>Nenhum contato encontrado</strong><p>Tente pesquisar outro nome ou e-mail.</p></div>}
        </div>
        <footer className="professors-note">Os endereços são institucionais. Novos links de perfil poderão ser adicionados futuramente.</footer>
      </section>
    </div>
  );
}
