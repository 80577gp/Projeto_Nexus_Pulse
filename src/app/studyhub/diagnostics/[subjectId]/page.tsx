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

      setChatMessages((previous) => [
        ...previous,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: data?.response || "A IA nao retornou conteudo.",
        },
      ]);
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
    <main className="koru-grid min-h-screen px-4 py-8 text-text_dark sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="koru-shell overflow-hidden rounded-[2.35rem]">
          <div className="grid gap-0 xl:grid-cols-[0.95fr_1.05fr]">
            <div className="koru-panel-dark px-6 py-8 text-text_light sm:px-8 xl:px-12">
              <div className="space-y-8">
                <div className="space-y-4">
                  <p className="koru-kicker text-secondary">
                    Subject Diagnostics
                  </p>
                  <h1 className="max-w-2xl text-4xl font-semibold leading-tight xl:text-5xl">
                    Diagnostico, clareza e orientacao no mesmo fluxo.
                  </h1>
                  <p className="max-w-xl text-base leading-8 text-text_light/76">
                    O KORU transforma uma disciplina em trilha: identifica
                    lacunas, ativa suporte e aponta o proximo movimento.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="koru-stat rounded-[1.7rem] p-5">
                    <p className="text-xs uppercase tracking-[0.22em] text-secondary">
                      Disciplina atual
                    </p>
                    <p className="mt-3 text-lg font-semibold text-white">
                      ID #{subjectId || "-"}
                    </p>
                    <p className="mt-1 text-sm text-text_light/72">
                      entrada ativa do Study Hub
                    </p>
                  </div>
                  <div className="koru-stat rounded-[1.7rem] p-5">
                    <p className="text-xs uppercase tracking-[0.22em] text-secondary">
                      Assistente IA
                    </p>
                    <p className="mt-3 text-lg font-semibold text-white">
                      {requestType.replace("_", " ")}
                    </p>
                    <p className="mt-1 text-sm text-text_light/72">
                      suporte responsivo e proativo
                    </p>
                  </div>
                </div>

                <section className="rounded-[1.85rem] border border-white/10 bg-white/6 p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-secondary">
                        Testes diagnosticos
                      </p>
                      <h2 className="mt-3 text-2xl font-semibold text-white">
                        Avaliacao conectada
                      </h2>
                    </div>
                    <span className="koru-chip bg-white/10 text-secondary">
                      {diagnosticTests.length} teste
                      {diagnosticTests.length === 1 ? "" : "s"}
                    </span>
                  </div>

                  {loadingTests ? (
                    <div className="mt-6 flex items-center gap-3 text-sm text-text_light/75">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-secondary/30 border-t-secondary" />
                      Carregando testes...
                    </div>
                  ) : testsError ? (
                    <div className="mt-5 rounded-[1.35rem] border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                      {testsError}
                    </div>
                  ) : diagnosticTests.length > 0 ? (
                    <div className="mt-5 space-y-4">
                      {diagnosticTests.map((test) => (
                        <article
                          key={test.id}
                          className="rounded-[1.7rem] border border-white/10 bg-white/5 p-5"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-2">
                              <h3 className="text-lg font-semibold text-text_light">
                                {test.name}
                              </h3>
                              <p className="text-sm leading-7 text-text_light/70">
                                {test.description || "Sem descricao disponivel."}
                              </p>
                            </div>
                            <span className="koru-chip bg-secondary/10 text-secondary">
                              #{test.id}
                            </span>
                          </div>

                          {test.questions && test.questions.length > 0 && (
                            <div className="mt-4 rounded-[1.35rem] bg-black/10 p-4">
                              <p className="text-xs uppercase tracking-[0.2em] text-text_light/58">
                                Primeiras questoes
                              </p>
                              <ul className="mt-3 space-y-2 text-sm text-text_light/76">
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
                    <div className="mt-5 rounded-[1.65rem] border border-dashed border-white/15 bg-white/5 p-5 text-sm text-text_light/70">
                      Nenhum teste diagnostico foi encontrado para esta disciplina.
                    </div>
                  )}
                </section>
              </div>
            </div>

            <div className="px-6 py-8 sm:px-8 xl:px-12">
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-2">
                    <span className="koru-chip bg-primary/10 text-primary">
                      AI Study Assistant
                    </span>
                    <h2 className="text-3xl font-semibold text-text_dark">
                      Converse com a inteligencia do Pulse
                    </h2>
                  </div>
                  <select
                    value={requestType}
                    onChange={(event) => setRequestType(event.target.value)}
                    className="koru-select w-auto min-w-[12rem]"
                  >
                    <option value="study_tips">Study Tips</option>
                    <option value="mind_map">Mind Map</option>
                    <option value="code_help">Code Help</option>
                  </select>
                </div>

                <section className="koru-card rounded-[1.9rem] p-5">
                  <div className="h-[30rem] overflow-y-auto rounded-[1.6rem] bg-[linear-gradient(180deg,_rgba(248,251,255,0.9),_rgba(255,255,255,0.98))] p-5 shadow-inset">
                    {chatMessages.length === 0 ? (
                      <div className="flex h-full items-center justify-center text-center text-sm leading-8 text-text_dark/58">
                        PeÃ§a um mapa mental, solicite dicas de estudo ou use a IA
                        como mentor instantaneo para esta disciplina.
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
                              className={`max-w-[86%] rounded-[1.6rem] px-4 py-3 text-sm leading-7 shadow-sm ${
                                isAssistant
                                  ? "mr-auto border border-slate-200 bg-white text-text_dark"
                                  : "ml-auto bg-primary text-white"
                              }`}
                            >
                              {isImageUrl ? (
                                <a
                                  href={message.content}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="font-semibold text-secondary underline"
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
                    <div className="mt-4 rounded-[1.35rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {aiError}
                    </div>
                  )}

                  <form className="mt-5 space-y-4" onSubmit={handleSendPrompt}>
                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-text_dark">
                        Sua pergunta
                      </span>
                      <textarea
                        value={promptText}
                        onChange={(event) => setPromptText(event.target.value)}
                        rows={4}
                        placeholder="Ex: gere um mapa mental sobre o tema principal desta disciplina ou me de uma estrategia para estudar melhor."
                        className="koru-textarea"
                      />
                    </label>

                    <button
                      type="submit"
                      disabled={aiLoading || !promptText.trim()}
                      className="koru-primary-button px-6 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {aiLoading ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                          Gerando resposta...
                        </>
                      ) : (
                        "Ativar mentor IA"
                      )}
                    </button>
                  </form>
                </section>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

