import { Text, View } from "react-native";

export default function FocusScreen() {
  return (
    <View className="flex-1 bg-surface px-6 py-8">
      <Text className="font-heading text-3xl text-primary">Focus</Text>
      <Text className="mt-3 font-ui text-base leading-7 text-primary/68">
        Placeholder route wired into the adaptive navigation.
      </Text>
    </View>
  );
}
