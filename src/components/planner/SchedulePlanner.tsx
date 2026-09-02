import { useMemo, useRef, useState } from "react";
import { curriculum } from "../../data/curriculum";
import { usePlanner } from "../../hooks/usePlanner";
import type { Course, CourseKind, Meeting, Weekday } from "../../types/planner";

const weekdays: { id: Weekday; label: string }[] = [
  { id: "seg", label: "Segunda" },
  { id: "ter", label: "Terça" },
  { id: "qua", label: "Quarta" },
  { id: "qui", label: "Quinta" },
  { id: "sex", label: "Sexta" },
];

const kindLabels: Record<CourseKind, string> = {
  mandatory: "Obrigatória",
  elective: "Optativa do PPC",
  external: "Optativa externa",
  experimental: "Nova / experimental",
};

const createMeeting = (): Meeting => ({ day: "seg", start: "08:00", end: "10:00" });

const overlaps = (first: Meeting, second: Meeting) =>
  first.day === second.day && first.start < second.end && second.start < first.end;

export function SchedulePlanner() {
  const { data, setData, toggleCompleted, addPlannedCourse, removePlannedCourse } = usePlanner();
  const [query, setQuery] = useState("");
  const [period, setPeriod] = useState("all");
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customKind, setCustomKind] = useState<CourseKind>("experimental");
  const [meetings, setMeetings] = useState<Meeting[]>([createMeeting()]);
  const [notice, setNotice] = useState<string | null>(null);
  const importInput = useRef<HTMLInputElement>(null);

  const filteredCourses = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
    return curriculum.filter((item) => {
      const matchesPeriod = period === "all" || (period === "elective" ? item.kind === "elective" : item.period === Number(period));
      return matchesPeriod && (!normalizedQuery || item.name.toLocaleLowerCase("pt-BR").includes(normalizedQuery));
    });
  }, [period, query]);

  const conflictedIds = useMemo(() => {
    const conflicts = new Set<string>();
    data.plannedCourses.forEach((course, index) => {
      data.plannedCourses.slice(index + 1).forEach((other) => {
        if (course.meetings.some((meeting) => other.meetings.some((candidate) => overlaps(meeting, candidate)))) {
          conflicts.add(course.id);
          conflicts.add(other.id);
        }
      });
    });
    return conflicts;
  }, [data.plannedCourses]);

  const prerequisiteNames = (item: Course) =>
    item.prerequisites?.map((id) => curriculum.find((candidate) => candidate.id === id)?.name ?? id) ?? [];

  const openCourseForm = (item: Course | null) => {
    setFormOpen(true);
    setEditingCourse(item);
    setCustomName(item?.name ?? "");
    setCustomKind(item?.kind ?? "experimental");
    setMeetings([createMeeting()]);
    setNotice(null);
  };

  const savePlannedCourse = () => {
    const name = customName.trim();
    const validMeetings = meetings.filter((meeting) => meeting.start < meeting.end);
    if (!name || validMeetings.length !== meetings.length) {
      setNotice("Informe o nome e confira se cada horário termina depois de começar.");
      return;
    }
    addPlannedCourse({
      id: crypto.randomUUID(),
      courseId: editingCourse?.id,
      name,
      kind: editingCourse?.kind ?? customKind,
      meetings: validMeetings,
    });
    setEditingCourse(null);
    setFormOpen(false);
    setCustomName("");
    setMeetings([createMeeting()]);
    setNotice("Disciplina adicionada à grade.");
  };

  const updateMeeting = (index: number, patch: Partial<Meeting>) => {
    setMeetings((current) => current.map((meeting, meetingIndex) => meetingIndex === index ? { ...meeting, ...patch } : meeting));
  };

  const exportBackup = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "grade-uabj-backup.json";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const importBackup = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text()) as Partial<typeof data>;
      if (!Array.isArray(parsed.completedCourseIds) || !Array.isArray(parsed.plannedCourses)) throw new Error();
      setData({ completedCourseIds: parsed.completedCourseIds, plannedCourses: parsed.plannedCourses });
      setNotice("Backup importado com sucesso.");
    } catch {
      setNotice("Esse arquivo não é um backup válido do planejador.");
    }
  };

  return (
    <section className="planner-page">
      <header className="planner-hero">
        <div>
          <p className="eyebrow">Planejamento pessoal</p>
          <h1>Monte uma possível grade antes da matrícula.</h1>
          <p>Use o catálogo do PPC como referência, adicione ofertas do período e identifique choques de horário. Seus dados ficam somente neste navegador.</p>
        </div>
        <div className="planner-summary">
          <span><strong>{data.plannedCourses.length}</strong> disciplinas</span>
          <span className={conflictedIds.size ? "has-conflict" : ""}><strong>{conflictedIds.size}</strong> com conflito</span>
        </div>
      </header>

      <div className="planner-toolbar">
        <button className="primary-planner-action" onClick={() => openCourseForm(null)}>+ Adicionar nova matéria</button>
        <button onClick={exportBackup}>Exportar backup</button>
        <button onClick={() => importInput.current?.click()}>Importar backup</button>
        <input ref={importInput} type="file" accept="application/json" hidden onChange={(event) => { const file = event.target.files?.[0]; if (file) void importBackup(file); event.target.value = ""; }} />
        <small>Salvo automaticamente no dispositivo</small>
      </div>

      {notice && <p className="planner-notice" role="status">{notice}</p>}

      <div className="planner-layout">
        <aside className="course-catalog">
          <div className="catalog-heading">
            <div><p className="eyebrow">PPC 2020</p><h2>Catálogo de disciplinas</h2></div>
            <span>{filteredCourses.length}</span>
          </div>
          <div className="catalog-filters">
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar disciplina" aria-label="Buscar disciplina" />
            <select value={period} onChange={(event) => setPeriod(event.target.value)} aria-label="Filtrar por período">
              <option value="all">Todos os períodos</option>
              {Array.from({ length: 10 }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1}º período</option>)}
              <option value="elective">Optativas do PPC</option>
            </select>
          </div>
          <div className="course-list">
            {filteredCourses.map((item) => {
              const completed = data.completedCourseIds.includes(item.id);
              const prerequisites = prerequisiteNames(item);
              const prerequisitesMet = item.prerequisites?.every((id) => data.completedCourseIds.includes(id)) ?? true;
              return (
                <article className={`course-card ${completed ? "completed" : ""}`} key={item.id}>
                  <div className="course-card-top">
                    <span>{item.period ? `${item.period}º período` : kindLabels[item.kind]}</span>
                    <small>{item.workload}h</small>
                  </div>
                  <h3>{item.name}</h3>
                  {prerequisites.length > 0 && <p className={prerequisitesMet ? "requirements-met" : "requirements-pending"}>Pré: {prerequisites.join(", ")}</p>}
                  <div className="course-actions">
                    <button onClick={() => toggleCompleted(item.id)}>{completed ? "✓ Concluída" : "Marcar concluída"}</button>
                    <button className="plan-course" onClick={() => openCourseForm(item)}>Planejar</button>
                  </div>
                </article>
              );
            })}
          </div>
        </aside>

        <div className="schedule-panel">
          <div className="schedule-heading">
            <div><p className="eyebrow">Minha simulação</p><h2>Grade semanal</h2></div>
            {conflictedIds.size > 0 && <span className="conflict-label">⚠ Revise os conflitos</span>}
          </div>
          <div className="weekly-board">
            {weekdays.map((weekday) => {
              const entries = data.plannedCourses.flatMap((item) => item.meetings.filter((meeting) => meeting.day === weekday.id).map((meeting) => ({ item, meeting }))).sort((a, b) => a.meeting.start.localeCompare(b.meeting.start));
              return (
                <section className="weekday-column" key={weekday.id}>
                  <h3>{weekday.label}</h3>
                  <div className="weekday-entries">
                    {entries.length === 0 && <p>Livre</p>}
                    {entries.map(({ item, meeting }, index) => (
                      <article className={`schedule-entry ${conflictedIds.has(item.id) ? "conflict" : ""}`} key={`${item.id}-${index}`}>
                        <time>{meeting.start}–{meeting.end}</time>
                        <strong>{item.name}</strong>
                        <small>{kindLabels[item.kind]}</small>
                        <button onClick={() => removePlannedCourse(item.id)} aria-label={`Remover ${item.name}`}>×</button>
                      </article>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
          {data.plannedCourses.length === 0 && <div className="empty-schedule"><span>▦</span><h3>Sua grade ainda está vazia</h3><p>Escolha uma disciplina no catálogo ou adicione uma oferta nova.</p></div>}
          <p className="planner-disclaimer">Ferramenta de apoio. Confirme horários, requisitos e disponibilidade no sistema oficial antes da matrícula.</p>
        </div>
      </div>

      {formOpen && (
        <div className="planner-dialog-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) { setFormOpen(false); setEditingCourse(null); setCustomName(""); setMeetings([createMeeting()]); } }}>
          <section className="planner-dialog" role="dialog" aria-modal="true" aria-labelledby="planner-dialog-title">
            <div className="planner-dialog-header">
              <div><p className="eyebrow">Oferta do período</p><h2 id="planner-dialog-title">Adicionar à grade</h2></div>
              <button onClick={() => { setFormOpen(false); setEditingCourse(null); setCustomName(""); setMeetings([createMeeting()]); }} aria-label="Fechar">×</button>
            </div>
            <label>Disciplina<input value={customName} onChange={(event) => setCustomName(event.target.value)} disabled={Boolean(editingCourse)} /></label>
            {!editingCourse && <label>Tipo<select value={customKind} onChange={(event) => setCustomKind(event.target.value as CourseKind)}><option value="experimental">Nova / experimental</option><option value="external">Optativa externa</option><option value="elective">Optativa do PPC</option><option value="mandatory">Obrigatória</option></select></label>}
            <div className="meeting-list">
              {meetings.map((meeting, index) => (
                <div className="meeting-row" key={index}>
                  <label>Dia<select value={meeting.day} onChange={(event) => updateMeeting(index, { day: event.target.value as Weekday })}>{weekdays.map((weekday) => <option value={weekday.id} key={weekday.id}>{weekday.label}</option>)}</select></label>
                  <label>Início<input type="time" value={meeting.start} onChange={(event) => updateMeeting(index, { start: event.target.value })} /></label>
                  <label>Fim<input type="time" value={meeting.end} onChange={(event) => updateMeeting(index, { end: event.target.value })} /></label>
                  {meetings.length > 1 && <button onClick={() => setMeetings((current) => current.filter((_, meetingIndex) => meetingIndex !== index))} aria-label="Remover encontro">×</button>}
                </div>
              ))}
            </div>
            <button className="add-meeting" onClick={() => setMeetings((current) => [...current, createMeeting()])}>+ Outro encontro na semana</button>
            {notice && <p className="form-notice">{notice}</p>}
            <div className="planner-dialog-actions"><button onClick={() => { setFormOpen(false); setEditingCourse(null); setCustomName(""); setMeetings([createMeeting()]); }}>Cancelar</button><button className="primary-planner-action" onClick={savePlannedCourse}>Adicionar à grade</button></div>
          </section>
        </div>
      )}
    </section>
  );
}
