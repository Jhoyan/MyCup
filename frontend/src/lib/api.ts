const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5130";

const TOKEN_KEY = "easycup_token";
const USER_KEY = "easycup_user";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return (JSON.parse(raw) as { refreshToken?: string }).refreshToken ?? null;
  } catch {
    return null;
  }
}

// Persiste o par renovado mantendo o mesmo formato que auth.ts grava no login.
function persistAuth(data: { token: string; refreshToken: string; expiraEm: string; user: unknown }) {
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(data));
}

function clearAuthStorage() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// Garante um único refresh em voo: o backend rotaciona (invalida o refresh usado),
// então refreshes paralelos falhariam. Todas as chamadas que pegam 401 esperam o mesmo.
let refreshPromise: Promise<boolean> | null = null;

function refreshSession(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshToken = getRefreshToken();
      if (!refreshToken) return false;
      try {
        const res = await fetch(`${API_URL}/api/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
        if (!res.ok) return false;
        persistAuth(await res.json());
        return true;
      } catch {
        return false;
      }
    })();
    refreshPromise.finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean;
};

async function request<T>(path: string, options: RequestOptions = {}, retried = false): Promise<T> {
  const { method = "GET", body, auth = true } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // Access token (JWT) expira em poucos minutos. Num 401, tenta renovar uma vez
  // com o refresh token e repete a requisição original de forma transparente.
  if (res.status === 401 && auth && !retried) {
    const refreshed = await refreshSession();
    if (refreshed) return request<T>(path, options, true);

    // Refresh token também inválido/expirado → sessão encerrada de verdade.
    clearAuthStorage();
    if (typeof window !== "undefined" && window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message ?? "Erro na requisição");
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown, auth = true) => request<T>(path, { method: "POST", body, auth }),
  put: <T>(path: string, body: unknown) => request<T>(path, { method: "PUT", body }),
  del: (path: string) => request<void>(path, { method: "DELETE" }),
};
