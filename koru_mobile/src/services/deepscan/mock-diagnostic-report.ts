export type DiagnosticReportData = {
  studentError: string;
  targetSkill: string;
  baseSkill: string;
  explanation: string;
  graphReasoning: string;
  planMarkdown: string;
};

export const mockDiagnosticReport: DiagnosticReportData = {
  studentError:
    "Ao balancear `Fe2O3 + CO -> Fe + CO2`, o aluno manteve uma leitura instavel da contagem total de oxigenio.",
  targetSkill: "Balanceamento de equacoes quimicas",
  baseSkill: "Conservacao de massa e leitura de coeficientes estequiometricos",
  explanation:
    "A falha visivel nao nasceu no balanceamento final. Ela surgiu antes, quando o coeficiente deixou de ser tratado como contagem total de atomos.",
  graphReasoning:
    "Knowledge Graph: erro observado -> contagem instavel de oxigenio -> leitura incompleta de coeficientes -> habilidade-base de conservacao de massa.",
  planMarkdown: [
    "## Plano diagnostico",
    "",
    "1. Reabrir a habilidade-base com um exemplo minimo:",
    "",
    "```text",
    "2 H2 + O2 -> 2 H2O",
    "```",
    "",
    "2. Confirmar a leitura de coeficientes:",
    "",
    "`2 H2O` significa `4` atomos de hidrogenio e `2` atomos de oxigenio.",
    "",
    "3. Reaplicar ao caso original:",
    "",
    "```latex",
    "Fe_2O_3 + 3CO \\rightarrow 2Fe + 3CO_2",
    "```",
    "",
    "4. Validar a conservacao:",
    "",
    "- Ferro: `2 = 2`",
    "- Carbono: `3 = 3`",
    "- Oxigenio: `6 = 6`",
    "",
    "5. Fechar com transferencia:",
    "",
    "> Se o coeficiente dobra, o que muda na contagem total de cada elemento?",
  ].join("\n"),
};
