"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Role = "student" | "teacher";

export default function RegisterPage() {
  const router = useRouter();

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
      const response = await fetch(`${apiBaseUrl}/auth/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          username,
          password,
          password_confirm: passwordConfirm,
          role,
          school_year: role === "student" ? schoolYear : "",
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const apiError =
          data?.detail ||
          data?.email?.[0] ||
          data?.username?.[0] ||
          data?.password?.[0] ||
          data?.password_confirm?.[0] ||
          "Nao foi possivel concluir o cadastro.";
        throw new Error(apiError);
      }

      router.push("/login");
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Ocorreu um erro inesperado no cadastro.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary via-secondary to-accent px-4 py-10 text-text_dark">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center justify-center">
        <section className="grid w-full overflow-hidden rounded-[2rem] bg-background_light shadow-2xl md:grid-cols-[1.1fr_0.9fr]">
          <div className="hidden bg-background_dark p-10 text-text_light md:flex md:flex-col md:justify-between">
            <div>
              <p className="mb-4 text-sm uppercase tracking-[0.35em] text-secondary">
                Nexus Pulse
              </p>
              <h1 className="max-w-md text-4xl font-semibold leading-tight">
                Crie sua conta e comece sua jornada de estudo com mais clareza.
              </h1>
            </div>

            <div className="space-y-4 text-sm text-text_light/80">
              <p>
                Organize seus estudos, acompanhe seu progresso e conecte seu
                aprendizado em um unico lugar.
              </p>
              <div className="h-px w-full bg-text_light/10" />
              <p>Cadastro rapido para estudantes e professores.</p>
            </div>
          </div>

          <div className="p-6 sm:p-8 md:p-10">
            <div className="mx-auto max-w-md">
              <div className="mb-8">
                <span className="inline-flex rounded-full bg-secondary/15 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-primary">
                  Novo cadastro
                </span>
                <h2 className="mt-4 text-3xl font-semibold text-text_dark">
                  Criar conta
                </h2>
                <p className="mt-2 text-sm text-text_dark/70">
                  Preencha seus dados para acessar a plataforma.
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label
                    className="mb-2 block text-sm font-medium text-text_dark"
                    htmlFor="email"
                  >
                    E-mail
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
                    placeholder="voce@exemplo.com"
                  />
                </div>

                <div>
                  <label
                    className="mb-2 block text-sm font-medium text-text_dark"
                    htmlFor="username"
                  >
                    Nome de usuario
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
                    placeholder="seu_usuario"
                  />
                </div>

                <div>
                  <label
                    className="mb-2 block text-sm font-medium text-text_dark"
                    htmlFor="role"
                  >
                    Perfil
                  </label>
                  <select
                    id="role"
                    value={role}
                    onChange={(event) => setRole(event.target.value as Role)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                  </select>
                </div>

                {role === "student" && (
                  <div>
                    <label
                      className="mb-2 block text-sm font-medium text-text_dark"
                      htmlFor="school_year"
                    >
                      Ano escolar
                    </label>
                    <input
                      id="school_year"
                      type="text"
                      value={schoolYear}
                      onChange={(event) => setSchoolYear(event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
                      placeholder="Ex: 9o Ano ou 1a Serie EM"
                    />
                  </div>
                )}

                <div>
                  <label
                    className="mb-2 block text-sm font-medium text-text_dark"
                    htmlFor="password"
                  >
                    Senha
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
                    placeholder="Minimo de 8 caracteres"
                  />
                </div>

                <div>
                  <label
                    className="mb-2 block text-sm font-medium text-text_dark"
                    htmlFor="password_confirm"
                  >
                    Confirmar senha
                  </label>
                  <input
                    id="password_confirm"
                    type="password"
                    value={passwordConfirm}
                    onChange={(event) =>
                      setPasswordConfirm(event.target.value)
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
                    placeholder="Repita sua senha"
                  />
                </div>

                {error && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center rounded-2xl bg-text_dark px-4 py-3 text-sm font-semibold text-text_light transition hover:bg-primary disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-text_light/40 border-t-text_light" />
                      Criando conta...
                    </span>
                  ) : (
                    "Criar conta"
                  )}
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

