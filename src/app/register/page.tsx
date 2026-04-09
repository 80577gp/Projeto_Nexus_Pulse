"use client";

import axios from "axios";
import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setTokens } from "@/lib/auth/token-store";
import { sanitizeWebObject } from "@/lib/security/sanitize";

type Role = "student" | "teacher";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [role, setRole] = useState<Role>("student");
  const [schoolYear, setSchoolYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!email || !username || !password || !passwordConfirm) {
      setError("Preencha todos os campos obrigatorios.");
      return;
    }

    if (password.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres.");
      return;
    }

    if (password !== passwordConfirm) {
      setError("As senhas nao coincidem.");
      return;
    }

    if (role === "student" && !schoolYear.trim()) {
      setError("Informe o ano escolar para cadastro de estudante.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${apiBaseUrl}/auth/register/`,
        sanitizeWebObject({
          email,
          username,
          password,
          password_confirm: passwordConfirm,
          role,
          school_year: role === "student" ? schoolYear : "",
        }),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = response.data;

      if (!response.status || response.status >= 400) {
        const apiError =
          data?.detail ||
          data?.email?.[0] ||
          data?.username?.[0] ||
          data?.password?.[0] ||
          data?.password_confirm?.[0] ||
          "Nao foi possivel concluir o cadastro.";
        throw new Error(apiError);
      }

      setTokens({ access: data?.access ?? null, refresh: data?.refresh ?? null });

      const nextPath = searchParams.get("next");
      router.push(nextPath && nextPath.startsWith("/") ? nextPath : "/dashboard");
    } catch (submitError) {
      setError(
        axios.isAxiosError(submitError)
          ? submitError.response?.data?.detail ||
            submitError.response?.data?.email?.[0] ||
            submitError.response?.data?.username?.[0] ||
            submitError.response?.data?.password?.[0] ||
            submitError.response?.data?.password_confirm?.[0] ||
            submitError.message
          : submitError instanceof Error
            ? submitError.message
          : "Ocorreu um erro inesperado no cadastro."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="koru-grid min-h-screen px-4 py-8 text-text_dark sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl items-center justify-center">
        <section className="koru-shell grid w-full overflow-hidden rounded-[2.25rem] lg:grid-cols-[1.05fr_0.95fr]">
          <div className="koru-panel-dark koru-radar hidden px-8 py-10 text-text_light lg:flex lg:flex-col lg:justify-between xl:px-12">
            <div className="space-y-8">
              <p className="koru-kicker text-secondary">KORU</p>
              <div className="space-y-5">
                <h1 className="max-w-xl text-4xl font-semibold leading-tight xl:text-5xl">
                  Conecte seu potencial. Sinta o ritmo do seu futuro.
                </h1>
                <p className="max-w-lg text-base leading-8 text-text_light/76">
                  O KORU conecta conhecimento, orientacao e proatividade
                  em um unico ponto de apoio para a jornada academica e
                  profissional.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="koru-stat rounded-[1.75rem] p-5">
                  <p className="text-xs uppercase tracking-[0.22em] text-secondary">
                    Conexao
                  </p>
                  <p className="mt-3 text-sm leading-7 text-text_light/78">
                    Materias, IA, mentoria e oportunidades convergem aqui.
                  </p>
                </div>
                <div className="koru-stat rounded-[1.75rem] p-5">
                  <p className="text-xs uppercase tracking-[0.22em] text-secondary">
                    Pulse
                  </p>
                  <p className="mt-3 text-sm leading-7 text-text_light/78">
                    Um radar ativo que acompanha seu ritmo e age na hora certa.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.9rem] border border-white/10 bg-white/5 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-secondary">
                Tagline
              </p>
              <p className="mt-3 max-w-lg text-lg leading-8 text-text_light/82">
                Seu mentor proativo para o sucesso academico e profissional.
              </p>
            </div>
          </div>

          <div className="relative px-6 py-8 sm:px-8 lg:px-10 xl:px-12">
            <div className="absolute right-8 top-8 hidden h-24 w-24 rounded-full border border-primary/10 bg-[radial-gradient(circle,_rgba(0,188,212,0.18),_transparent_65%)] lg:block" />
            <div className="relative mx-auto max-w-xl">
              <div className="mb-8 space-y-4">
                <span className="koru-chip bg-primary/10 text-primary">
                  Jornada inicial
                </span>
                <div className="space-y-2">
                  <h2 className="text-3xl font-semibold text-text_dark sm:text-4xl">
                    Criar conta
                  </h2>
                  <p className="max-w-md text-sm leading-7 text-text_dark/68">
                    Entre no ecossistema KORU e comece a transformar seu
                    estudo em movimento continuo.
                  </p>
                </div>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-text_dark">
                      E-mail
                    </span>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="koru-input"
                      placeholder="voce@exemplo.com"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-text_dark">
                      Nome de usuario
                    </span>
                    <input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      className="koru-input"
                      placeholder="seu_usuario"
                    />
                  </label>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-text_dark">
                      Perfil
                    </span>
                    <select
                      id="role"
                      value={role}
                      onChange={(event) => setRole(event.target.value as Role)}
                      className="koru-select"
                    >
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-text_dark">
                      Ano escolar
                    </span>
                    <input
                      id="school_year"
                      type="text"
                      value={schoolYear}
                      onChange={(event) => setSchoolYear(event.target.value)}
                      className="koru-input"
                      placeholder={
                        role === "student"
                          ? "Ex: 9o Ano ou 1a Serie EM"
                          : "Opcional para professores"
                      }
                      disabled={role !== "student"}
                    />
                  </label>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-text_dark">
                      Senha
                    </span>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="koru-input"
                      placeholder="Minimo de 8 caracteres"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-text_dark">
                      Confirmar senha
                    </span>
                    <input
                      id="password_confirm"
                      type="password"
                      value={passwordConfirm}
                      onChange={(event) => setPasswordConfirm(event.target.value)}
                      className="koru-input"
                      placeholder="Repita sua senha"
                    />
                  </label>
                </div>

                {error && (
                  <div className="rounded-[1.4rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="submit"
                    disabled={loading}
                    className="koru-primary-button w-full px-6 py-3 text-sm font-semibold sm:w-auto sm:min-w-[12rem] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                        Criando conta...
                      </>
                    ) : (
                      "Entrar no KORU"
                    )}
                  </button>

                  <p className="text-sm leading-7 text-text_dark/60">
                    Cadastro para estudantes e professores em uma experiencia
                    unica e conectada.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

