import { api } from "./api";
import type { AuthResponse } from "./types";

export type AuthUser = AuthResponse;

export function saveAuth(user: AuthUser) {
  localStorage.setItem("easycup_token", user.token);
  localStorage.setItem("easycup_user", JSON.stringify(user));
}

export function getAuth(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("easycup_user");
  return raw ? (JSON.parse(raw) as AuthUser) : null;
}

export function clearAuth() {
  localStorage.removeItem("easycup_token");
  localStorage.removeItem("easycup_user");
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const data = await api.post<AuthUser>("/api/auth/login", { email, password }, false);
  saveAuth(data);
  return data;
}

export async function register(name: string, email: string, password: string): Promise<AuthUser> {
  const data = await api.post<AuthUser>("/api/auth/register", { name, email, password }, false);
  saveAuth(data);
  return data;
}

export function isAuthenticated(): boolean {
  return getAuth() !== null;
}