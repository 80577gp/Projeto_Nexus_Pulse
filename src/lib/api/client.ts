"use client";

import axios from "axios";

import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "@/lib/auth/token-store";


const apiBaseURL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

export const webApiClient = axios.create({
  baseURL: apiBaseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

let refreshPromise: Promise<string | null> | null = null;

async function rotateRefreshToken() {
  const refresh = getRefreshToken();
  if (!refresh) {
    clearTokens();
    return null;
  }

  const response = await axios.post(
    `${apiBaseURL}/auth/token/refresh/`,
    { refresh },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  const access = response.data?.access ?? null;
  const nextRefresh = response.data?.refresh ?? refresh;

  setTokens({
    access,
    refresh: nextRefresh,
  });

  return access;
}

webApiClient.interceptors.request.use((config) => {
  const access = getAccessToken();
  if (access) {
    config.headers.Authorization = `Bearer ${access}`;
  }
  return config;
});

webApiClient.interceptors.response.use(
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
      refreshPromise = rotateRefreshToken().finally(() => {
        refreshPromise = null;
      });
    }

    const nextAccess = await refreshPromise;

    if (!nextAccess) {
      clearTokens();
      return Promise.reject(error);
    }

    originalRequest.headers = originalRequest.headers ?? {};
    originalRequest.headers.Authorization = `Bearer ${nextAccess}`;
    return webApiClient(originalRequest);
  }
);
