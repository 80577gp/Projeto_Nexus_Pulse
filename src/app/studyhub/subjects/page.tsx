"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type SchoolYear = {
  id: number;
  name: string;
};

type Subject = {
  id: number;
  name: string;
  school_year: number;
};

export default function StudyHubSubjectsPage() {
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSchoolYear, setSelectedSchoolYear] = useState<string>("");
  const [loadingSchoolYears, setLoadingSchoolYears] = useState(true);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [error, setError] = useState("");

  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

  useEffect(() => {
    async function loadSchoolYears() {
      try {
        setLoadingSchoolYears(true);
        setError("");

        const response = await fetch(`${apiBaseUrl}/study-content/schoolyears/`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error("Nao foi possivel carregar os anos escolares.");
        }

        setSchoolYears(data);
        if (data.length > 0) {
          setSelectedSchoolYear(String(data[0].id));
        }
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Erro inesperado ao carregar anos escolares."
        );
      } finally {
        setLoadingSchoolYears(false);
      }
    }

    loadSchoolYears();
  }, [apiBaseUrl]);

  useEffect(() => {
    if (!selectedSchoolYear) {
      setSubjects([]);
      return;
    }

    async function loadSubjects() {
      try {
        setLoadingSubjects(true);
        setError("");

        const response = await fetch(
          `${apiBaseUrl}/study-content/subjects/?school_year=${selectedSchoolYear}`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error("Nao foi possivel carregar as disciplinas.");
        }

        setSubjects(data);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Erro inesperado ao carregar disciplinas."
        );
      } finally {
        setLoadingSubjects(false);
      }
    }

    loadSubjects();
  }, [apiBaseUrl, selectedSchoolYear]);

  const selectedSchoolYearName =
    schoolYears.find((item) => String(item.id) === selectedSchoolYear)?.name ||
    "Nao selecionado";

  return (
    <main className="koru-grid min-h-screen px-4 py-8 text-text_dark sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="koru-shell overflow-hidden rounded-[2.3rem]">
          <div className="grid gap-0 xl:grid-cols-[0.88fr_1.12fr]">
            <aside className="koru-panel-dark px-6 py-8 text-text_light sm:px-8 xl:px-12">
              <div className="space-y-8">
                <div className="space-y-4">
                  <p className="koru-kicker text-secondary">Study Hub</p>
                  <h1 className="max-w-xl text-4xl font-semibold leading-tight xl:text-5xl">
                    Onde materias, diagnosticos e progresso se conectam.
                  </h1>
                  <p className="max-w-lg text-base leading-8 text-text_light/76">
                    Escolha seu ano escolar e encontre a disciplina certa para
                    iniciar uma trilha mais inteligente e personalizada.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
                  <div className="koru-stat rounded-[1.7rem] p-5">
                    <p className="text-xs uppercase tracking-[0.22em] text-secondary">
                      Conexao de conhecimento
                    </p>
                    <p className="mt-3 text-sm leading-7 text-text_light/78">
                      O Study Hub organiza o curriculo como uma rede clara de
                      assuntos, temas e habilidades.
                    </p>
                  </div>
                  <div className="koru-stat rounded-[1.7rem] p-5">
                    <p className="text-xs uppercase tracking-[0.22em] text-secondary">
                      Futuro ativo
                    </p>
                    <p className="mt-3 text-sm leading-7 text-text_light/78">
                      Cada escolha aqui aproxima o presente academico do futuro
                      que o aluno quer construir.
                    </p>
                  </div>
                </div>
              </div>
            </aside>

            <div className="px-6 py-8 sm:px-8 xl:px-12">
              <div className="space-y-6">
                <div className="space-y-3">
                  <span className="koru-chip bg-primary/10 text-primary">
                    Curriculo conectado
                  </span>
                  <h2 className="text-3xl font-semibold text-text_dark">
                    Escolha seu ano e navegue por materia
                  </h2>
                  <p className="max-w-2xl text-sm leading-7 text-text_dark/66">
                    A plataforma funciona como um elo entre conteudo, diagnostico
                    e proxima acao recomendada.
                  </p>
                </div>

                {error && (
                  <div className="rounded-[1.45rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr]">
                  <section className="koru-card rounded-[1.9rem] p-5">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
                        Anos escolares
                      </h3>
                      <span className="koru-chip bg-secondary/10 text-secondary">
                        {schoolYears.length}
                      </span>
                    </div>

                    {loadingSchoolYears ? (
                      <div className="mt-6 flex items-center gap-3 text-sm text-text_dark/70">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary/25 border-t-primary" />
                        Carregando anos escolares...
                      </div>
                    ) : (
                      <div className="mt-5 space-y-3">
                        {schoolYears.map((schoolYear) => {
                          const isActive =
                            String(schoolYear.id) === selectedSchoolYear;

                          return (
                            <button
                              key={schoolYear.id}
                              type="button"
                              onClick={() =>
                                setSelectedSchoolYear(String(schoolYear.id))
                              }
                              className={`w-full rounded-[1.5rem] border px-4 py-4 text-left transition ${
                                isActive
                                  ? "border-primary bg-primary text-white shadow-[0_18px_32px_rgba(42,98,143,0.24)]"
                                  : "border-slate-200 bg-white text-text_dark hover:-translate-y-0.5 hover:border-secondary hover:bg-secondary/5"
                              }`}
                            >
                              <span className="block text-sm font-semibold">
                                {schoolYear.name}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </section>

                  <section className="koru-card rounded-[1.9rem] p-5">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-secondary">
                          Disciplinas
                        </h3>
                        <p className="mt-2 text-sm text-text_dark/64">
                          Ano selecionado: {selectedSchoolYearName}
                        </p>
                      </div>
                      <span className="koru-chip bg-primary/10 text-primary">
                        prontas para diagnostico
                      </span>
                    </div>

                    {loadingSubjects ? (
                      <div className="mt-6 flex items-center gap-3 text-sm text-text_dark/70">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-secondary/25 border-t-secondary" />
                        Carregando disciplinas...
                      </div>
                    ) : subjects.length > 0 ? (
                      <div className="mt-5 grid gap-4 sm:grid-cols-2">
                        {subjects.map((subject) => (
                          <Link
                            key={subject.id}
                            href={`/studyhub/diagnostics/${subject.id}`}
                            className="pulse-ring group relative overflow-hidden rounded-[1.7rem] border border-slate-200 bg-white p-5 shadow-[0_16px_32px_rgba(42,98,143,0.06)] transition hover:-translate-y-1 hover:border-accent"
                          >
                            <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-[radial-gradient(circle,_rgba(0,188,212,0.12),_transparent_70%)]" />
                            <div className="relative">
                              <p className="text-lg font-semibold text-text_dark">
                                {subject.name}
                              </p>
                              <p className="mt-2 text-sm leading-7 text-text_dark/64">
                                Explore conteudos conectados, avalie seu nivel e
                                ative orientacao inteligente.
                              </p>
                              <span className="mt-4 inline-flex text-sm font-semibold text-accent transition group-hover:translate-x-1">
                                Abrir diagnostico
                              </span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-5 rounded-[1.65rem] border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-text_dark/65">
                        Nenhuma disciplina foi encontrada para o ano selecionado.
                      </div>
                    )}
                  </section>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

