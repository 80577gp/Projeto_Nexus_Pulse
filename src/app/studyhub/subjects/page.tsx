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

        const response = await fetch(
          `${apiBaseUrl}/study-content/schoolyears/`
        );
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

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#f8fbff_0%,_#eef7fb_55%,_#ffffff_100%)] px-4 py-8 text-text_dark sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <section className="overflow-hidden rounded-[2rem] bg-white shadow-[0_24px_80px_rgba(42,98,143,0.14)]">
          <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
            <aside className="bg-background_dark px-6 py-8 text-text_light sm:px-8 lg:px-10">
              <p className="text-xs uppercase tracking-[0.35em] text-secondary">
                Study Hub
              </p>
              <h1 className="mt-4 text-3xl font-semibold leading-tight">
                Escolha um ano escolar e encontre sua proxima materia.
              </h1>
              <p className="mt-4 max-w-md text-sm leading-7 text-text_light/75">
                Explore o curriculo por etapa e avance para o diagnostico ideal
                de cada disciplina.
              </p>

              <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.25em] text-secondary">
                  Navegacao guiada
                </p>
                <p className="mt-3 text-sm leading-6 text-text_light/75">
                  Selecione um ano escolar para filtrar as disciplinas
                  disponiveis e seguir direto para os diagnosticos.
                </p>
              </div>
            </aside>

            <div className="px-6 py-8 sm:px-8 lg:px-10">
              <div className="mb-8 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-primary">
                    Curriculo
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-text_dark">
                    Selecione um ano escolar
                  </h2>
                </div>
              </div>

              {error && (
                <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
                <section className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                    Anos escolares
                  </h3>

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
                            className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                              isActive
                                ? "border-primary bg-primary text-white shadow-lg shadow-primary/20"
                                : "border-slate-200 bg-white text-text_dark hover:border-secondary hover:bg-secondary/5"
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

                <section className="rounded-3xl border border-slate-200 bg-background_light p-5">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-secondary">
                      Disciplinas
                    </h3>
                    {selectedSchoolYear && (
                      <span className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-medium text-secondary">
                        {schoolYears.find(
                          (item) => String(item.id) === selectedSchoolYear
                        )?.name || "Selecionado"}
                      </span>
                    )}
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
                          className="group rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-0.5 hover:border-accent hover:bg-white hover:shadow-lg"
                        >
                          <p className="text-lg font-semibold text-text_dark">
                            {subject.name}
                          </p>
                          <p className="mt-2 text-sm text-text_dark/65">
                            Acessar diagnostico e explorar conteudos da materia.
                          </p>
                          <span className="mt-4 inline-flex text-sm font-medium text-accent">
                            Abrir diagnostico
                          </span>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-5 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-text_dark/65">
                      Nenhuma disciplina encontrada para o ano escolar selecionado.
                    </div>
                  )}
                </section>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

