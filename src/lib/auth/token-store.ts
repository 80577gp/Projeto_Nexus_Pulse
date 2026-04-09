"use client";

const ACCESS_TOKEN_KEY = "authToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const SESSION_MARKER_COOKIE = "koru_session";


function isBrowser() {
  return typeof window !== "undefined" && typeof document !== "undefined";
}


function setSessionMarkerCookie(isAuthenticated: boolean) {
  if (!isBrowser()) {
    return;
  }

  const secureFlag = window.location.protocol === "https:" ? "; Secure" : "";

  if (isAuthenticated) {
    document.cookie =
      `${SESSION_MARKER_COOKIE}=active; Path=/; SameSite=Lax${secureFlag}`;
    return;
  }

  document.cookie =
    `${SESSION_MARKER_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax${secureFlag}`;
}


export function getAccessToken() {
  if (!isBrowser()) {
    return null;
  }
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}


export function getRefreshToken() {
  if (!isBrowser()) {
    return null;
  }
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}


export function setTokens(tokens: { access?: string | null; refresh?: string | null }) {
  if (!isBrowser()) {
    return;
  }

  if (tokens.access) {
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access);
  } else if (tokens.access === null) {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  }
  if (tokens.refresh) {
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh);
  } else if (tokens.refresh === null) {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  setSessionMarkerCookie(Boolean(tokens.access || getAccessToken()));
}


export function clearTokens() {
  if (!isBrowser()) {
    return;
  }

  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  setSessionMarkerCookie(false);
}
