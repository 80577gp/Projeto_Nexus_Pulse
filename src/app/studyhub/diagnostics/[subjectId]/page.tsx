"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";

type DiagnosticTest = {
  id: number;
  name: string;
  description: string;
  related_skill: number;
  questions?: Array<{
    id: number;
    text: string;
    question_type: string;
    choices?: Array<{
      id: number;
      text: string;
      is_correct: boolean;
    }>;
  }>;
};

type ChatMessage = {
  id: number;
  role: "user" | "assistant";
  content: string;
};

export default function SubjectDiagnosticPage() {
  const params = useParams<{ subjectId: string }>();
  const subjectId = params?.subjectId;

  const [diagnosticTests, setDiagnosticTests] = useState<DiagnosticTest[]>([]);
  const [loadingTests, setLoadingTests] = useState(true);
  const [testsError, setTestsError] = useState("");

  const [requestType, setRequestType] = useState("study_tips");
  const [promptText, setPromptText] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

  useEffect(() => {
    if (!subjectId) {
      return;
    }

    async function loadDiagnosticTests() {
      try {
        setLoadingTests(true);
        setTestsError("");

        const response = await fetch(
          `${apiBaseUrl}/diagnostics/diagnostic-tests/?subject=${subjectId}`
        );
        const data = await response.json().catch(() => []);

        if (!response.ok) {
          throw new Error("Nao foi possivel carregar os testes diagnosticos.");
        }

        setDiagnosticTests(Array.isArray(data) ? data : []);
      } catch (loadError) {
        setTestsError(
          loadError instanceof Error
            ? loadError.message
            : "Erro inesperado ao carregar os testes."
        );
      } finally {
        setLoadingTests(false);
      }
    }

    loadDiagnosticTests();
  }, [apiBaseUrl, subjectId]);

  async function handleSendPrompt(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedPrompt = promptText.trim();
    if (!trimmedPrompt) {
      return;
    }

    const authToken = localStorage.getItem("authToken");
    const userMessage: ChatMessage = {
      id: Date.now(),
      role: "user",
      content: trimmedPrompt,
    };

    setChatMessages((previous) => [...previous, userMessage]);
    setPromptText("");
    setAiError("");
    setAiLoading(true);

    try {
      const response = await fetch(`${apiBaseUrl}/ai/generate-content/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          prompt_text: trimmedPrompt,
          request_type: requestType,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.detail || "Nao foi possivel obter resposta da IA."
        );
      }

      const assistantMessage: ChatMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: data?.response || "A IA nao retornou conteudo.",
      };

      setChatMessages((previous) => [...previous, assistantMessage]);
    } catch (submitError) {
      setAiError(
        submitError instanceof Error
          ? submitError.message
          : "Erro inesperado ao consultar a IA."
      );
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#f3fbff_0%,_#eef7fb_50%,_#ffffff_100%)] px-4 py-8 text-text_dark sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="overflow-hidden rounded-[2rem] bg-white shadow-[0_24px_80px_rgba(42,98,143,0.12)]">
          <div className="grid gap-0 xl:grid-cols-[0.95fr_1.05fr]">
            <div className="bg-background_dark px-6 py-8 text-text_light sm:px-8 lg:px-10">
              <p className="text-xs uppercase tracking-[0.35em] text-secondary">
                Subject Diagnostics
              </p>
              <h1 className="mt-4 text-3xl font-semibold leading-tight">
                Diagnostico da disciplina
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-7 text-text_light/75">
                Explore os testes disponiveis e use a IA para gerar dicas,
                resumos ou mapas mentais enquanto estuda.
              </p>

              <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.25em] text-secondary">
                  Disciplina atual
                </p>
                <p className="mt-3 text-sm text-text_light/75">
                  ID da disciplina: {subjectId || "-"}
                </p>
              </div>

              <div className="mt-8">
                <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-secondary">
                  Testes diagnosticos
                </h2>

                {loadingTests ? (
                  <div className="mt-5 flex items-center gap-3 text-sm text-text_light/75">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-secondary/30 border-t-secondary" />
                    Carregando testes...
                  </div>
                ) : testsError ? (
                  <div className="mt-5 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                    {testsError}
                  </div>
                ) : diagnosticTests.length > 0 ? (
                  <div className="mt-5 space-y-4">
                    {diagnosticTests.map((test) => (
                      <article
                        key={test.id}
                        className="rounded-3xl border border-white/10 bg-white/5 p-5"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-lg font-semibold text-text_light">
                              {test.name}
                            </h3>
                            <p className="mt-2 text-sm leading-6 text-text_light/70">
                              {test.description || "Sem descricao disponivel."}
                            </p>
                          </div>
                          <span className="rounded-full bg-secondary/15 px-3 py-1 text-xs font-medium text-secondary">
                            Teste #{test.id}
                          </span>
                        </div>

                        {test.questions && test.questions.length > 0 && (
                          <div className="mt-4 rounded-2xl bg-black/10 p-4">
                            <p className="text-xs uppercase tracking-[0.2em] text-text_light/60">
                              Questoes
                            </p>
                            <ul className="mt-3 space-y-2 text-sm text-text_light/75">
                              {test.questions.slice(0, 3).map((question) => (
                                <li key={question.id}>{question.text}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="mt-5 rounded-3xl border border-dashed border-white/15 bg-white/5 p-5 text-sm text-text_light/70">
                    Nenhum teste diagnostico foi encontrado para esta disciplina.
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-8 sm:px-8 lg:px-10">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-primary">
                    AI Study Assistant
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-text_dark">
                    Converse com a IA
                  </h2>
                </div>
                <select
                  value={requestType}
                  onChange={(event) => setRequestType(event.target.value)}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
                >
                  <option value="study_tips">Study Tips</option>
                  <option value="mind_map">Mind Map</option>
                  <option value="code_help">Code Help</option>
                </select>
              </div>

              <div className="mt-6 h-[28rem] overflow-y-auto rounded-3xl border border-slate-200 bg-slate-50 p-5">
                {chatMessages.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-center text-sm leading-7 text-text_dark/60">
                    Envie uma pergunta para receber dicas de estudo, resumos ou
                    ideias de mapa mental para esta disciplina.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {chatMessages.map((message) => {
                      const isAssistant = message.role === "assistant";
                      const isImageUrl =
                        isAssistant &&
                        /^https?:\/\/\S+\.(png|jpg|jpeg|webp|gif|svg)$/i.test(
                          message.content.trim()
                        );

                      return (
                        <div
                          key={message.id}
                          className={`max-w-[85%] rounded-3xl px-4 py-3 text-sm leading-7 ${
                            isAssistant
                              ? "mr-auto bg-white text-text_dark shadow-sm"
                              : "ml-auto bg-primary text-white"
                          }`}
                        >
                          {isImageUrl ? (
                            <a
                              href={message.content}
                              target="_blank"
                              rel="noreferrer"
                              className="font-medium text-secondary underline"
                            >
                              Abrir mapa mental gerado
                            </a>
                          ) : (
                            <p className="whitespace-pre-wrap">{message.content}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {aiError && (
                <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {aiError}
                </div>
              )}

              <form className="mt-5 space-y-4" onSubmit={handleSendPrompt}>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-text_dark">
                    Sua pergunta
                  </span>
                  <textarea
                    value={promptText}
                    onChange={(event) => setPromptText(event.target.value)}
                    rows={4}
                    placeholder="Ex: gere um mapa mental sobre funcoes do 1o grau ou me de dicas para este diagnostico."
                    className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-4 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
                  />
                </label>

                <button
                  type="submit"
                  disabled={aiLoading || !promptText.trim()}
                  className="inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {aiLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Gerando resposta...
                    </span>
                  ) : (
                    "Enviar para IA"
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

