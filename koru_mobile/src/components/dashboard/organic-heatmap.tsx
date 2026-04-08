import { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, {
  Easing,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const ORGANIC_HEATMAP_SHADER = `
uniform float2 resolution;
uniform float time;
uniform float mastery;

half4 main(float2 fragCoord) {
  float2 uv = fragCoord / resolution.xy;
  float2 center = float2(0.42, 0.54);
  float d = distance(uv, center);
  float wave = sin((uv.x * 9.0) + time * 0.9) * 0.06 + cos((uv.y * 7.0) - time * 0.8) * 0.05;
  float bloom = smoothstep(0.62, 0.08, d - wave);
  float intensity = clamp(bloom * (0.45 + mastery * 0.75), 0.0, 1.0);

  half3 alertRed = half3(0.85, 0.31, 0.31);
  half3 moss = half3(0.29, 0.36, 0.31);
  half3 sage = half3(0.54, 0.60, 0.36);
  half3 paper = half3(0.98, 0.97, 0.95);

  half3 mixed = mix(alertRed, moss, mastery);
  mixed = mix(mixed, sage, clamp(intensity, 0.0, 1.0));
  half alpha = half(clamp(intensity * 0.92, 0.0, 0.94));
  half3 finalColor = mix(paper, mixed, alpha);

  return half4(finalColor, alpha);
}
`;

type OrganicHeatmapProps = {
  mastery: number;
};

export function OrganicHeatmap({ mastery }: OrganicHeatmapProps) {
  const animation = useSharedValue(0);

  useEffect(() => {
    animation.value = withRepeat(
      withTiming(1, {
        duration: 4200,
        easing: Easing.inOut(Easing.sine),
      }),
      -1,
      true
    );
  }, [animation]);

  let skia:
    | typeof import("@shopify/react-native-skia")
    | null = null;

  try {
    skia = require("@shopify/react-native-skia");
  } catch {
    skia = null;
  }

  const shaderSource = skia?.Skia?.RuntimeEffect.Make(ORGANIC_HEATMAP_SHADER) ?? null;

  const uniforms = useDerivedValue(() => ({
    resolution: skia?.vec ? skia.vec(320, 240) : { x: 320, y: 240 },
    time: animation.value * Math.PI * 2,
    mastery,
  }));

  if (!skia || !shaderSource) {
    return (
      <View className="rounded-[28px] border border-secondary/10 bg-surface px-5 py-5">
        <Text className="font-heading text-2xl text-primary">Organic Heatmap</Text>
        <Text className="mt-3 font-ui text-sm leading-6 text-primary/70">
          Skia shader unavailable in the current build, but the mastery surface is ready for activation.
        </Text>
      </View>
    );
  }

  const { Canvas, Fill, Paint, Rect, Shader } = skia;

  return (
    <View className="overflow-hidden rounded-[28px] border border-secondary/10 bg-surface px-5 py-5">
      <Text className="font-ui text-[11px] uppercase tracking-[3px] text-secondary">
        Heatmap
      </Text>
      <Text className="mt-3 font-heading text-2xl text-primary">
        Organic mastery surface
      </Text>
      <Text className="mt-2 font-ui text-sm leading-6 text-primary/70">
        Areas in red still need water. As mastery grows, the field settles into moss and sage.
      </Text>

      <View className="mt-5 h-[240px] overflow-hidden rounded-[24px]">
        <Canvas style={{ flex: 1 }}>
          <Fill color="#F9F7F2" />
          <Rect x={0} y={0} width={320} height={240}>
            <Paint>
              <Shader source={shaderSource} uniforms={uniforms} />
            </Paint>
          </Rect>
        </Canvas>
      </View>
    </View>
  );
}
