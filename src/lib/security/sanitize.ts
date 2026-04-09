"use client";

import DOMPurify from "dompurify";


export function sanitizeWebInput(value: string) {
  return DOMPurify.sanitize(value, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  }).trim();
}


export function sanitizeWebObject<T extends Record<string, unknown>>(payload: T): T {
  return Object.fromEntries(
    Object.entries(payload).map(([key, value]) => [
      key,
      typeof value === "string" ? sanitizeWebInput(value) : value,
    ])
  ) as T;
}
