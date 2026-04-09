"use client";

import axios from "axios";
import { startTransition, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { RaizLink } from "@/components/navigation/raiz-link";
import { clearTokens, getAccessToken } from "@/lib/auth/token-store";
import { webApiClient } from "@/lib/api/client";
import { sanitizeWebObject } from "@/lib/security/sanitize";


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
      "Os erros recentes sugerem dificuldade anterior em interpretacao algebrica e leitura de enunciado.",
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


export function DashboardClientPanel() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [missionsLoading, setMissionsLoading] = useState(true);
  const [error, setError] = useState("");
  const [missionsError, setMissionsError] = useState("");
  const [completingMissionId, setCompletingMissionId] = useState<number | null>(null);

  useEffect(() => {
    const authToken = getAccessToken();

    if (!authToken) {
      router.push("/login");
      return;
    }

    async function loadDashboardData() {
      try {
        setLoading(true);
        setError("");

        const profileResponse = await webApiClient.get("/auth/profile/");
        const profileData = profileResponse.data;

        startTransition(() => {
          setUser(profileData);
        });
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Ocorreu um erro inesperado ao carregar o dashboard."
        );
        clearTokens();
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }

    async function loadWeeklyMissions() {
      try {
        setMissionsLoading(true);
        setMissionsError("");

        const response = await webApiClient.get(
          "/pulse-missions/missions/",
          { params: { status: "pending" } }
        );
        const data = response.data;

        startTransition(() => {
          setMissions(Array.isArray(data) ? data : []);
        });
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
  }, [router]);

  async function handleCompleteMission(missionId: number) {
    const authToken = getAccessToken();
    if (!authToken) {
      router.push("/login");
      return;
    }

    try {
      setCompletingMissionId(missionId);
      setMissionsError("");

      await webApiClient.post(
        `/pulse-missions/missions/${missionId}/complete/`,
        sanitizeWebObject({ notes: "Completed from dashboard." })
      );

      startTransition(() => {
        setMissions((previous) =>
          previous.filter((mission) => mission.id !== missionId)
        );
      });
    } catch (completeError) {
      setMissionsError(
        axios.isAxiosError(completeError)
          ? completeError.response?.data?.detail || completeError.message
          : completeError instanceof Error
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
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="flex items-center gap-3 rounded-[1.6rem] bg-slate-50 px-4 py-4 text-sm text-text_dark/70">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary/25 border-t-primary" />
          Carregando leitura personalizada...
        </div>
      </div>
    );
  }

  return (
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
              {user ? `Bem-vindo, ${user.username}.` : "Missoes da semana"}
            </h2>
            <p className="max-w-lg text-sm leading-7 text-text_dark/66">
              Ritmo semanal traduzido em passos claros, sem excesso de ruido.
            </p>
          </div>
          <RaizLink
            href="/pulse/ranking"
            transitionType="fade-flow"
            className="koru-secondary-button px-4 py-2 text-sm font-semibold"
          >
            Ver progresso
          </RaizLink>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.6rem] border border-primary/10 bg-primary/5 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-primary">Perfil</p>
            <p className="mt-2 text-lg font-semibold text-text_dark">
              {user?.role || "student"}
            </p>
            <p className="mt-1 text-sm text-text_dark/64">{user?.email}</p>
          </div>
          <div className="rounded-[1.6rem] border border-primary/10 bg-primary/5 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-primary">Missoes</p>
            <p className="mt-2 text-lg font-semibold text-text_dark">{missions.length}</p>
            <p className="mt-1 text-sm text-text_dark/64">pendentes nesta semana</p>
          </div>
          <div className="rounded-[1.6rem] border border-primary/10 bg-primary/5 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-primary">RAIZ Signal</p>
            <p className="mt-2 text-lg font-semibold text-text_dark">Base em leitura</p>
            <p className="mt-1 text-sm text-text_dark/64">diagnostico continuo da fundacao</p>
          </div>
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
                      <span className="koru-chip bg-secondary/10 text-primary">
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
            Nenhuma missao pendente foi encontrada agora. Seu ritmo parece bem calibrado.
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
  );
}
