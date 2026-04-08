"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Informe email e senha para continuar.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${apiBaseUrl}/auth/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.detail || "Nao foi possivel entrar na plataforma.");
      }

      if (!data?.token) {
        throw new Error("A autenticacao foi concluida, mas nenhum token foi retornado.");
      }

      localStorage.setItem("authToken", data.token);
      router.push("/dashboard");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Ocorreu um erro inesperado no login."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="koru-grid min-h-screen px-4 py-8 text-text_dark sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
        <section className="koru-shell grid w-full overflow-hidden rounded-[2.25rem] lg:grid-cols-[0.96fr_1.04fr]">
          <div className="px-6 py-8 sm:px-8 xl:px-12">
            <div className="mx-auto max-w-lg space-y-6">
              <div className="space-y-3">
                <span className="koru-chip bg-primary/10 text-primary">
                  Login Pulse
                </span>
                <h1 className="text-4xl font-semibold text-text_dark">
                  Entre no seu centro de comando.
                </h1>
                <p className="text-sm leading-7 text-text_dark/66">
                  Acesse seu dashboard, acompanhe suas missoes e mantenha o ritmo
                  do seu futuro.
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-text_dark">
                    E-mail
                  </span>
                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    type="email"
                    className="koru-input"
                    placeholder="voce@exemplo.com"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-text_dark">
                    Senha
                  </span>
                  <input
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    type="password"
                    className="koru-input"
                    placeholder="Sua senha"
                  />
                </label>

                {error && (
                  <div className="rounded-[1.45rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="submit"
                    disabled={loading}
                    className="koru-primary-button px-6 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                        Entrando...
                      </>
                    ) : (
                      "Entrar"
                    )}
                  </button>
                  <Link
                    href="/register"
                    className="text-sm font-semibold text-primary transition hover:text-accent"
                  >
                    Ainda nao tem conta? Criar agora
                  </Link>
                </div>
              </form>
            </div>
          </div>

          <div className="koru-panel-dark koru-radar hidden px-8 py-10 text-text_light lg:flex lg:flex-col lg:justify-between xl:px-12">
            <div className="space-y-5">
              <p className="koru-kicker text-secondary">Seu mentor proativo</p>
              <h2 className="max-w-xl text-4xl font-semibold leading-tight">
                Um pulso inteligente que nao espera voce pedir ajuda.
              </h2>
              <p className="max-w-lg text-base leading-8 text-text_light/76">
                O KORU monitora, conecta e recomenda no momento certo para
                manter engajamento, confianca e consistencia.
              </p>
            </div>

            <div className="grid gap-4">
              <div className="koru-stat rounded-[1.7rem] p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-secondary">
                  Proatividade
                </p>
                <p className="mt-3 text-sm leading-7 text-text_light/76">
                  Sinais, orientacoes e prioridades aparecem antes do aluno se perder.
                </p>
              </div>
              <div className="koru-stat rounded-[1.7rem] p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-secondary">
                  Ritmo
                </p>
                <p className="mt-3 text-sm leading-7 text-text_light/76">
                  Missao, ranking, diagnostico e IA trabalham como um ecossistema.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

