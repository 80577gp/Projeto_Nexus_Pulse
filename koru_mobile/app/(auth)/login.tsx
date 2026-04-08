import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function LoginScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-surface px-6">
      <View className="w-full max-w-[520px] rounded-[34px] border border-primary/8 bg-primary px-7 py-8">
        <Text className="font-heading text-4xl text-surface">Welcome back</Text>
        <Text className="mt-3 font-ui text-base leading-7 text-surface/72">
          The universal navigation shell is ready. This auth group is now isolated from the main app experience.
        </Text>
        <Link href="/(app)/dashboard" asChild>
          <Pressable className="mt-8">
            <Text className="font-heading text-lg text-secondary">Enter KORU</Text>
          </Pressable>
        </Link>
        <Link href="/(auth)/register" asChild>
          <Pressable className="mt-4">
            <Text className="font-ui text-sm uppercase tracking-[3px] text-surface/60">
              Create account
            </Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}
