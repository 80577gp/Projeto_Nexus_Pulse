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
            method: "GET",
            headers,
          }),
          authToken
            ? fetch(`${apiBaseUrl}/auth/profile/`, {
                method: "GET",
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
    <main className="min-h-screen bg-[linear-gradient(180deg,_#f7fbff_0%,_#eef7fb_48%,_#ffffff_100%)] px-4 py-8 text-text_dark sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <section className="overflow-hidden rounded-[2rem] bg-white shadow-[0_24px_80px_rgba(42,98,143,0.12)]">
          <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="bg-background_dark px-6 py-8 text-text_light sm:px-8 lg:px-10">
              <p className="text-xs uppercase tracking-[0.35em] text-secondary">
                Pulse Ranking
              </p>
              <h1 className="mt-4 text-3xl font-semibold leading-tight">
                Ranking semanal de esforco
              </h1>
              <p className="mt-4 max-w-md text-sm leading-7 text-text_light/75">
                Veja quem mais manteve consistencia nas missoes da semana e
                acompanhe sua posicao no ritmo do Pulse.
              </p>

              <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.25em] text-secondary">
                  Destaque pessoal
                </p>
                <p className="mt-3 text-sm leading-6 text-text_light/75">
                  {currentUser
                    ? `Voce esta acompanhando o ranking como ${currentUser.username}.`
                    : "Entre com sua conta para destacar sua posicao automaticamente."}
                </p>
              </div>
            </div>

            <div className="px-6 py-8 sm:px-8 lg:px-10">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-primary">
                    Weekly Effort
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-text_dark">
                    Classificacao atual
                  </h2>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  {rankingData.length} participante
                  {rankingData.length === 1 ? "" : "s"}
                </span>
              </div>

              {error && (
                <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {loading ? (
                <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm text-text_dark/70">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary/25 border-t-primary" />
                  Carregando ranking semanal...
                </div>
              ) : rankingData.length > 0 ? (
                <div className="space-y-3">
                  {rankingData.map((entry, index) => {
                    const isCurrentUser =
                      currentUser && index === 0 && rankingData.length === 1
                        ? true
                        : false;

                    return (
                      <article
                        key={`${entry.student ?? "entry"}-${index}`}
                        className={`rounded-3xl border px-5 py-4 transition ${
                          isCurrentUser
                            ? "border-accent bg-accent/10 shadow-lg shadow-accent/10"
                            : "border-slate-200 bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div
                              className={`flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-bold ${
                                index === 0
                                  ? "bg-accent text-white"
                                  : index === 1
                                  ? "bg-secondary text-white"
                                  : index === 2
                                  ? "bg-primary text-white"
                                  : "bg-slate-200 text-text_dark"
                              }`}
                            >
                              #{entry.ranking_position ?? index + 1}
                            </div>

                            <div>
                              <p className="text-base font-semibold text-text_dark">
                                {isCurrentUser
                                  ? `${currentUser?.username} (Voce)`
                                  : `Participante ${entry.student ?? index + 1}`}
                              </p>
                              <p className="text-sm text-text_dark/65">
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

                          <div className="text-right">
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
                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-text_dark/65">
                  Nenhum dado de ranking semanal foi encontrado ainda.
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

