import { useEffect } from "react";
import { Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import Animated, {
  Easing,
  useAnimatedProps,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";


const CANVAS_SIZE = 320;
const TOTAL_LENGTH = 760;
const STROKE_WIDTH = 18;

// Minimalista, Empatico e Direto:
// A espiral parte de um desenho koru continuo para manter a leitura de progresso
// como um gesto organico, nao como uma barra industrial.
const SPIRAL_PATH =
  "M165 165 C165 120 125 90 92 107 C63 122 56 162 79 188 C104 216 152 219 184 192 C217 164 225 112 193 77 C159 39 97 31 50 62 C6 91 -8 153 22 205 C56 264 136 285 203 256 C271 228 305 148 271 79";

const WATERCOLOR_BLEED_SHADER = `
uniform float2 resolution;
uniform float time;
uniform float mastery;

float hash21(float2 p) {
  p = fract(p * float2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(float2 p) {
  float2 i = floor(p);
  float2 f = fract(p);

  float a = hash21(i);
  float b = hash21(i + float2(1.0, 0.0));
  float c = hash21(i + float2(0.0, 1.0));
  float d = hash21(i + float2(1.0, 1.0));

  float2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float fbm(float2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int octave = 0; octave < 4; octave++) {
    value += amplitude * noise(p);
    p *= 2.03;
    amplitude *= 0.52;
  }
  return value;
}

half4 main(float2 fragCoord) {
  float2 uv = fragCoord / resolution.xy;
  float2 centered = uv - 0.5;

  float radial = length(centered * float2(1.0, 1.12));
  float drift = sin((uv.x * 6.5) + time * 0.55) * 0.03 + cos((uv.y * 8.2) - time * 0.42) * 0.02;
  float grain = fbm((uv * 8.0) + time * 0.08);
  float paperNoise = fbm((uv * 22.0) - time * 0.02);

  float bloom = smoothstep(0.78, 0.06, radial - drift - mastery * 0.12);
  float bleed = clamp(bloom * (0.28 + mastery * 0.88) + grain * 0.24, 0.0, 1.0);
  float pigment = clamp((mastery * 0.55) + grain * 0.35 + paperNoise * 0.18, 0.0, 1.0);

  half3 paper = half3(0.976, 0.969, 0.949);
  half3 paleMoss = half3(0.70, 0.76, 0.67);
  half3 moss = half3(0.29, 0.36, 0.31);
  half3 deepMoss = half3(0.20, 0.28, 0.22);

  half3 watercolor = mix(paleMoss, moss, clamp(pigment, 0.0, 1.0));
  watercolor = mix(watercolor, deepMoss, clamp(mastery * 0.85, 0.0, 1.0));

  float texture = clamp(0.82 + paperNoise * 0.18, 0.0, 1.0);
  half3 finalColor = mix(paper, watercolor * texture, half(bleed));
  half alpha = half(clamp(0.24 + bleed * 0.76, 0.0, 1.0));

  return half4(finalColor, alpha);
}
`;

type SpiralMasteryProps = {
  mastery: number;
  masteredTopics: number;
  totalTopics: number;
};

type SkiaModule = typeof import("@shopify/react-native-skia");

const AnimatedSvgPath = Animated.createAnimatedComponent(Path);

let skiaModule: SkiaModule | null = null;
try {
  skiaModule = require("@shopify/react-native-skia");
} catch {
  skiaModule = null;
}

const shaderSource =
  skiaModule?.Skia?.RuntimeEffect.Make(WATERCOLOR_BLEED_SHADER) ?? null;


function clampMastery(value: number) {
  return Math.max(0, Math.min(1, value));
}


export function SpiralMastery({
  mastery,
  masteredTopics,
  totalTopics,
}: SpiralMasteryProps) {
  const progress = useSharedValue(0);
  const inkPulse = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(clampMastery(mastery), {
      duration: 1200,
      easing: Easing.out(Easing.cubic),
    });
  }, [mastery, progress]);

  useEffect(() => {
    inkPulse.value = withRepeat(
      withTiming(1, {
        duration: 4600,
        easing: Easing.inOut(Easing.sine),
      }),
      -1,
      true
    );
  }, [inkPulse]);

  const trimEnd = useDerivedValue(() => clampMastery(progress.value));
  const strokeDashoffset = useDerivedValue(
    () => TOTAL_LENGTH * (1 - trimEnd.value)
  );

  const fallbackAnimatedProps = useAnimatedProps(() => ({
    strokeDashoffset: strokeDashoffset.value,
  }));

  const uniforms = useDerivedValue(() => ({
    resolution: skiaModule?.vec
      ? skiaModule.vec(CANVAS_SIZE, CANVAS_SIZE)
      : { x: CANVAS_SIZE, y: CANVAS_SIZE },
    time: inkPulse.value * Math.PI * 2,
    mastery: trimEnd.value,
  }));

  if (!skiaModule || !shaderSource) {
    return (
      <View className="rounded-[30px] bg-primary px-5 py-5">
        <View className="flex-row items-start justify-between">
          <View>
            <Text className="font-ui text-[11px] uppercase tracking-[3px] text-background/60">
              Spiral Mastery
            </Text>
            <Text className="mt-2 font-heading text-3xl text-background">
              {Math.round(clampMastery(mastery) * 100)}%
            </Text>
          </View>
          <View className="rounded-full bg-background/8 px-3 py-2">
            <Text className="font-ui text-sm text-background/78">
              {masteredTopics}/{totalTopics} topics
            </Text>
          </View>
        </View>

        <View className="mt-6 items-center justify-center">
          <Svg width={CANVAS_SIZE} height={CANVAS_SIZE} viewBox={`0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}`}>
            <Path
              d={SPIRAL_PATH}
              stroke="rgba(249,247,242,0.18)"
              strokeWidth={STROKE_WIDTH + 6}
              fill="none"
              strokeLinecap="round"
            />
            <AnimatedSvgPath
              d={SPIRAL_PATH}
              animatedProps={fallbackAnimatedProps}
              stroke="#D8E0C4"
              strokeWidth={STROKE_WIDTH + 10}
              fill="none"
              strokeDasharray={`${TOTAL_LENGTH} ${TOTAL_LENGTH}`}
              strokeLinecap="round"
              opacity={0.22}
            />
            <AnimatedSvgPath
              d={SPIRAL_PATH}
              animatedProps={fallbackAnimatedProps}
              stroke="#8A9A5B"
              strokeWidth={STROKE_WIDTH}
              fill="none"
              strokeDasharray={`${TOTAL_LENGTH} ${TOTAL_LENGTH}`}
              strokeLinecap="round"
            />
          </Svg>
        </View>

        <Text className="mt-2 font-ui text-sm leading-6 text-background/72">
          The koru opens with each correct step, preserving momentum even when the shader layer is unavailable.
        </Text>
      </View>
    );
  }

  const {
    Canvas,
    Fill,
    Group,
    Mask,
    Paint,
    Path: SkiaPath,
    Rect,
    Shader,
    Skia,
  } = skiaModule;

  const spiralPath = Skia.Path.MakeFromSVGString(SPIRAL_PATH);

  if (!spiralPath) {
    return null;
  }

  return (
    <View className="rounded-[30px] bg-primary px-5 py-5">
      <View className="flex-row items-start justify-between">
        <View>
          <Text className="font-ui text-[11px] uppercase tracking-[3px] text-background/60">
            Spiral Mastery
          </Text>
          <Text className="mt-2 font-heading text-3xl text-background">
            {Math.round(clampMastery(mastery) * 100)}%
          </Text>
        </View>
        <View className="rounded-full bg-background/8 px-3 py-2">
          <Text className="font-ui text-sm text-background/78">
            {masteredTopics}/{totalTopics} topics
          </Text>
        </View>
      </View>

      <View className="mt-6 h-[320px] items-center justify-center overflow-hidden rounded-[28px] bg-[#314035]">
        <Canvas style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}>
          <Fill color="#314035" />

          <SkiaPath
            path={spiralPath}
            color="rgba(249,247,242,0.15)"
            style="stroke"
            strokeWidth={STROKE_WIDTH + 6}
            strokeCap="round"
            strokeJoin="round"
          />

          <SkiaPath
            path={spiralPath}
            color="rgba(216,224,196,0.18)"
            style="stroke"
            strokeWidth={STROKE_WIDTH + 14}
            strokeCap="round"
            strokeJoin="round"
            start={0}
            end={trimEnd}
          />

          <Mask
            mode="alpha"
            mask={
              <Group>
                <SkiaPath
                  path={spiralPath}
                  color="white"
                  style="stroke"
                  strokeWidth={STROKE_WIDTH + 8}
                  strokeCap="round"
                  strokeJoin="round"
                  start={0}
                  end={trimEnd}
                />
              </Group>
            }
          >
            <Rect x={0} y={0} width={CANVAS_SIZE} height={CANVAS_SIZE}>
              <Paint>
                <Shader source={shaderSource} uniforms={uniforms} />
              </Paint>
            </Rect>
          </Mask>

          <SkiaPath
            path={spiralPath}
            color="rgba(249,247,242,0.28)"
            style="stroke"
            strokeWidth={2}
            strokeCap="round"
            strokeJoin="round"
            start={0}
            end={trimEnd}
          />
        </Canvas>
      </View>

      <Text className="mt-4 font-ui text-sm leading-6 text-background/72">
        Moss pigment spreads with mastery, while a grainy paper texture keeps the progress surface tactile and calm.
      </Text>
    </View>
  );
}
