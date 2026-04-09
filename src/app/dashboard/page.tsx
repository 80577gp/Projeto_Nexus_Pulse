import { Suspense } from "react";

import { DashboardClientPanel } from "./_components/dashboard-client-panel";


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


function DashboardStaticShell() {
  return (
    <section className="koru-shell overflow-hidden rounded-[2.35rem]">
      <div className="grid gap-0 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="koru-panel-dark px-6 py-8 text-text_light sm:px-8 xl:px-12">
          <div className="space-y-8">
            <div className="space-y-4">
              <p className="koru-kicker text-secondary">KORU RAIZ</p>
              <div className="space-y-4">
                <h1 className="max-w-2xl text-4xl font-semibold leading-tight xl:text-5xl">
                  A leitura da base com a calma de um guia.
                </h1>
                <p className="max-w-xl text-base leading-8 text-text_light/76">
                  O layout nasce no servidor para reduzir friccao e deixar o estudante
                  entrar no foco antes mesmo de os dados dinamicos terminarem de chegar.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="koru-stat rounded-[1.7rem] p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-secondary">
                  Doutrina
                </p>
                <p className="mt-3 text-lg font-semibold text-white">RAIZ</p>
                <p className="mt-1 text-sm text-text_light/72">
                  fundamento acima de ruido
                </p>
              </div>
              <div className="koru-stat rounded-[1.7rem] p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-secondary">
                  Render
                </p>
                <p className="mt-3 text-lg font-semibold text-white">Server-first</p>
                <p className="mt-1 text-sm text-text_light/72">
                  shell estavel e resposta suave
                </p>
              </div>
              <div className="koru-stat rounded-[1.7rem] p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-secondary">
                  Fluxo
                </p>
                <p className="mt-3 text-lg font-semibold text-white">View transitions</p>
                <p className="mt-1 text-sm text-text_light/72">
                  navegacao com continuidade visual
                </p>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-[1.8rem] border border-white/10 bg-white/6 p-6">
                <p className="text-xs uppercase tracking-[0.22em] text-secondary">
                  Doutrina RAIZ
                </p>
                <p className="mt-3 max-w-xl text-lg leading-8 text-text_light/82">
                  Va direto na base. O resto e consequencia.
                </p>
              </div>
              <div className="rounded-[1.8rem] border border-white/10 bg-white/6 p-6">
                <p className="text-xs uppercase tracking-[0.22em] text-secondary">
                  Proximo movimento
                </p>
                <div className="mt-4 rounded-[1.4rem] border border-white/10 bg-black/10 px-4 py-4 text-sm leading-7 text-text_light/78">
                  DeepScan, RAG e BKT devem convergir na raiz da duvida antes de escalar a carga.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-8 sm:px-8 xl:px-12">
          <Suspense fallback={<DashboardRealtimeFallback />}>
            <DashboardClientPanel />
          </Suspense>
        </div>
      </div>
    </section>
  );
}


function DashboardRealtimeFallback() {
  return (
    <div className="space-y-6">
      <section className="koru-card rounded-[1.9rem] p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-32 rounded-full bg-primary/10" />
          <div className="h-8 w-2/3 rounded-full bg-primary/10" />
          <div className="h-24 rounded-[1.5rem] bg-primary/6" />
        </div>
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


export default function DashboardPage() {
  return (
    <main className="koru-grid min-h-screen px-4 py-8 text-text_dark sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <DashboardStaticShell />
      </div>
    </main>
  );
}
