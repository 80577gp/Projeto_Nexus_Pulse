import { useState } from "react";
import { router } from "expo-router";
import { Pressable, Text, TextInput, View } from "react-native";
import axios from "axios";

import { mobileApiClient } from "@/services/api/mobile-api-client";
import { sanitizeMobileObject } from "@/services/security/mobile-sanitize";
import { useAuthStore } from "@/stores/auth-store";


export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const setTokens = useAuthStore((state) => state.setTokens);

  async function handleRegister() {
    setError("");
    setLoading(true);

    try {
      const response = await mobileApiClient.post(
        "/auth/register/",
        sanitizeMobileObject({
          email,
          username,
          password,
          password_confirm: passwordConfirm,
          role: "student",
          school_year: "1a Serie EM",
        })
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
          ? submitError.response?.data?.detail ||
            submitError.response?.data?.email?.[0] ||
            submitError.response?.data?.username?.[0] ||
            submitError.response?.data?.password?.[0] ||
            submitError.response?.data?.password_confirm?.[0] ||
            submitError.message
          : submitError instanceof Error
            ? submitError.message
            : "Nao foi possivel cadastrar."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 items-center justify-center bg-background px-6">
      <View className="w-full max-w-[520px] rounded-[34px] border border-primary/8 bg-surface px-7 py-8 shadow-luxe">
        <Text className="font-heading text-4xl text-primary">Create your arc</Text>
        <Text className="mt-3 font-ui text-base leading-7 text-primary/68">
          Cadastro com persistencia offline-first e protecao local por chave guardada no sistema.
        </Text>

        <View className="mt-8 gap-4">
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="voce@exemplo.com"
            autoCapitalize="none"
            keyboardType="email-address"
            className="rounded-[22px] border border-primary/8 bg-white px-4 py-4 font-ui text-primary"
          />
          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder="seu_usuario"
            autoCapitalize="none"
            className="rounded-[22px] border border-primary/8 bg-white px-4 py-4 font-ui text-primary"
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Sua senha"
            secureTextEntry
            className="rounded-[22px] border border-primary/8 bg-white px-4 py-4 font-ui text-primary"
          />
          <TextInput
            value={passwordConfirm}
            onChangeText={setPasswordConfirm}
            placeholder="Confirme sua senha"
            secureTextEntry
            className="rounded-[22px] border border-primary/8 bg-white px-4 py-4 font-ui text-primary"
          />
        </View>

        {error ? (
          <View className="mt-4 rounded-[18px] bg-primary/6 px-4 py-3">
            <Text className="font-ui text-sm text-primary">{error}</Text>
          </View>
        ) : null}

        <Pressable
          onPress={handleRegister}
          disabled={loading}
          className="mt-8 rounded-full bg-primary px-5 py-4"
        >
          <Text className="text-center font-heading text-lg text-background">
            {loading ? "Criando..." : "Create account"}
          </Text>
        </Pressable>

        <Pressable onPress={() => router.push("/(auth)/login")} className="mt-4">
          <Text className="font-ui text-sm uppercase tracking-[3px] text-primary/60">
            Back to login
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
