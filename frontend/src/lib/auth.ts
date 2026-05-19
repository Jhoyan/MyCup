import { api } from "./api";
import type { AuthResponse, RegisterRequest } from "./types";

// Estado de auth achatado guardado em localStorage.
// Mantemos os campos principais do AuthResponse + dados do usuário no nível de cima
// para facilitar o consumo nos componentes.
export type AuthUser = {
  token: string;
  refreshToken: string;
  expiraEm: string;
  userId: number;
  username: string;
};

function flatten(res: AuthResponse): AuthUser {
  return {
    token: res.token,
    refreshToken: res.refreshToken,
    expiraEm: res.expiraEm,
    userId: res.user.id,
    username: res.user.username,
  };
}

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
  const data = await api.post<AuthResponse>("/api/auth/login", { email, password }, false);
  const user = flatten(data);
  saveAuth(user);
  return user;
}

export async function register(body: RegisterRequest): Promise<AuthUser> {
  const data = await api.post<AuthResponse>("/api/auth/register", body, false);
  const user = flatten(data);
  saveAuth(user);
  return user;
}

export function isAuthenticated(): boolean {
  return getAuth() !== null;
}
