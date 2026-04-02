"use client";

import { useEffect, useState } from "react";
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

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [missionsLoading, setMissionsLoading] = useState(true);
  const [error, setError] = useState("");
  const [missionsError, setMissionsError] = useState("");
  const [canvasConnected, setCanvasConnected] = useState(false);
  const [canvasChecking, setCanvasChecking] = useState(true);
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
          method: "GET",
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
        const message =
          loadError instanceof Error
            ? loadError.message
            : "Ocorreu um erro inesperado ao carregar o dashboard.";

        setError(message);
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
            method: "GET",
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

    async function checkCanvasConnection() {
      try {
        setCanvasChecking(true);

        const response = await fetch(`${apiBaseUrl}/canvas/courses/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        });

        setCanvasConnected(response.ok);
      } catch {
        setCanvasConnected(false);
      } finally {
        setCanvasChecking(false);
      }
    }

    loadDashboardData();
    loadWeeklyMissions();
    checkCanvasConnection();
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
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background_dark via-primary to-secondary px-6 text-text_light">
        <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-6 py-4 backdrop-blur">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-text_light/30 border-t-text_light" />
          <span className="text-sm font-medium">Carregando dashboard...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(0,188,212,0.22),_transparent_28%),linear-gradient(135deg,_#f8fbff_0%,_#eef6fb_45%,_#ffffff_100%)] px-4 py-8 text-text_dark sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <section className="overflow-hidden rounded-[2rem] bg-white shadow-[0_24px_80px_rgba(42,98,143,0.14)]">
          <div className="grid gap-0 lg:grid-cols-[1.12fr_0.88fr]">
            <div className="bg-background_dark px-6 py-8 text-text_light sm:px-8 lg:px-10">
              <p className="text-xs uppercase tracking-[0.35em] text-secondary">
                Pulse Dashboard
              </p>
              <h1 className="mt-4 text-3xl font-semibold leading-tight sm:text-4xl">
                {user ? `Bem-vindo, ${user.username}.` : "Bem-vindo de volta."}
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-7 text-text_light/75">
                Seu painel centraliza missoes, progresso e integracoes para
                transformar estudo em ritmo constante.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.25em] text-secondary">
                    Perfil
                  </p>
                  <p className="mt-3 text-sm text-text_light/75">{user?.email}</p>
                  <p className="mt-1 text-sm text-text_light/75">
                    Papel: {user?.role || "-"}
                  </p>
                  {user?.school_year && (
                    <p className="mt-1 text-sm text-text_light/75">
                      Ano escolar: {user.school_year}
                    </p>
                  )}
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-secondary">
                      Canvas LMS
                    </p>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        canvasConnected
                          ? "bg-emerald-400/15 text-emerald-300"
                          : "bg-amber-400/15 text-amber-300"
                      }`}
                    >
                      {canvasChecking
                        ? "Checking..."
                        : canvasConnected
                        ? "Connected"
                        : "Not connected"}
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-text_light/75">
                    {canvasConnected
                      ? "Sua conta parece conectada. Sincronize disciplinas, tarefas e notas com o ecossistema Pulse."
                      : "Conecte sua conta para sincronizar disciplinas, tarefas e notas automaticamente."}
                  </p>

                  <a
                    href={`${apiBaseUrl}/canvas/oauth/initiate/`}
                    className="mt-4 inline-flex rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:brightness-105"
                  >
                    {canvasConnected
                      ? "Reconnect Canvas LMS"
                      : "Connect to Canvas LMS"}
                  </a>
                </div>
              </div>
            </div>

            <div className="px-6 py-8 sm:px-8 lg:px-10">
              {error && (
                <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="grid gap-6">
                <section className="rounded-3xl border border-slate-200 bg-background_light p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-primary">
                        My Weekly Missions
                      </p>
                      <h2 className="mt-2 text-xl font-semibold text-text_dark">
                        Missoes da semana
                      </h2>
                    </div>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      {missions.length} ativa{missions.length === 1 ? "" : "s"}
                    </span>
                  </div>

                  {missionsError && (
                    <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {missionsError}
                    </div>
                  )}

                  {missionsLoading ? (
                    <div className="mt-5 flex items-center gap-3 rounded-3xl bg-slate-50 p-5 text-sm text-text_dark/70">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary/25 border-t-primary" />
                      Carregando missoes semanais...
                    </div>
                  ) : missions.length > 0 ? (
                    <div className="mt-5 space-y-4">
                      {missions.map((mission) => (
                        <article
                          key={mission.id}
                          className="rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:border-primary/30 hover:bg-white"
                        >
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0 flex-1">
                              <h3 className="text-lg font-semibold text-text_dark">
                                {mission.title}
                              </h3>
                              <p className="mt-2 text-sm leading-7 text-text_dark/70">
                                {mission.description || "Sem descricao disponivel."}
                              </p>
                              <p className="mt-3 text-xs uppercase tracking-[0.18em] text-primary">
                                Prazo: {formatDueDate(mission.due_date)}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleCompleteMission(mission.id)}
                              disabled={completingMissionId === mission.id}
                              className="inline-flex shrink-0 items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
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
                    <div className="mt-5 rounded-3xl bg-slate-50 p-5 text-sm leading-7 text-text_dark/70">
                      Nenhuma missao pendente foi encontrada agora. Seu Pulse
                      parece em dia.
                    </div>
                  )}
                </section>

                <section className="rounded-3xl border border-slate-200 bg-background_light p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-secondary">
                        Pulse Features
                      </p>
                      <h2 className="mt-2 text-xl font-semibold text-text_dark">
                        Seu ritmo de estudo
                      </h2>
                    </div>
                    <span className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-medium text-secondary">
                      Destaques
                    </span>
                  </div>

                  <div className="mt-5 grid gap-3">
                    <div className="rounded-2xl border border-slate-200 p-4">
                      <p className="text-sm font-medium text-text_dark">
                        Missoes semanais com foco real
                      </p>
                      <p className="mt-1 text-sm text-text_dark/65">
                        Acompanhe entregas concretas, conclua tarefas e avance com
                        constancia.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 p-4">
                      <p className="text-sm font-medium text-text_dark">
                        Integracao com Canvas
                      </p>
                      <p className="mt-1 text-sm text-text_dark/65">
                        Sincronize cursos, tarefas e notas para transformar dados
                        academicos em acoes.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 p-4">
                      <p className="text-sm font-medium text-text_dark">
                        Recomendacoes e diagnosticos
                      </p>
                      <p className="mt-1 text-sm text-text_dark/65">
                        Combine diagnosticos, IA e rotinas de estudo em uma
                        experiencia unica.
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

