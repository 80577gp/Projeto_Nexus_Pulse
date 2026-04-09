import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { setAudioModeAsync, useAudioPlayer } from "expo-audio";
import Animated from "react-native-reanimated";

import { DiagnosticReport } from "@/components/deepscan/diagnostic-report";
import { DeepScanErrorBoundary } from "@/components/deepscan/deep-scan-error-boundary";
import { SkeletonCard } from "@/components/feedback/skeleton-card";
import { mobileApiClient } from "@/services/api/mobile-api-client";
import {
  mockDiagnosticReport,
  type DiagnosticReportData,
} from "@/services/deepscan/mock-diagnostic-report";


function buildPaperRustleDataUri() {
  const sampleRate = 8000;
  const durationSeconds = 0.26;
  const sampleCount = Math.floor(sampleRate * durationSeconds);
  const pcmBytes = new Uint8Array(sampleCount);

  for (let index = 0; index < sampleCount; index += 1) {
    const envelope = 1 - index / sampleCount;
    const noise =
      Math.sin(index * 1.91) * 0.35 + Math.cos(index * 0.47) * 0.25;
    const sample = 128 + Math.round(noise * 48 * envelope);
    pcmBytes[index] = Math.max(0, Math.min(255, sample));
  }

  const wavSize = 44 + pcmBytes.length;
  const buffer = new ArrayBuffer(wavSize);
  const view = new DataView(buffer);
  let offset = 0;

  const writeString = (value: string) => {
    for (let index = 0; index < value.length; index += 1) {
      view.setUint8(offset, value.charCodeAt(index));
      offset += 1;
    }
  };

  writeString("RIFF");
  view.setUint32(offset, wavSize - 8, true);
  offset += 4;
  writeString("WAVE");
  writeString("fmt ");
  view.setUint32(offset, 16, true);
  offset += 4;
  view.setUint16(offset, 1, true);
  offset += 2;
  view.setUint16(offset, 1, true);
  offset += 2;
  view.setUint32(offset, sampleRate, true);
  offset += 4;
  view.setUint32(offset, sampleRate, true);
  offset += 4;
  view.setUint16(offset, 1, true);
  offset += 2;
  view.setUint16(offset, 8, true);
  offset += 2;
  writeString("data");
  view.setUint32(offset, pcmBytes.length, true);
  offset += 4;

  pcmBytes.forEach((byte) => {
    view.setUint8(offset, byte);
    offset += 1;
  });

  return `data:audio/wav;base64,${toBase64(new Uint8Array(buffer))}`;
}


function toBase64(bytes: Uint8Array) {
  const alphabet =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let output = "";

  for (let index = 0; index < bytes.length; index += 3) {
    const byte1 = bytes[index] ?? 0;
    const byte2 = bytes[index + 1] ?? 0;
    const byte3 = bytes[index + 2] ?? 0;
    const chunk = (byte1 << 16) | (byte2 << 8) | byte3;

    output += alphabet[(chunk >> 18) & 63];
    output += alphabet[(chunk >> 12) & 63];
    output += index + 1 < bytes.length ? alphabet[(chunk >> 6) & 63] : "=";
    output += index + 2 < bytes.length ? alphabet[chunk & 63] : "=";
  }

  return output;
}


const paperRustleSource = buildPaperRustleDataUri();


function buildReportFromAnalysis(analysis: {
  explanation: string;
  recovery_plan: string[];
  root_cause_id: number;
  priority: number;
}): DiagnosticReportData {
  return {
    studentError:
      "O erro recente sugere que a leitura simbolica ainda oscila antes do procedimento final.",
    targetSkill: "DeepScan Root Cause",
    baseSkill: `Base Skill #${analysis.root_cause_id}`,
    explanation: analysis.explanation,
    graphReasoning: `Knowledge Graph priority ${analysis.priority}: prerequisite node ${analysis.root_cause_id} was identified as the root blocker.`,
    planMarkdown: [
      "## Plano diagnostico",
      "",
      ...analysis.recovery_plan.map((step, index) => `${index + 1}. ${step}`),
    ].join("\n"),
  };
}


function DiagnosticReportSurface({
  status,
  report,
}: {
  status: "loading" | "success" | "error";
  report: DiagnosticReportData | null;
}) {
  if (status === "error") {
    throw new Error("DeepScan API recalibration requested.");
  }

  if (status === "loading" || !report) {
    return (
      <View className="gap-4">
        <SkeletonCard height={330} />
        <SkeletonCard height={260} />
        <SkeletonCard height={360} />
      </View>
    );
  }

  return <DiagnosticReport report={report} />;
}


export default function DeepScanScreen() {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [report, setReport] = useState<DiagnosticReportData | null>(null);
  const [revealVersion, setRevealVersion] = useState(0);
  const player = useAudioPlayer(paperRustleSource, { updateInterval: 250 });

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: false,
      shouldPlayInBackground: false,
      interruptionMode: "mixWithOthers",
    }).catch(() => null);
  }, []);

  useEffect(() => {
    let cancelled = false;

    setStatus("loading");
    setReport(null);

    const timer = setTimeout(async () => {
      try {
        const response = await mobileApiClient.post("/ai/deepscan/analyze/", {
          student_failure_summary:
            "The student balanced the equation mechanically but lost conservation of oxygen when coefficients changed.",
          target_skill: "Chemical equation balancing",
          expected_answer: "Fe2O3 + 3CO -> 2Fe + 3CO2",
          prerequisite_skills: [
            "Conservation of mass",
            "Reading stoichiometric coefficients",
          ],
          additional_context:
            "Prior mistakes suggest instability in symbolic reading before balancing.",
        });

        const analysis = response.data?.analysis;
        if (!analysis) {
          throw new Error("DeepScan returned no structured analysis.");
        }

        if (!cancelled) {
          setReport(buildReportFromAnalysis(analysis));
          setStatus("success");
        }
      } catch {
        if (!cancelled) {
          setReport(mockDiagnosticReport);
          setStatus("success");
        }
      }
    }, 1350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [revealVersion]);

  useEffect(() => {
    if (status !== "success") {
      return;
    }

    try {
      player.seekTo(0);
      player.play();
    } catch {
      // Minimalista, Empatico e Direto:
      // O som e atmosferico. Se falhar, a leitura principal continua.
    }
  }, [player, status]);

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ padding: 24 }}
    >
      <View className="mx-auto w-full max-w-[1080px] gap-5">
        <Animated.View
          sharedTransitionTag="dashboard-deepscan"
          className="rounded-[30px] border border-primary/8 bg-white/36 px-6 py-6"
        >
          <Text className="font-ui text-[11px] uppercase tracking-[3px] text-secondary">
            DeepScan Diagnostic
          </Text>
          <Text className="mt-3 font-heading text-3xl text-primary">
            Root-cause analysis with a calm surface
          </Text>
          <Text className="mt-3 font-ui text-base leading-7 text-primary/68">
            O relatorio nao apenas responde. Ele mostra o caminho entre a falha
            observada e a habilidade-base que precisa ser fortalecida.
          </Text>
        </Animated.View>

        <View className="rounded-[30px] border border-primary/8 bg-white/30 px-6 py-6">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="font-ui text-[11px] uppercase tracking-[3px] text-secondary">
                Session State
              </Text>
              <Text className="mt-3 font-heading text-2xl text-primary">
                {status === "loading"
                  ? "Reading the root of the error"
                  : status === "success"
                    ? "Diagnostic plan revealed"
                    : "Recalibrating"}
              </Text>
            </View>
            <Pressable
              onPress={() => setRevealVersion((value) => value + 1)}
              className="rounded-full border border-primary/10 bg-background px-4 py-3"
            >
              <Text className="font-ui text-sm text-primary">Run again</Text>
            </Pressable>
          </View>
        </View>

        <DeepScanErrorBoundary>
          <DiagnosticReportSurface status={status} report={report} />
        </DeepScanErrorBoundary>
      </View>
    </ScrollView>
  );
}
