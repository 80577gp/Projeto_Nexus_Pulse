"use client";

import { useEffect, useState } from "react";

type RankingEntry = {
  student?: number;
  weekly_score: string | number;
  ranking_position?: number;
  last_updated?: string;
};

type UserProfile = {
  email: string;
  username: string;
  role: string;
  school_year?: string | null;
};

export default function PulseRankingPage() {
  const [rankingData, setRankingData] = useState<RankingEntry[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

  useEffect(() => {
    const authToken = localStorage.getItem("authToken");

    async function loadRanking() {
      try {
        setLoading(true);
        setError("");

        const headers: HeadersInit = {
          "Content-Type": "application/json",
        };

        if (authToken) {
          headers.Authorization = `Bearer ${authToken}`;
        }

        const [rankingResponse, profileResponse] = await Promise.all([
          fetch(`${apiBaseUrl}/pulse-missions/effort-rankings/`, {
            headers,
          }),
          authToken
            ? fetch(`${apiBaseUrl}/auth/profile/`, {
                headers,
              })
            : Promise.resolve(null),
        ]);

        const rankingPayload = await rankingResponse.json().catch(() => []);

        if (!rankingResponse.ok) {
          throw new Error("Nao foi possivel carregar o ranking semanal.");
        }

        const normalizedRanking = Array.isArray(rankingPayload)
          ? [...rankingPayload].sort(
              (a, b) => Number(b.weekly_score) - Number(a.weekly_score)
            )
          : [];

        setRankingData(normalizedRanking);

        if (profileResponse) {
          const profilePayload = await profileResponse.json().catch(() => null);
          if (profileResponse.ok) {
            setCurrentUser(profilePayload);
          }
        }
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Erro inesperado ao carregar o ranking."
        );
      } finally {
        setLoading(false);
      }
    }

    loadRanking();
  }, [apiBaseUrl]);

  function formatScore(score: string | number) {
    return Number(score).toFixed(2);
  }

  return (
    <main className="koru-grid min-h-screen px-4 py-8 text-text_dark sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <section className="koru-shell overflow-hidden rounded-[2.35rem]">
          <div className="grid gap-0 xl:grid-cols-[0.88fr_1.12fr]">
            <div className="koru-panel-dark px-6 py-8 text-text_light sm:px-8 xl:px-12">
              <div className="space-y-8">
                <div className="space-y-4">
                  <p className="koru-kicker text-secondary">Pulse Ranking</p>
                  <h1 className="max-w-xl text-4xl font-semibold leading-tight xl:text-5xl">
                    O ritmo visivel do esforco semanal.
                  </h1>
                  <p className="max-w-lg text-base leading-8 text-text_light/76">
                    O ranking transforma consistencia em leitura clara de
                    progresso, comunidade e energia coletiva.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
                  <div className="koru-stat rounded-[1.7rem] p-5">
                    <p className="text-xs uppercase tracking-[0.22em] text-secondary">
                      Seu destaque
                    </p>
                    <p className="mt-3 text-lg font-semibold text-white">
                      {currentUser ? currentUser.username : "Visitante"}
                    </p>
                    <p className="mt-1 text-sm text-text_light/72">
                      {currentUser
                        ? "sua presenca esta sendo comparada ao ritmo da semana"
                        : "entre para ver sua posicao destacada"}
                    </p>
                  </div>
                  <div className="koru-stat rounded-[1.7rem] p-5">
                    <p className="text-xs uppercase tracking-[0.22em] text-secondary">
                      Comunidade ativa
                    </p>
                    <p className="mt-3 text-lg font-semibold text-white">
                      {rankingData.length}
                    </p>
                    <p className="mt-1 text-sm text-text_light/72">
                      participante{rankingData.length === 1 ? "" : "s"} no ciclo
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-8 sm:px-8 xl:px-12">
              <div className="space-y-6">
                <div className="space-y-3">
                  <span className="koru-chip bg-primary/10 text-primary">
                    Weekly Effort
                  </span>
                  <h2 className="text-3xl font-semibold text-text_dark">
                    Classificacao atual
                  </h2>
                </div>

                {error && (
                  <div className="rounded-[1.45rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                {loading ? (
                  <div className="koru-card flex items-center gap-3 rounded-[1.8rem] p-5 text-sm text-text_dark/70">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary/25 border-t-primary" />
                    Carregando ranking semanal...
                  </div>
                ) : rankingData.length > 0 ? (
                  <div className="space-y-4">
                    {rankingData.map((entry, index) => {
                      const isCurrentUser =
                        currentUser && index === 0 && rankingData.length === 1;

                      return (
                        <article
                          key={`${entry.student ?? "entry"}-${index}`}
                          className={`relative overflow-hidden rounded-[1.8rem] border px-5 py-5 shadow-[0_16px_34px_rgba(42,98,143,0.07)] transition ${
                            isCurrentUser
                              ? "border-accent bg-[linear-gradient(135deg,_rgba(255,152,0,0.12),_rgba(255,255,255,0.96))]"
                              : "border-slate-200 bg-white"
                          }`}
                        >
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-4">
                              <div
                                className={`flex h-14 w-14 items-center justify-center rounded-[1.35rem] text-sm font-bold ${
                                  index === 0
                                    ? "bg-accent text-white shadow-[0_14px_24px_rgba(255,152,0,0.26)]"
                                    : index === 1
                                    ? "bg-secondary text-white"
                                    : index === 2
                                    ? "bg-primary text-white"
                                    : "bg-slate-100 text-text_dark"
                                }`}
                              >
                                #{entry.ranking_position ?? index + 1}
                              </div>

                              <div>
                                <p className="text-lg font-semibold text-text_dark">
                                  {isCurrentUser
                                    ? `${currentUser?.username} (Voce)`
                                    : `Participante ${entry.student ?? index + 1}`}
                                </p>
                                <p className="mt-1 text-sm text-text_dark/62">
                                  Ultima atualizacao:{" "}
                                  {entry.last_updated
                                    ? new Intl.DateTimeFormat("pt-BR", {
                                        dateStyle: "short",
                                        timeStyle: "short",
                                      }).format(new Date(entry.last_updated))
                                    : "indisponivel"}
                                </p>
                              </div>
                            </div>

                            <div className="rounded-[1.35rem] bg-slate-50 px-4 py-3 text-right">
                              <p className="text-xs uppercase tracking-[0.18em] text-primary">
                                Weekly Score
                              </p>
                              <p className="mt-1 text-2xl font-semibold text-text_dark">
                                {formatScore(entry.weekly_score)}
                              </p>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <div className="koru-card rounded-[1.8rem] border border-dashed p-6 text-sm text-text_dark/65">
                    Nenhum dado de ranking semanal foi encontrado ainda.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

