import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function RegisterScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-surface px-6">
      <View className="w-full max-w-[520px] rounded-[34px] border border-primary/8 bg-surface px-7 py-8 shadow-luxe">
        <Text className="font-heading text-4xl text-primary">Create your arc</Text>
        <Text className="mt-3 font-ui text-base leading-7 text-primary/68">
          Registration lives inside the auth route group and stays separate from the authenticated shell.
        </Text>
        <Link href="/(auth)/login" asChild>
          <Pressable className="mt-8">
            <Text className="font-heading text-lg text-secondary">Back to login</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}
