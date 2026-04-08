import Link from "next/link";

const pillars = [
  {
    title: "Base",
    description:
      "Organiza disciplinas, topicos e habilidades para atacar a raiz da dificuldade.",
  },
  {
    title: "Diagnostico",
    description:
      "Lê o erro com serenidade e mostra onde a fundacao cognitiva precisa de reforco.",
  },
  {
    title: "Expansao",
    description:
      "Transforma dominio de base em progresso para medicina, engenharia e vestibulares de elite.",
  },
];

export default function HomePage() {
  return (
    <main className="koru-grid min-h-screen px-4 py-8 text-text_dark sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="koru-shell overflow-hidden rounded-[2.4rem]">
          <div className="grid gap-0 xl:grid-cols-[1.08fr_0.92fr]">
            <div className="koru-panel-dark koru-radar px-6 py-8 text-text_light sm:px-8 xl:px-12">
              <div className="space-y-8">
                <p className="koru-kicker text-secondary">KORU RAIZ</p>
                <div className="space-y-5">
                  <h1 className="max-w-3xl text-5xl font-semibold leading-[1.05] xl:text-6xl">
                    A base que te expande.
                  </h1>
                  <p className="max-w-2xl text-base leading-8 text-text_light/76 xl:text-lg">
                    KORU existe para remover ruido cognitivo e mostrar a origem
                    real da dificuldade academica. Quando a base se organiza,
                    o resto deixa de parecer caos.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/register"
                    className="koru-primary-button px-6 py-3 text-sm font-semibold"
                  >
                    Criar conta
                  </Link>
                  <Link
                    href="/login"
                    className="koru-secondary-button border border-white/12 bg-white/8 px-6 py-3 text-sm font-semibold text-white"
                  >
                    Entrar
                  </Link>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="koru-stat rounded-[1.7rem] p-5">
                    <p className="text-xs uppercase tracking-[0.22em] text-secondary">
                      Guia
                    </p>
                    <p className="mt-3 text-sm leading-7 text-text_light/76">
                      Uma presenca serena que orienta o aluno sem sobrecarrega-lo.
                    </p>
                  </div>
                  <div className="koru-stat rounded-[1.7rem] p-5">
                    <p className="text-xs uppercase tracking-[0.22em] text-secondary">
                      Base
                    </p>
                    <p className="mt-3 text-sm leading-7 text-text_light/76">
                      O progresso comeca nos fundamentos que sustentam o restante.
                    </p>
                  </div>
                  <div className="koru-stat rounded-[1.7rem] p-5">
                    <p className="text-xs uppercase tracking-[0.22em] text-secondary">
                      Expansao
                    </p>
                    <p className="mt-3 text-sm leading-7 text-text_light/76">
                      O crescimento academico acontece como consequencia do dominio.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-8 sm:px-8 xl:px-12">
              <div className="space-y-6">
                <div className="space-y-3">
                  <span className="koru-chip bg-primary/10 text-primary">
                    Estrategia RAIZ
                  </span>
                  <h2 className="text-3xl font-semibold text-text_dark">
                    Um produto desenhado para clareza, profundidade e calma.
                  </h2>
                  <p className="max-w-2xl text-sm leading-7 text-text_dark/66">
                    A interface deve agir como um guia: minima no ruido,
                    forte na leitura diagnostica e precisa no proximo passo.
                  </p>
                </div>

                <div className="grid gap-4">
                  {pillars.map((pillar) => (
                    <article
                      key={pillar.title}
                      className="koru-card rounded-[1.8rem] p-5"
                    >
                      <p className="text-xs uppercase tracking-[0.2em] text-secondary">
                        Pilar
                      </p>
                      <h3 className="mt-3 text-xl font-semibold text-text_dark">
                        {pillar.title}
                      </h3>
                      <p className="mt-2 text-sm leading-7 text-text_dark/66">
                        {pillar.description}
                      </p>
                    </article>
                  ))}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Link
                    href="/dashboard"
                    className="pulse-ring rounded-[1.7rem] border border-slate-200 bg-white p-5 shadow-[0_16px_34px_rgba(42,98,143,0.06)] transition hover:-translate-y-1"
                  >
                    <p className="text-xs uppercase tracking-[0.2em] text-primary">
                      Dashboard
                    </p>
                    <h3 className="mt-3 text-xl font-semibold text-text_dark">
                      Veja a raiz do progresso
                    </h3>
                  </Link>
                  <Link
                    href="/studyhub/subjects"
                    className="pulse-ring rounded-[1.7rem] border border-slate-200 bg-white p-5 shadow-[0_16px_34px_rgba(42,98,143,0.06)] transition hover:-translate-y-1"
                  >
                    <p className="text-xs uppercase tracking-[0.2em] text-secondary">
                      Study Hub
                    </p>
                    <h3 className="mt-3 text-xl font-semibold text-text_dark">
                      Explore a malha de fundamentos
                    </h3>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
