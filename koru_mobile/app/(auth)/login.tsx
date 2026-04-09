import { useState } from "react";
import { router } from "expo-router";
import { Pressable, Text, TextInput, View } from "react-native";
import axios from "axios";

import { mobileApiClient } from "@/services/api/mobile-api-client";
import { sanitizeMobileObject } from "@/services/security/mobile-sanitize";
import { useAuthStore } from "@/stores/auth-store";


export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const setTokens = useAuthStore((state) => state.setTokens);

  async function handleLogin() {
    setError("");
    setLoading(true);

    try {
      const response = await mobileApiClient.post(
        "/auth/login/",
        sanitizeMobileObject({ email, password })
      );

      if (!response.data?.access) {
        throw new Error("No access token returned.");
      }

      setTokens({
        accessToken: response.data.access,
        refreshToken: response.data.refresh ?? null,
      });
      router.replace("/(app)/dashboard");
    } catch (submitError) {
      setError(
        axios.isAxiosError(submitError)
          ? submitError.response?.data?.detail || submitError.message
          : submitError instanceof Error
            ? submitError.message
            : "Nao foi possivel entrar."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 items-center justify-center bg-background px-6">
      <View className="w-full max-w-[520px] rounded-[34px] border border-primary/8 bg-primary px-7 py-8">
        <Text className="font-heading text-4xl text-background">Welcome back</Text>
        <Text className="mt-3 font-ui text-base leading-7 text-background/72">
          Entre com serenidade. Seus tokens vivem em uma particao MMKV protegida.
        </Text>

        <View className="mt-8 gap-4">
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="voce@exemplo.com"
            placeholderTextColor="rgba(249,247,242,0.52)"
            autoCapitalize="none"
            keyboardType="email-address"
            className="rounded-[22px] border border-white/12 bg-white/8 px-4 py-4 font-ui text-background"
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Sua senha"
            placeholderTextColor="rgba(249,247,242,0.52)"
            secureTextEntry
            className="rounded-[22px] border border-white/12 bg-white/8 px-4 py-4 font-ui text-background"
          />
        </View>

        {error ? (
          <View className="mt-4 rounded-[18px] bg-white/10 px-4 py-3">
            <Text className="font-ui text-sm text-background">{error}</Text>
          </View>
        ) : null}

        <Pressable
          onPress={handleLogin}
          disabled={loading}
          className="mt-8 rounded-full bg-background px-5 py-4"
        >
          <Text className="text-center font-heading text-lg text-primary">
            {loading ? "Entrando..." : "Enter KORU"}
          </Text>
        </Pressable>

        <Pressable onPress={() => router.push("/(auth)/register")} className="mt-4">
          <Text className="font-ui text-sm uppercase tracking-[3px] text-background/60">
            Create account
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
