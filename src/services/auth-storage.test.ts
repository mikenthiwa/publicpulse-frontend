import {
  addOwnedReport,
  clearStoredAuth,
  getAuthStorageKey,
  getStoredAuth,
  isOwnedReport,
  storeAuth,
} from "@/services/auth-storage";
import type { AuthResponse } from "@/types/api";

const validAuth: AuthResponse = {
  userId: "user-1",
  email: "citizen@example.com",
  token: "token-1",
  expiresAtUtc: new Date(Date.now() + 60_000).toISOString(),
};

describe("auth storage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("stores, reads, and clears auth", () => {
    storeAuth(validAuth);

    expect(getStoredAuth()).toEqual(validAuth);

    clearStoredAuth();

    expect(getStoredAuth()).toBeNull();
  });

  it("drops expired auth", () => {
    storeAuth({
      ...validAuth,
      expiresAtUtc: new Date(Date.now() - 60_000).toISOString(),
    });

    expect(getStoredAuth()).toBeNull();
    expect(window.localStorage.getItem(getAuthStorageKey())).toBeNull();
  });

  it("drops invalid auth JSON", () => {
    window.localStorage.setItem(getAuthStorageKey(), "not-json");

    expect(getStoredAuth()).toBeNull();
    expect(window.localStorage.getItem(getAuthStorageKey())).toBeNull();
  });

  it("tracks owned reports by user without duplicates", () => {
    addOwnedReport("user-1", "report-1");
    addOwnedReport("user-1", "report-1");
    addOwnedReport("user-2", "report-2");

    expect(isOwnedReport("user-1", "report-1")).toBe(true);
    expect(isOwnedReport("user-1", "report-2")).toBe(false);
    expect(isOwnedReport("user-2", "report-2")).toBe(true);
  });
});
