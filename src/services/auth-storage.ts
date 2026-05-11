import type { AuthResponse } from "@/types/api";

const authKey = "publicpulse.auth";
const ownedReportsKey = "publicpulse.ownedReports";

type OwnedReports = Record<string, string[]>;

export function getStoredAuth(): AuthResponse | null {
  if (typeof window === "undefined") return null;

  const rawAuth = window.localStorage.getItem(authKey);
  if (!rawAuth) return null;

  try {
    const auth = JSON.parse(rawAuth) as AuthResponse;

    if (!auth.token || Date.parse(auth.expiresAtUtc) <= Date.now()) {
      clearStoredAuth();
      return null;
    }

    return auth;
  } catch {
    clearStoredAuth();
    return null;
  }
}

export function storeAuth(auth: AuthResponse) {
  window.localStorage.setItem(authKey, JSON.stringify(auth));
}

export function clearStoredAuth() {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(authKey);
}

export function getAuthStorageKey() {
  return authKey;
}

export function addOwnedReport(userId: string, reportId: string) {
  const ownedReports = getOwnedReports();
  const userReports = new Set(ownedReports[userId] ?? []);
  userReports.add(reportId);
  ownedReports[userId] = Array.from(userReports);

  window.localStorage.setItem(ownedReportsKey, JSON.stringify(ownedReports));
}

export function isOwnedReport(userId: string, reportId: string) {
  return getOwnedReports()[userId]?.includes(reportId) ?? false;
}

function getOwnedReports(): OwnedReports {
  if (typeof window === "undefined") return {};

  const rawOwnedReports = window.localStorage.getItem(ownedReportsKey);
  if (!rawOwnedReports) return {};

  try {
    return JSON.parse(rawOwnedReports) as OwnedReports;
  } catch {
    window.localStorage.removeItem(ownedReportsKey);
    return {};
  }
}
