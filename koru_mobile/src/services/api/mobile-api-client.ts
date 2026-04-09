import axios from "axios";

import { useAuthStore } from "@/stores/auth-store";


const apiBaseURL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";

export const mobileApiClient = axios.create({
  baseURL: apiBaseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

let refreshPromise: Promise<string | null> | null = null;

async function rotateMobileRefreshToken() {
  const refreshToken = useAuthStore.getState().refreshToken;
  if (!refreshToken) {
    useAuthStore.getState().clearTokens();
    return null;
  }

  const response = await axios.post(
    `${apiBaseURL}/auth/token/refresh/`,
    { refresh: refreshToken },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  const nextAccess = response.data?.access ?? null;
  const nextRefresh = response.data?.refresh ?? refreshToken;

  useAuthStore.getState().setTokens({
    accessToken: nextAccess,
    refreshToken: nextRefresh,
  });

  return nextAccess;
}

mobileApiClient.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().accessToken;
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

mobileApiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as typeof error.config & {
      _retry?: boolean;
      headers: Record<string, string>;
    };

    if (error.response?.status !== 401 || originalRequest?._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (!refreshPromise) {
      refreshPromise = rotateMobileRefreshToken().finally(() => {
        refreshPromise = null;
      });
    }

    const nextAccess = await refreshPromise;

    if (!nextAccess) {
      useAuthStore.getState().clearTokens();
      return Promise.reject(error);
    }

    originalRequest.headers = originalRequest.headers ?? {};
    originalRequest.headers.Authorization = `Bearer ${nextAccess}`;
    return mobileApiClient(originalRequest);
  }
);
