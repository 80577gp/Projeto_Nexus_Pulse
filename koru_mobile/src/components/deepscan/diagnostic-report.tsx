import { useEffect } from "react";
import { Text, View } from "react-native";
import Markdown from "react-native-markdown-display";
import Svg, { Circle, Defs, LinearGradient, Line, Stop } from "react-native-svg";
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import type { DiagnosticReportData } from "@/services/deepscan/mock-diagnostic-report";


const AnimatedLine = Animated.createAnimatedComponent(Line);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const markdownStyles = {
  body: {
    color: "#333333",
    fontSize: 15,
    lineHeight: 26,
    fontFamily: "Inter_400Regular",
  },
  heading2: {
    color: "#4A5D4E",
    fontSize: 22,
    marginBottom: 10,
    fontFamily: "Lora_600SemiBold",
  },
  code_inline: {
    backgroundColor: "rgba(74,93,78,0.08)",
    color: "#4A5D4E",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  code_block: {
    backgroundColor: "rgba(249,247,242,0.92)",
    borderColor: "rgba(74,93,78,0.12)",
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    color: "#333333",
  },
  fence: {
    backgroundColor: "rgba(249,247,242,0.92)",
    borderColor: "rgba(74,93,78,0.12)",
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    color: "#333333",
  },
  blockquote: {
    borderLeftColor: "#8A9A5B",
    backgroundColor: "rgba(138,154,91,0.08)",
    borderLeftWidth: 3,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
  },
} as const;


function TracingBeam({ report }: { report: DiagnosticReportData }) {
  const beam = useSharedValue(0);

  useEffect(() => {
    beam.value = withRepeat(
      withTiming(1, {
        duration: 2200,
        easing: Easing.inOut(Easing.sine),
      }),
      -1,
      true
    );
  }, [beam]);

  const lineProps = useAnimatedProps(() => ({
    strokeOpacity: 0.24 + beam.value * 0.5,
  }));

  const pulseProps = useAnimatedProps(() => ({
    r: 8 + beam.value * 6,
    opacity: 0.18 + beam.value * 0.32,
  }));

  return (
    <View className="rounded-[28px] border border-primary/8 bg-white/30 px-5 py-5">
      <Text className="font-ui text-[11px] uppercase tracking-[3px] text-secondary">
        Tracing Beam
      </Text>
      <Text className="mt-3 font-heading text-2xl text-primary">
        Da falha observada ate a habilidade-base
      </Text>
      <Text className="mt-2 font-ui text-sm leading-6 text-primary/68">
        O feixe conecta o erro ao fundamento que precisa ser reidratado.
      </Text>

      <View className="mt-5 overflow-hidden rounded-[22px] bg-background">
        <Svg width="100%" height="220" viewBox="0 0 320 220">
          <Defs>
            <LinearGradient id="beamGradient" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#D9B87A" stopOpacity="0.24" />
              <Stop offset="55%" stopColor="#8A9A5B" stopOpacity="0.94" />
              <Stop offset="100%" stopColor="#4A5D4E" stopOpacity="0.8" />
            </LinearGradient>
          </Defs>

          <AnimatedLine
            x1="92"
            y1="60"
            x2="232"
            y2="160"
            stroke="url(#beamGradient)"
            strokeWidth="4"
            strokeDasharray="10 8"
            strokeLinecap="round"
            animatedProps={lineProps}
          />
          <Circle cx="92" cy="60" r="20" fill="rgba(217,184,122,0.14)" />
          <Circle cx="232" cy="160" r="24" fill="rgba(74,93,78,0.14)" />
          <Circle cx="92" cy="60" r="11" fill="#D9B87A" />
          <Circle cx="232" cy="160" r="13" fill="#4A5D4E" />
          <AnimatedCircle cx="232" cy="160" fill="#8A9A5B" animatedProps={pulseProps} />
        </Svg>
      </View>

      <View className="mt-4 gap-3">
        <View className="rounded-[18px] border border-primary/8 bg-background px-4 py-4">
          <Text className="font-ui text-[11px] uppercase tracking-[2px] text-secondary">
            Student Error
          </Text>
          <Text className="mt-2 font-ui text-sm leading-6 text-primary/74">
            {report.studentError}
          </Text>
        </View>
        <View className="rounded-[18px] border border-primary/8 bg-background px-4 py-4">
          <Text className="font-ui text-[11px] uppercase tracking-[2px] text-secondary">
            Base Skill
          </Text>
          <Text className="mt-2 font-heading text-xl text-primary">
            {report.baseSkill}
          </Text>
        </View>
      </View>
    </View>
  );
}


export function DiagnosticReport({ report }: { report: DiagnosticReportData }) {
  return (
    <View className="gap-4">
      <TracingBeam report={report} />

      <View className="rounded-[28px] border border-primary/8 bg-white/34 px-5 py-5">
        <Text className="font-ui text-[11px] uppercase tracking-[3px] text-secondary">
          Root Cause
        </Text>
        <Text className="mt-3 font-heading text-2xl text-primary">
          {report.targetSkill}
        </Text>
        <Text className="mt-3 font-ui text-base leading-7 text-primary/74">
          {report.explanation}
        </Text>
        <Text className="mt-4 font-ui text-sm leading-6 text-primary/60">
          {report.graphReasoning}
        </Text>
      </View>

      <View className="rounded-[28px] border border-primary/8 bg-white/34 px-5 py-5">
        <Text className="font-ui text-[11px] uppercase tracking-[3px] text-secondary">
          Diagnostic Plan
        </Text>
        <Text className="mt-3 font-heading text-2xl text-primary">
          Plano de reequilibrio
        </Text>
        <View className="mt-4 rounded-[22px] bg-background px-4 py-4">
          <Markdown style={markdownStyles}>{report.planMarkdown}</Markdown>
        </View>
      </View>
    </View>
  );
}
