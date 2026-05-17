import { mockSummaries } from "./mockSummaries";
import type { Summary } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

function isBrowserLocalhost() {
  if (typeof window === "undefined") {
    return false;
  }

  return ["localhost", "127.0.0.1"].includes(window.location.hostname);
}

function isLocalApi() {
  if (!API_BASE) {
    return isBrowserLocalhost();
  }

  return API_BASE.includes("localhost") || API_BASE.includes("127.0.0.1");
}

function delay<T>(value: T) {
  return new Promise<T>(resolve => {
    setTimeout(() => resolve(value), 150);
  });
}

let mockStore: Summary[] = mockSummaries.map(summary => ({
  ...summary,
  items: summary.items.map(item => ({ ...item }))
}));

async function fetchJson<T>(path: string, init?: RequestInit) {
  if (!API_BASE) {
    throw new Error("Missing NEXT_PUBLIC_API_BASE.");
  }

  const res = await fetch(`${API_BASE}${path}`, init);
  if (!res.ok) {
    throw new Error(`Request failed (${res.status})`);
  }

  return (await res.json()) as T;
}

export function isMockMode() {
  return isLocalApi();
}

export async function getSummaries() {
  if (isLocalApi()) {
    return delay(
      mockStore.map(summary => ({
        ...summary,
        items: summary.items.map(item => ({ ...item }))
      }))
    );
  }

  return fetchJson<Summary[]>("/summaries");
}

export async function getSummary(date: string) {
  if (isLocalApi()) {
    const summary = mockStore.find(entry => entry.date === date) ?? null;
    return delay(
      summary
        ? {
            ...summary,
            items: summary.items.map(item => ({ ...item }))
          }
        : null
    );
  }

  return fetchJson<Summary>(`/summaries/${date}`);
}

export async function markSummaryAsRead(date: string) {
  if (isLocalApi()) {
    mockStore = mockStore.map(summary =>
      summary.date === date ? { ...summary, status: "read" } : summary
    );

    const summary = mockStore.find(entry => entry.date === date) ?? null;
    return delay(
      summary
        ? {
            ...summary,
            items: summary.items.map(item => ({ ...item }))
          }
        : null
    );
  }

  await fetchJson(`/summaries/${date}/read`, { method: "POST" });
  return getSummary(date);
}
