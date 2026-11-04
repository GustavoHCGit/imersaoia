import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  ArrowUpRight,
  BookOpen,
  BrainCircuit,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Code2,
  Copy,
  Cpu,
  Download,
  FileCode2,
  Github,
  GraduationCap,
  Layers3,
  LibraryBig,
  ListChecks,
  Pencil,
  Plus,
  Rocket,
  ShieldCheck,
  Sparkles,
  Target,
  Terminal,
  Trash2,
  WandSparkles,
  X,
} from "lucide-react";
import { toast } from "sonner";

type View = "overview" | "studyflow" | "agent" | "docs" | "sources";
type Goal = {
  id: string;
  title: string;
  description: string;
  category: string;
  hours: number;
  completed: boolean;
};

type PlanInput = {
  theme: string;
  objective: string;
  availability: string;
  duration: string;
  rhythm: string;
  startDate: string;
};

type PlanWeek = { week: number; title: string; focus: string; tasks: string[] };

const initialGoals: Goal[] = [
  {
    id: "goal-react",
    title: "Revisar componentização em React",
    description: "Separar uma tela em componentes pequenos e reutilizáveis.",
    category: "Frontend",
    hours: 3,
    completed: false,
  },
  {
    id: "goal-agents",
    title: "Praticar o método GCCD",
    description:
      "Escrever um prompt com objetivo, contexto, restrições e critério de conclusão.",
    category: "Agentes de IA",
    hours: 2,
    completed: true,
  },
];

const defaultPlan: PlanInput = {
  theme: "Desenvolvimento web com React",
  objective:
    "Construir uma base sólida para criar aplicações com componentes reutilizáveis",
  availability: "4 horas por semana",
  duration: "4 semanas",
  rhythm: "Prática equilibrada",
  startDate: new Date().toISOString().slice(0, 10),
};

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function isGoal(value: unknown): value is Goal {
  if (!value || typeof value !== "object") return false;
  const goal = value as Partial<Goal>;
  return (
    typeof goal.id === "string" &&
    typeof goal.title === "string" &&
    typeof goal.description === "string" &&
    typeof goal.category === "string" &&
    typeof goal.hours === "number" &&
    Number.isFinite(goal.hours) &&
    typeof goal.completed === "boolean"
  );
}

function loadGoals(): Goal[] {
  try {
    const stored = localStorage.getItem("imersao-studyflow-goals");
    if (!stored) return initialGoals;
    const parsed: unknown = JSON.parse(stored);
    return Array.isArray(parsed) && parsed.every(isGoal) ? parsed : initialGoals;
  } catch {
    return initialGoals;
  }
}

function escapeICS(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/([,;])/g, "\\$1");
}

function formatICSDate(value: Date) {
  return value.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function createPlan(input: PlanInput): PlanWeek[] {
  const weeks = Number(input.duration.match(/\d+/)?.[0] ?? 4);
  const hours = Number(input.availability.match(/\d+/)?.[0] ?? 4);
  const taskCount = hours <= 2 ? 2 : hours >= 6 ? 4 : 3;
  const pace = input.rhythm === "Intensivo"
    ? " com ritmo intensivo"
    : input.rhythm === "Leve e consistente"
      ? " em ritmo leve e consistente"
      : " em ritmo equilibrado";
  const topics = [
    [
      "Fundamentos e mapa do problema",
      "Entender o cenário, os requisitos e o resultado esperado",
      [
        "Definir o objetivo de aprendizagem",
        "Mapear conceitos essenciais",
        "Registrar dúvidas e critérios de pronto",
      ],
    ],
    [
      "Construção guiada",
      "Transformar a ideia em uma primeira solução funcional",
      [
        "Criar um pequeno protótipo",
        "Aplicar prompts em etapas",
        "Revisar o código e anotar decisões",
      ],
    ],
    [
      "Evolução e qualidade",
      "Aprimorar a solução com testes, organização e feedback",
      [
        "Refatorar um componente ou fluxo",
        "Validar casos de uso",
        "Observar erros e ajustar a implementação",
      ],
    ],
    [
      "Entrega e próximos passos",
      "Consolidar o aprendizado em uma demonstração compartilhável",
      [
        "Finalizar uma entrega pequena",
        "Documentar o que foi aprendido",
        "Definir o próximo experimento",
      ],
    ],
  ];
  return Array.from({ length: weeks }, (_, index) => {
    const source = topics[index % topics.length];
    return {
      week: index + 1,
      title: source[0] as string,
      focus: `${source[1] as string}${pace}, aplicado a ${input.objective.toLowerCase()}.`,
      tasks: (source[2] as string[]).slice(0, taskCount),
    };
  });
}

function exportCalendar(input: PlanInput, plan: PlanWeek[]) {
  const start = new Date(`${input.startDate}T19:00:00`);
  if (!input.startDate || Number.isNaN(start.getTime())) {
    toast.error("Escolha uma data válida antes de exportar a agenda.");
    return;
  }
  const events = plan.flatMap((week, weekIndex) =>
    week.tasks.map((task, taskIndex) => {
      const eventDate = new Date(start);
      eventDate.setDate(start.getDate() + weekIndex * 7 + taskIndex * 2);
      const endDate = new Date(eventDate);
      endDate.setMinutes(endDate.getMinutes() + 60);
      const stamp = formatICSDate(eventDate);
      return [
        "BEGIN:VEVENT",
        `UID:${makeId("study")}`,
        `DTSTAMP:${stamp}`,
        `DTSTART:${stamp}`,
        `DTEND:${formatICSDate(endDate)}`,
        `SUMMARY:${escapeICS(`${task} — ${input.theme}`)}`,
        `DESCRIPTION:${escapeICS(`${week.title}. ${week.focus}. Objetivo: ${input.objective}`)}`,
        "END:VEVENT",
      ].join("\r\n");
    })
  );
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "CALSCALE:GREGORIAN",
    "PRODID:-//Gustavo Henrique Constante Neto//Imersao Study Agent//PT-BR",
    ...events,
    "END:VCALENDAR",
  ].join("\r\n");
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "plano-de-estudos.ics";
  link.click();
  URL.revokeObjectURL(url);
}

function Badge({
  children,
  tone = "cyan",
}: {
  children: React.ReactNode;
  tone?: "cyan" | "violet" | "lime" | "slate";
}) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

function SectionHeading({
  eyebrow,
  title,
  description,
  icon: Icon,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: typeof Target;
}) {
  return (
    <div className="section-heading">
      <div className="eyebrow">
        <Icon size={15} /> {eyebrow}
      </div>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}

export default function Home() {
  const [view, setView] = useState<View>("overview");
  const [goals, setGoals] = useState<Goal[]>(loadGoals);
  const [goalForm, setGoalForm] = useState({
    title: "",
    description: "",
    category: "Frontend",
    hours: "2",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [planInput, setPlanInput] = useState<PlanInput>(defaultPlan);
  const [plan, setPlan] = useState<PlanWeek[]>(() => createPlan(defaultPlan));
  const [copied, setCopied] = useState(false);
  const [storageWarning, setStorageWarning] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem("imersao-studyflow-goals", JSON.stringify(goals));
      setStorageWarning(false);
    } catch {
      setStorageWarning(true);
    }
  }, [goals]);

  const completed = goals.filter(goal => goal.completed).length;
  const progress = goals.length
    ? Math.round((completed / goals.length) * 100)
    : 0;
  const totalHours = goals.reduce((sum, goal) => sum + goal.hours, 0);

  const generatedSummary = useMemo(() => {
    return `Plano de ${plan.length} semanas para ${planInput.theme}, com foco em ${planInput.objective.toLowerCase()}.`;
  }, [plan, planInput]);

  function go(next: View) {
    setView(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function submitGoal(event: FormEvent) {
    event.preventDefault();
    if (!goalForm.title.trim()) {
      toast.error("Dê um nome para o objetivo antes de salvar.");
      return;
    }
    if (editingId) {
      setGoals(current =>
        current.map(goal =>
          goal.id === editingId
            ? { ...goal, ...goalForm, hours: Number(goalForm.hours) || 1 }
            : goal
        )
      );
    } else {
      setGoals(current => [
        ...current,
        {
          id: makeId("goal"),
          ...goalForm,
          hours: Number(goalForm.hours) || 1,
          completed: false,
        },
      ]);
    }
    setGoalForm({
      title: "",
      description: "",
      category: "Frontend",
      hours: "2",
    });
    setEditingId(null);
    toast.success(editingId ? "Objetivo atualizado." : "Objetivo adicionado ao StudyFlow.");
  }

  function editGoal(goal: Goal) {
    setEditingId(goal.id);
    setGoalForm({
      title: goal.title,
      description: goal.description,
      category: goal.category,
      hours: String(goal.hours),
    });
    document
      .getElementById("goal-form")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function generate() {
    if (!planInput.theme.trim() || !planInput.objective.trim() || !planInput.startDate) {
      toast.error("Preencha tema, objetivo e data para gerar o plano.");
      return;
    }
    setPlan(createPlan(planInput));
    toast.success("Plano recalculado com as preferências informadas.");
  }

  async function copySummary() {
    if (!navigator.clipboard) {
      toast.error("Seu navegador não permitiu copiar o resumo.");
      return;
    }
    await navigator.clipboard.writeText(generatedSummary);
    setCopied(true);
    toast.success("Resumo copiado.");
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="app-shell">
      <aside className="side-rail">
        <button
          className="brand"
          onClick={() => go("overview")}
          aria-label="Ir para o início"
        >
          <span className="brand-mark">
            <Sparkles size={18} />
          </span>
          <span>
            <strong>
              imersão<span className="brand-dot">.</span>ia
            </strong>
            <small>caderno técnico</small>
          </span>
        </button>
        <div className="rail-label">CONSTRUIR</div>
        <nav className="main-nav" aria-label="Navegação principal">
          <NavItem
            icon={Layers3}
            label="Visão geral"
            active={view === "overview"}
            onClick={() => go("overview")}
          />
          <NavItem
            icon={ListChecks}
            label="StudyFlow"
            active={view === "studyflow"}
            onClick={() => go("studyflow")}
          />
          <NavItem
            icon={BrainCircuit}
            label="Agente de estudos"
            active={view === "agent"}
            onClick={() => go("agent")}
          />
        </nav>
        <div className="rail-label rail-label-secondary">REGISTRAR</div>
        <nav className="main-nav" aria-label="Materiais">
          <NavItem
            icon={BookOpen}
            label="Documentação"
            active={view === "docs"}
            onClick={() => go("docs")}
          />
          <NavItem
            icon={LibraryBig}
            label="Fontes e créditos"
            active={view === "sources"}
            onClick={() => go("sources")}
          />
        </nav>
        <div className="rail-footer">
          <div className="course-note">
            <span className="status-pulse" /> baseado na Imersão Alura
          </div>
          <p>
            Uma implementação educacional para demonstrar o aprendizado — não é
            o repositório oficial.
          </p>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            <span>imersão.ia</span>
            <ChevronRight size={14} />
            <strong>{view === "overview" ? "visão geral" : view}</strong>
          </div>
          <div className="top-actions">
            <Badge tone="lime">modo estudo</Badge>
            <span className="avatar">GN</span>
          </div>
        </header>

        {view === "overview" && (
          <div className="page-content overview-page">
            <section className="hero-panel">
              <div className="hero-copy">
                <Badge>PROJETO DE PORTFÓLIO · 01</Badge>
                <h1>
                  Aprender fazendo.
                  <br />
                  <em>Documentar construindo.</em>
                </h1>
                <p>
                  Uma reprodução didática dos projetos da{" "}
                  <strong>
                    Imersão Engenharia de Software: Dev na Era da IA
                  </strong>
                  . Aqui, o StudyFlow encontra um agente que transforma
                  objetivos em um plano de estudo exportável.
                </p>
                <div className="author-line">
                  <span className="status-pulse" /> Gustavo Henrique Constante Neto · dashboard autoral de aprendizagem
                </div>
                <div className="hero-actions">
                  <button
                    className="button button-primary"
                    onClick={() => go("studyflow")}
                  >
                    <Rocket size={17} /> Abrir StudyFlow
                  </button>
                  <button
                    className="button button-ghost"
                    onClick={() => go("agent")}
                  >
                    <BrainCircuit size={17} /> Experimentar agente
                  </button>
                </div>
              </div>
              <div className="hero-visual" aria-hidden="true">
                <div className="code-window">
                  <div className="window-bar">
                    <span />
                    <span />
                    <span />
                    <small>Agents.md</small>
                  </div>
                  <div className="code-line">
                    <i>01</i>
                    <b className="code-purple">goal</b>:{" "}
                    <span>"aprender construindo"</span>
                  </div>
                  <div className="code-line">
                    <i>02</i>
                    <b className="code-cyan">context</b>:{" "}
                    <span>studyflow + agent</span>
                  </div>
                  <div className="code-line">
                    <i>03</i>
                    <b className="code-lime">constraints</b>:{" "}
                    <span>validar cada etapa</span>
                  </div>
                  <div className="code-line">
                    <i>04</i>
                    <b className="code-orange">done_when</b>:{" "}
                    <span>entrega documentada</span>
                  </div>
                  <div className="cursor-line">
                    <i>05</i>
                    <span className="cursor" />
                  </div>
                </div>
                <div className="orbit orbit-one" />
                <div className="orbit orbit-two" />
                <div className="hero-orb">
                  <Cpu size={27} />
                  <span>AI</span>
                </div>
              </div>
            </section>

            <section className="metrics-row">
              <Metric
                icon={Target}
                label="objetivos no StudyFlow"
                value={String(goals.length).padStart(2, "0")}
                detail={`${completed} concluído(s)`}
              />
              <Metric
                icon={Clock3}
                label="horas planejadas"
                value={`${totalHours}h`}
                detail="persistência local"
              />
              <Metric
                icon={CheckCircle2}
                label="progresso"
                value={`${progress}%`}
                detail="revisão humana ativa"
                accent
              />
            </section>

            <section className="feature-grid">
              <FeatureCard
                number="01"
                icon={ListChecks}
                title="StudyFlow"
                description="CRUD completo para organizar objetivos de estudo, com dados salvos no navegador."
                tags={["React", "TypeScript", "CRUD"]}
                onClick={() => go("studyflow")}
              />
              <FeatureCard
                number="02"
                icon={BrainCircuit}
                title="Agente de estudos"
                description="Gere planos personalizados e uma agenda .ics pronta para importar no Google Calendar."
                tags={["Agents.md", "GCCD", "Google ADK"]}
                onClick={() => go("agent")}
              />
            </section>

            <section className="learning-strip">
              <div className="strip-icon">
                <ShieldCheck size={21} />
              </div>
              <div>
                <strong>O código acelera. A engenharia valida.</strong>
                <p>
                  O aprendizado da imersão não é só pedir para a IA escrever. É
                  especificar, revisar, testar e entender o resultado.
                </p>
              </div>
              <button className="text-button" onClick={() => go("docs")}>
                ver documentação <ArrowUpRight size={15} />
              </button>
            </section>
          </div>
        )}

        {view === "studyflow" && (
          <div className="page-content">
            <SectionHeading
              icon={ListChecks}
              eyebrow="AULA 01 · GOOGLE AI STUDIO"
              title="StudyFlow"
              description="Um CRUD de objetivos de estudo inspirado no projeto trabalhado na imersão. Os dados ficam no navegador para você praticar sem backend."
            />
            <div className="workspace-grid">
              <section className="panel goal-panel" id="goal-form">
                <div className="panel-header">
                  <div>
                    <span className="panel-kicker">
                      {editingId ? "EDITAR OBJETIVO" : "NOVO OBJETIVO"}
                    </span>
                    <h3>
                      {editingId
                        ? "Ajuste o próximo passo"
                        : "O que você quer aprender?"}
                    </h3>
                  </div>
                  <span className="mini-terminal">localStorage</span>
                </div>
                {storageWarning && (
                  <div className="inline-warning">
                    <ShieldCheck size={14} /> O navegador bloqueou a persistência local. Você ainda pode testar o fluxo nesta sessão.
                  </div>
                )}
                <form onSubmit={submitGoal} className="form-stack">
                  <label>
                    Objetivo
                    <input
                      value={goalForm.title}
                      required
                      onChange={event =>
                        setGoalForm({ ...goalForm, title: event.target.value })
                      }
                      placeholder="Ex.: Criar meu primeiro agente"
                    />
                  </label>
                  <label>
                    Descrição
                    <textarea
                      value={goalForm.description}
                      onChange={event =>
                        setGoalForm({
                          ...goalForm,
                          description: event.target.value,
                        })
                      }
                      placeholder="Que resultado você quer alcançar?"
                      rows={3}
                    />
                  </label>
                  <div className="form-row">
                    <label>
                      Trilha
                      <select
                        value={goalForm.category}
                        onChange={event =>
                          setGoalForm({
                            ...goalForm,
                            category: event.target.value,
                          })
                        }
                      >
                        <option>Frontend</option>
                        <option>Agentes de IA</option>
                        <option>Fundamentos</option>
                        <option>Portfólio</option>
                      </select>
                    </label>
                    <label>
                      Horas/semana
                      <input
                        type="number"
                        min="1"
                        max="40"
                        value={goalForm.hours}
                        onChange={event =>
                          setGoalForm({
                            ...goalForm,
                            hours: event.target.value,
                          })
                        }
                      />
                    </label>
                  </div>
                  <div className="form-actions">
                    <button className="button button-primary" type="submit">
                      {editingId ? (
                        <>
                          <Check size={16} /> Salvar alteração
                        </>
                      ) : (
                        <>
                          <Plus size={16} /> Adicionar objetivo
                        </>
                      )}
                    </button>
                    {editingId && (
                      <button
                        className="button button-ghost"
                        type="button"
                        onClick={() => {
                          setEditingId(null);
                          setGoalForm({
                            title: "",
                            description: "",
                            category: "Frontend",
                            hours: "2",
                          });
                        }}
                      >
                        <X size={16} /> Cancelar
                      </button>
                    )}
                  </div>
                </form>
              </section>
              <section className="panel progress-panel">
                <div className="panel-header">
                  <div>
                    <span className="panel-kicker">VISÃO DO CICLO</span>
                    <h3>Seu mapa de progresso</h3>
                  </div>
                  <span className="progress-number">{progress}%</span>
                </div>
                <div className="progress-track">
                  <span style={{ width: `${progress}%` }} />
                </div>
                <div className="progress-meta">
                  <span>
                    {completed} de {goals.length} objetivos concluídos
                  </span>
                  <span>{totalHours}h planejadas</span>
                </div>
                <div className="study-principles">
                  <div>
                    <CheckCircle2 size={17} />
                    <span>
                      Pequenos passos
                      <br />
                      <small>melhor que uma promessa vaga</small>
                    </span>
                  </div>
                  <div>
                    <ShieldCheck size={17} />
                    <span>
                      Revisão humana
                      <br />
                      <small>validar faz parte de aprender</small>
                    </span>
                  </div>
                </div>
              </section>
            </div>
            <section className="goals-section">
              <div className="section-inline">
                <div>
                  <span className="panel-kicker">CRUD DE OBJETIVOS</span>
                  <h3>O que está no seu radar</h3>
                </div>
                <span className="record-count">
                  {String(goals.length).padStart(2, "0")} registros
                </span>
              </div>
              <div className="goals-list">
                {goals.length === 0 ? (
                  <div className="empty-state">
                    <Target size={28} />
                    <p>
                      Ainda não há objetivos. Comece pelo formulário ao lado.
                    </p>
                  </div>
                ) : (
                  goals.map(goal => (
                    <article
                      className={`goal-card ${goal.completed ? "goal-complete" : ""}`}
                      key={goal.id}
                    >
                      <button
                        className="check-button"
                        onClick={() =>
                          setGoals(current =>
                            current.map(item =>
                              item.id === goal.id
                                ? { ...item, completed: !item.completed }
                                : item
                            )
                          )
                        }
                        aria-label={
                          goal.completed
                            ? "Reabrir objetivo"
                            : "Concluir objetivo"
                        }
                      >
                        {goal.completed ? <Check size={17} /> : <span />}
                      </button>
                      <div className="goal-content">
                        <div className="goal-title-row">
                          <h4>{goal.title}</h4>
                          <Badge tone={goal.completed ? "lime" : "cyan"}>
                            {goal.category}
                          </Badge>
                        </div>
                        <p>
                          {goal.description ||
                            "Sem descrição — defina uma próxima ação."}
                        </p>
                        <div className="goal-meta">
                          <span>
                            <Clock3 size={13} /> {goal.hours}h/semana
                          </span>
                          <span
                            className={
                              goal.completed ? "done-text" : "pending-text"
                            }
                          >
                            {goal.completed ? "concluído" : "em andamento"}
                          </span>
                        </div>
                      </div>
                      <div className="goal-actions">
                        <button
                          onClick={() => editGoal(goal)}
                          aria-label="Editar objetivo"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Excluir o objetivo “${goal.title}”?`)) {
                              setGoals(current => current.filter(item => item.id !== goal.id));
                              toast.success("Objetivo excluído.");
                            }
                          }}
                          aria-label="Excluir objetivo"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>
          </div>
        )}

        {view === "agent" && (
          <div className="page-content">
            <SectionHeading
              icon={BrainCircuit}
              eyebrow="AULA 03 · GOOGLE ADK"
              title="Agente de planos de estudo"
              description="Uma implementação local do fluxo demonstrado na aula: preferências entram, um plano sai, e a agenda pode seguir para o Google Calendar."
            />
            <div className="agent-layout">
              <section className="panel agent-form-panel">
                <div className="panel-header">
                  <div>
                    <span className="panel-kicker">AGENTS.MD · GCCD</span>
                    <h3>Defina o contexto do agente</h3>
                  </div>
                  <span className="agent-status">
                    <span /> demo local · determinístico
                  </span>
                </div>
                <div className="method-callout">
                  <span className="method-label">GCCD</span>
                  <p>
                    <strong>Goal</strong> + <strong>Context</strong> +{" "}
                    <strong>Constraints</strong> + <strong>Done When</strong>
                  </p>
                </div>
                <div className="form-stack">
                  <label>
                    Tema do plano
                    <input
                      value={planInput.theme}
                      required
                      onChange={event =>
                        setPlanInput({
                          ...planInput,
                          theme: event.target.value,
                        })
                      }
                    />
                  </label>
                  <label>
                    Objetivo de aprendizagem
                    <textarea
                      value={planInput.objective}
                      required
                      onChange={event =>
                        setPlanInput({
                          ...planInput,
                          objective: event.target.value,
                        })
                      }
                      rows={3}
                    />
                  </label>
                  <div className="form-row">
                    <label>
                      Disponibilidade
                      <select
                        value={planInput.availability}
                        onChange={event =>
                          setPlanInput({
                            ...planInput,
                            availability: event.target.value,
                          })
                        }
                      >
                        <option>2 horas por semana</option>
                        <option>4 horas por semana</option>
                        <option>6 horas por semana</option>
                        <option>8 horas por semana</option>
                      </select>
                    </label>
                    <label>
                      Duração
                      <select
                        value={planInput.duration}
                        onChange={event =>
                          setPlanInput({
                            ...planInput,
                            duration: event.target.value,
                          })
                        }
                      >
                        <option>2 semanas</option>
                        <option>4 semanas</option>
                        <option>6 semanas</option>
                        <option>8 semanas</option>
                      </select>
                    </label>
                  </div>
                  <div className="form-row">
                    <label>
                      Ritmo
                      <select
                        value={planInput.rhythm}
                        onChange={event =>
                          setPlanInput({
                            ...planInput,
                            rhythm: event.target.value,
                          })
                        }
                      >
                        <option>Prática equilibrada</option>
                        <option>Intensivo</option>
                        <option>Leve e consistente</option>
                      </select>
                    </label>
                    <label>
                      Começa em
                    <input
                      type="date"
                      value={planInput.startDate}
                      required
                        onChange={event =>
                          setPlanInput({
                            ...planInput,
                            startDate: event.target.value,
                          })
                        }
                      />
                    </label>
                  </div>
                  <button
                    className="button button-primary full-button"
                    type="button"
                    onClick={generate}
                  >
                    <WandSparkles size={17} /> Gerar plano com o agente
                  </button>
                </div>
              </section>
              <section className="panel plan-output">
                <div className="panel-header">
                  <div>
                    <span className="panel-kicker">DEMO LOCAL · OUTPUT</span>
                    <h3>Plano gerado</h3>
                  </div>
                  <button
                    className="icon-button"
                    onClick={copySummary}
                    aria-label="Copiar resumo"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
                <div className="output-summary">
                  <div className="summary-icon">
                    <CalendarDays size={20} />
                  </div>
                  <div>
                    <strong>{planInput.theme}</strong>
                    <p>{generatedSummary}</p>
                    <span>
                      {planInput.availability} · {planInput.rhythm}
                    </span>
                  </div>
                </div>
                <div className="timeline">
                  {plan.map(week => (
                    <div className="timeline-item" key={week.week}>
                      <div className="timeline-dot">
                        {String(week.week).padStart(2, "0")}
                      </div>
                      <div className="timeline-body">
                        <div className="timeline-heading">
                          <h4>{week.title}</h4>
                          <span>{week.tasks.length} ações</span>
                        </div>
                        <p>{week.focus}</p>
                        <ul>
                          {week.tasks.map(task => (
                            <li key={task}>
                              <CheckCircle2 size={14} /> {task}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  className="button button-outline full-button"
                  onClick={() => exportCalendar(planInput, plan)}
                >
                  <Download size={17} /> Exportar agenda .ics
                </button>
                <p className="helper-text">
                  <CalendarDays size={13} /> No Google Calendar, use “Importar”
                  para adicionar o arquivo. O plano é gerado localmente para demonstrar o fluxo.
                </p>
              </section>
            </div>
          </div>
        )}

        {view === "docs" && <Documentation onNavigate={go} />}
        {view === "sources" && <Sources />}
      </main>
    </div>
  );
}

function NavItem({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: typeof Target;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`nav-item ${active ? "nav-active" : ""}`}
      onClick={onClick}
    >
      <Icon size={17} />
      <span>{label}</span>
      {active && <ChevronRight size={14} className="nav-chevron" />}
    </button>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  detail,
  accent = false,
}: {
  icon: typeof Target;
  label: string;
  value: string;
  detail: string;
  accent?: boolean;
}) {
  return (
    <div className={`metric ${accent ? "metric-accent" : ""}`}>
      <div className="metric-icon">
        <Icon size={17} />
      </div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{detail}</small>
      </div>
    </div>
  );
}

function FeatureCard({
  number,
  icon: Icon,
  title,
  description,
  tags,
  onClick,
}: {
  number: string;
  icon: typeof Target;
  title: string;
  description: string;
  tags: string[];
  onClick: () => void;
}) {
  return (
    <button className="feature-card" onClick={onClick}>
      <div className="feature-top">
        <span className="feature-number">{number}</span>
        <span className="feature-icon">
          <Icon size={20} />
        </span>
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      <div className="feature-bottom">
        <div>
          {tags.map(tag => (
            <Badge key={tag} tone="slate">
              {tag}
            </Badge>
          ))}
        </div>
        <ArrowUpRight size={18} />
      </div>
    </button>
  );
}

function Documentation({ onNavigate }: { onNavigate: (view: View) => void }) {
  const cards = [
    {
      icon: Code2,
      title: "React + TypeScript",
      text: "O StudyFlow pratica componentização, estado local e formulários tipados para transformar requisitos em uma interface funcional.",
    },
    {
      icon: Terminal,
      title: "GCCD e Agents.md",
      text: "Goal, Context, Constraints e Done When organizam o contexto do agente e deixam o critério de pronto explícito.",
    },
    {
      icon: Cpu,
      title: "Skills, MCP e ADK",
      text: "A imersão apresenta skills e toolsets como blocos para tornar o desenvolvimento agêntico mais estruturado.",
    },
    {
      icon: ShieldCheck,
      title: "Qualidade e observabilidade",
      text: "Testes, traces, permissões, depuração e revisão humana são parte da entrega — não um passo depois dela.",
    },
  ];
  return (
    <div className="page-content">
      <SectionHeading
        icon={BookOpen}
        eyebrow="CADERNO TÉCNICO"
        title="O que foi praticado"
        description="Uma leitura rápida dos conceitos que aparecem nos projetos. Use esta seção como guia para explicar o aprendizado em uma entrevista ou no README."
      />
      <div className="docs-grid">
        {cards.map(({ icon: Icon, title, text }) => (
          <article className="doc-card" key={title}>
            <div className="doc-icon">
              <Icon size={19} />
            </div>
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </div>
      <section className="gccd-panel">
        <div className="gccd-head">
          <Badge tone="violet">MÉTODO DE PROMPT</Badge>
          <h3>Um pedido melhor começa antes do código.</h3>
          <p>
            Na imersão, o método GCCD estrutura a conversa com o agente para
            reduzir ambiguidades e controlar o consumo de tokens.
          </p>
        </div>
        <div className="gccd-steps">
          <div>
            <span>G</span>
            <strong>Goal</strong>
            <small>qual é o objetivo?</small>
          </div>
          <div>
            <span>C</span>
            <strong>Context</strong>
            <small>o que o agente precisa saber?</small>
          </div>
          <div>
            <span>C</span>
            <strong>Constraints</strong>
            <small>quais limites existem?</small>
          </div>
          <div>
            <span>D</span>
            <strong>Done When</strong>
            <small>como saberemos que terminou?</small>
          </div>
        </div>
      </section>
      <div className="docs-cta">
        <FileCode2 size={20} />
        <div>
          <strong>Quer ver os projetos funcionando?</strong>
          <p>Volte ao StudyFlow ou gere um novo plano com o agente.</p>
        </div>
        <button className="text-button" onClick={() => onNavigate("studyflow")}>
          abrir laboratório <ArrowUpRight size={15} />
        </button>
      </div>
    </div>
  );
}

function Sources() {
  return (
    <div className="page-content">
      <SectionHeading
        icon={LibraryBig}
        eyebrow="TRANSPARÊNCIA"
        title="Fontes e créditos"
        description="Esta página identifica o que foi reproduzido e de onde veio cada referência, para que o projeto demonstre aprendizado com honestidade."
      />
      <div className="source-banner">
        <GraduationCap size={23} />
        <div>
          <strong>Implementação educacional baseada na Imersão Alura</strong>
          <p>
            Não é o repositório oficial da Alura e não representa uma entrega
            oficial do curso. O código foi organizado como prática de portfólio.
          </p>
        </div>
      </div>
      <section className="sources-list">
        <SourceItem
          number="01"
          title="Página da imersão"
          description="Estrutura, cronograma, certificado e contexto geral da Imersão Engenharia de Software: Dev na Era da IA."
          href="https://cursos.alura.com.br/imersao/imersao-engenharia-software-ia-google"
        />
        <SourceItem
          number="02"
          title="Aula 01 — Da ideia ao código"
          description="StudyFlow, Google AI Studio, CRUD, persistência no navegador, React, TypeScript e componentização."
          href="https://cursos.alura.com.br/imersoes/aulas/aula-01-c245"
        />
        <SourceItem
          number="03"
          title="Aula 02 — Evolua seu software"
          description="Google Antigravity, GCCD, Cloud Shell, skills, MCP, Harness, Context Engineering e Agents.md."
          href="https://cursos.alura.com.br/imersoes/aulas/aula-02-c246"
        />
        <SourceItem
          number="04"
          title="Aula 03 — Conectando o projeto"
          description="Agente de planos de estudo, Google ADK, Skills Toolset, Environment Toolset, ADK Web, traces e agenda para o Google Calendar."
          href="https://cursos.alura.com.br/imersoes/aulas/aula-03-c247"
        />
      </section>
      <div className="credits-row">
        <div>
            <span className="panel-kicker">CERTIFICADO</span>
            <strong>Gustavo Henrique Constante Neto</strong>
            <small>Imersão finalizada em 04/11/2026 · 4h estimadas</small>
            <small>Autoria da adaptação e documentação: Gustavo Henrique Constante Neto</small>
        </div>
        <a
          className="button button-outline"
          href="https://cursos.alura.com.br/user/guxtaneto7/immersion/certificate/114695"
          target="_blank"
          rel="noreferrer"
        >
          ver certificado <ArrowUpRight size={15} />
        </a>
      </div>
    </div>
  );
}

function SourceItem({
  number,
  title,
  description,
  href,
}: {
  number: string;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <a className="source-item" href={href} target="_blank" rel="noreferrer">
      <span className="source-number">{number}</span>
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <ArrowUpRight size={17} />
    </a>
  );
}
