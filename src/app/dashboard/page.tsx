"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type UserProfile = {
  email: string;
  username: string;
  role: string;
  school_year?: string | null;
};

type Mission = {
  id: number;
  title: string;
  description: string;
  due_date?: string | null;
  status: string;
};

const raizSignals = [
  {
    title: "DeepScan Alert",
    subtitle: "Base fragil em funcoes",
    description:
      "Os erros recentes sugerem dificuldade anterior em interpretacao algébrica e leitura de enunciado.",
  },
  {
    title: "Tracker universitario",
    subtitle: "FUVEST Med",
    description: "Delta estimado: -52 pontos para o alvo atual.",
  },
  {
    title: "Focus Flow",
    subtitle: "Sessao profunda",
    description: "Pronto para um bloco de 45 minutos sem ruido cognitivo.",
  },
];

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [missionsLoading, setMissionsLoading] = useState(true);
  const [error, setError] = useState("");
  const [missionsError, setMissionsError] = useState("");
  const [completingMissionId, setCompletingMissionId] = useState<number | null>(
    null
  );

  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

  useEffect(() => {
    const authToken = localStorage.getItem("authToken");

    if (!authToken) {
      router.push("/login");
      return;
    }

    async function loadDashboardData() {
      try {
        setLoading(true);
        setError("");

        const profileResponse = await fetch(`${apiBaseUrl}/auth/profile/`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        });

        const profileData = await profileResponse.json().catch(() => null);

        if (!profileResponse.ok) {
          throw new Error(
            profileData?.detail || "Nao foi possivel carregar o perfil do usuario."
          );
        }

        setUser(profileData);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Ocorreu um erro inesperado ao carregar o dashboard."
        );
        localStorage.removeItem("authToken");
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }

    async function loadWeeklyMissions() {
      try {
        setMissionsLoading(true);
        setMissionsError("");

        const response = await fetch(
          `${apiBaseUrl}/pulse-missions/missions/?status=pending`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json().catch(() => []);

        if (!response.ok) {
          throw new Error("Nao foi possivel carregar as missoes semanais.");
        }

        setMissions(Array.isArray(data) ? data : []);
      } catch (loadError) {
        setMissionsError(
          loadError instanceof Error
            ? loadError.message
            : "Erro inesperado ao carregar missoes."
        );
      } finally {
        setMissionsLoading(false);
      }
    }

    loadDashboardData();
    loadWeeklyMissions();
  }, [apiBaseUrl, router]);

  async function handleCompleteMission(missionId: number) {
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      router.push("/login");
      return;
    }

    try {
      setCompletingMissionId(missionId);
      setMissionsError("");

      const response = await fetch(
        `${apiBaseUrl}/pulse-missions/missions/${missionId}/complete/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ notes: "Completed from dashboard." }),
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.detail || "Nao foi possivel marcar a missao como concluida."
        );
      }

      setMissions((previous) =>
        previous.filter((mission) => mission.id !== missionId)
      );
    } catch (completeError) {
      setMissionsError(
        completeError instanceof Error
          ? completeError.message
          : "Erro inesperado ao concluir missao."
      );
    } finally {
      setCompletingMissionId(null);
    }
  }

  function formatDueDate(value?: string | null) {
    if (!value) {
      return "Sem prazo definido";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "Prazo indisponivel";
    }

    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 text-text_dark">
        <div className="koru-shell flex items-center gap-3 rounded-[1.6rem] px-6 py-4">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary/25 border-t-primary" />
          <span className="text-sm font-semibold">Carregando dashboard...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="koru-grid min-h-screen px-4 py-8 text-text_dark sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="koru-shell overflow-hidden rounded-[2.35rem]">
          <div className="grid gap-0 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="koru-panel-dark px-6 py-8 text-text_light sm:px-8 xl:px-12">
              <div className="space-y-8">
                <div className="space-y-4">
                  <p className="koru-kicker text-secondary">Pulse Dashboard</p>
                  <div className="space-y-4">
                    <h1 className="max-w-2xl text-4xl font-semibold leading-tight xl:text-5xl">
                      {user
                        ? `Bem-vindo, ${user.username}.`
                        : "Seu centro de leitura da base academica."}
                    </h1>
                    <p className="max-w-xl text-base leading-8 text-text_light/76">
                      KORU organiza sinais de mastery, lacunas de fundamento e
                      proximos passos com a calma de um guia sereno.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="koru-stat rounded-[1.7rem] p-5">
                    <p className="text-xs uppercase tracking-[0.22em] text-secondary">
                      Perfil
                    </p>
                    <p className="mt-3 text-lg font-semibold text-white">
                      {user?.role || "student"}
                    </p>
                    <p className="mt-1 text-sm text-text_light/72">
                      {user?.email}
                    </p>
                  </div>
                  <div className="koru-stat rounded-[1.7rem] p-5">
                    <p className="text-xs uppercase tracking-[0.22em] text-secondary">
                      Missoes abertas
                    </p>
                    <p className="mt-3 text-lg font-semibold text-white">
                      {missions.length}
                    </p>
                    <p className="mt-1 text-sm text-text_light/72">
                      foco semanal em andamento
                    </p>
                  </div>
                  <div className="koru-stat rounded-[1.7rem] p-5">
                    <p className="text-xs uppercase tracking-[0.22em] text-secondary">
                      RAIZ signal
                    </p>
                    <p className="mt-3 text-lg font-semibold text-white">
                      Base em leitura
                    </p>
                    <p className="mt-1 text-sm text-text_light/72">
                      diagnostico continuo da fundacao cognitiva
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                  <div className="rounded-[1.8rem] border border-white/10 bg-white/6 p-6">
                    <p className="text-xs uppercase tracking-[0.22em] text-secondary">
                      Doutrina RAIZ
                    </p>
                    <p className="mt-3 max-w-xl text-lg leading-8 text-text_light/82">
                      Va direto na base. O resto e consequencia.
                    </p>
                  </div>
                  <div className="rounded-[1.8rem] border border-white/10 bg-white/6 p-6">
                    <p className="text-xs uppercase tracking-[0.22em] text-secondary">
                      Proximo movimento
                    </p>
                    <div className="mt-4 rounded-[1.4rem] border border-white/10 bg-black/10 px-4 py-4 text-sm leading-7 text-text_light/78">
                      DeepScan e BKT devem priorizar a revisao de pre-requisitos
                      antes de liberar topicos mais complexos.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-8 sm:px-8 xl:px-12">
              <div className="space-y-6">
                {error && (
                  <div className="rounded-[1.45rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <section className="koru-card rounded-[1.9rem] p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-2">
                      <span className="koru-chip bg-primary/10 text-primary">
                        Weekly Focus
                      </span>
                      <h2 className="text-2xl font-semibold text-text_dark">
                        Missoes da semana
                      </h2>
                      <p className="max-w-lg text-sm leading-7 text-text_dark/66">
                        Ritmo semanal traduzido em passos claros, sem excesso de ruido.
                      </p>
                    </div>
                    <Link
                      href="/pulse/ranking"
                      className="koru-secondary-button px-4 py-2 text-sm font-semibold"
                    >
                      Ver progresso
                    </Link>
                  </div>

                  {missionsError && (
                    <div className="mt-5 rounded-[1.3rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {missionsError}
                    </div>
                  )}

                  {missionsLoading ? (
                    <div className="mt-5 flex items-center gap-3 rounded-[1.6rem] bg-slate-50 px-4 py-4 text-sm text-text_dark/70">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary/25 border-t-primary" />
                      Carregando missoes semanais...
                    </div>
                  ) : missions.length > 0 ? (
                    <div className="mt-5 space-y-4">
                      {missions.map((mission) => (
                        <article
                          key={mission.id}
                          className="pulse-ring relative rounded-[1.7rem] border border-slate-200 bg-white p-5 shadow-[0_16px_32px_rgba(42,98,143,0.06)]"
                        >
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="space-y-3">
                              <div className="flex flex-wrap items-center gap-3">
                                <h3 className="text-lg font-semibold text-text_dark">
                                  {mission.title}
                                </h3>
                                <span className="koru-chip bg-secondary/10 text-secondary">
                                  {mission.status}
                                </span>
                              </div>
                              <p className="max-w-xl text-sm leading-7 text-text_dark/68">
                                {mission.description || "Sem descricao disponivel."}
                              </p>
                              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                                Prazo: {formatDueDate(mission.due_date)}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleCompleteMission(mission.id)}
                              disabled={completingMissionId === mission.id}
                              className="koru-primary-button px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-70"
                            >
                              {completingMissionId === mission.id
                                ? "Concluindo..."
                                : "Marcar como concluida"}
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-5 rounded-[1.65rem] border border-dashed border-slate-300 bg-slate-50 p-5 text-sm leading-7 text-text_dark/68">
                      Nenhuma missao pendente foi encontrada agora. Seu ritmo
                      parece bem calibrado.
                    </div>
                  )}
                </section>

                <section className="grid gap-4 md:grid-cols-3">
                  {raizSignals.map((signal) => (
                    <article key={signal.title} className="koru-card rounded-[1.6rem] p-5">
                      <p className="text-xs uppercase tracking-[0.2em] text-primary">
                        {signal.title}
                      </p>
                      <h3 className="mt-3 text-lg font-semibold text-text_dark">
                        {signal.subtitle}
                      </h3>
                      <p className="mt-2 text-sm leading-7 text-text_dark/66">
                        {signal.description}
                      </p>
                    </article>
                  ))}
                </section>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
