"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, Users, Plus, Trash2, Loader2, AlertCircle, Shield } from "lucide-react";
import { api } from "@/lib/api";
import type { UniverseMember, UniverseRole } from "@/lib/types";

const ROLES: { value: UniverseRole; label: string }[] = [
  { value: "owner", label: "Dono" },
  { value: "admin", label: "Admin" },
  { value: "moderator", label: "Moderador" },
];

const ROLE_LABEL: Record<UniverseRole, string> = {
  owner: "Dono",
  admin: "Admin",
  moderator: "Moderador",
};

export default function MembrosPage() {
  const { universoid } = useParams<{ universoid: string }>();

  const [members, setMembers] = useState<UniverseMember[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Form de adicionar
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UniverseRole>("admin");

  const load = useCallback(async () => {
    const data = await api.get<UniverseMember[]>(`/api/universes/${universoid}/members`);
    setMembers(data);
  }, [universoid]);

  useEffect(() => {
    let active = true;
    load().catch((e) => active && setError((e as Error).message));
    return () => {
      active = false;
    };
  }, [load]);

  async function run(action: () => Promise<unknown>) {
    setBusy(true);
    setActionError(null);
    try {
      await action();
      await load();
    } catch (e) {
      setActionError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function addMember() {
    const value = email.trim();
    if (!value) return;
    run(async () => {
      await api.post(`/api/universes/${universoid}/members`, { email: value, role });
      setEmail("");
    });
  }

  if (error) return <ErrorState message={error} />;
  if (!members) return <LoadingState />;

  return (
    <div className="max-w-2xl space-y-6">

      {/* Back */}
      <Link
        href={`/universos/${universoid}`}
        className="inline-flex items-center gap-1 text-sm font-medium transition-colors"
        style={{ color: "var(--mc-text-muted)" }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--mc-primary)")}
        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--mc-text-muted)")}
      >
        <ChevronLeft size={15} /> Voltar ao universo
      </Link>

      <div>
        <h1 className="text-2xl font-extrabold flex items-center gap-2" style={{ color: "var(--mc-text)" }}>
          <Users size={22} style={{ color: "var(--mc-primary)" }} /> Membros
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--mc-text-muted)" }}>
          Quem co-gerencia este universo e com qual papel
        </p>
      </div>

      {actionError && (
        <div
          className="rounded-lg px-4 py-3 text-sm flex items-start gap-2"
          style={{ background: "rgba(220,38,38,0.08)", border: "1px solid var(--mc-danger)", color: "var(--mc-danger)" }}
        >
          <AlertCircle size={16} className="mt-0.5 shrink-0" /> {actionError}
        </div>
      )}

      {/* Adicionar membro */}
      <div
        className="rounded-2xl p-5 space-y-3"
        style={{ background: "var(--mc-surface)", border: "1px solid var(--mc-border)" }}
      >
        <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: "var(--mc-text)" }}>
          <Plus size={15} style={{ color: "var(--mc-primary)" }} /> Adicionar membro
        </h2>
        <p className="text-xs" style={{ color: "var(--mc-text-muted)" }}>
          O usuário já precisa ter conta. Informe o e-mail de cadastro.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@exemplo.com"
            disabled={busy}
            className="flex-1 text-sm rounded-lg px-3 py-2 outline-none"
            style={{ background: "var(--mc-bg)", border: "1px solid var(--mc-border)", color: "var(--mc-text)" }}
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UniverseRole)}
            disabled={busy}
            className="text-sm rounded-lg px-3 py-2 outline-none"
            style={{ background: "var(--mc-bg)", border: "1px solid var(--mc-border)", color: "var(--mc-text)" }}
          >
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={addMember}
            disabled={busy || !email.trim()}
            className="inline-flex items-center justify-center gap-1 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-50"
            style={{ background: "var(--mc-primary)" }}
          >
            <Plus size={14} /> Adicionar
          </button>
        </div>
      </div>

      {/* Lista de membros */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "var(--mc-surface)", border: "1px solid var(--mc-border)" }}
      >
        {members.length === 0 ? (
          <p className="text-sm p-5" style={{ color: "var(--mc-text-muted)" }}>Nenhum membro ainda.</p>
        ) : (
          members.map((m, i) => (
            <div
              key={m.userId}
              className="flex items-center gap-3 px-4 py-3"
              style={{ borderTop: i === 0 ? "none" : "1px solid var(--mc-border)" }}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                style={{ background: "rgba(0,91,170,0.1)", color: "var(--mc-primary)" }}
              >
                {m.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: "var(--mc-text)" }}>{m.name}</p>
                <p className="text-xs truncate" style={{ color: "var(--mc-text-muted)" }}>{m.email}</p>
              </div>
              <select
                value={m.role}
                onChange={(e) => run(() => api.put(`/api/universes/${universoid}/members/${m.userId}`, { role: e.target.value }))}
                disabled={busy}
                className="text-xs font-semibold rounded-md px-2 py-1.5 outline-none"
                style={{ background: "var(--mc-bg)", border: "1px solid var(--mc-border)", color: "var(--mc-text)" }}
                aria-label={`Papel de ${m.name}`}
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => run(() => api.del(`/api/universes/${universoid}/members/${m.userId}`))}
                disabled={busy}
                className="p-1.5 rounded-md transition-colors disabled:opacity-40"
                style={{ color: "var(--mc-danger)" }}
                title={`Remover ${m.name}`}
                aria-label={`Remover ${m.name}`}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))
        )}
      </div>

      <p className="text-xs flex items-center gap-1.5" style={{ color: "var(--mc-text-subtle)" }}>
        <Shield size={12} />
        {ROLE_LABEL.owner} gerencia tudo (e só ele concede/remove outro {ROLE_LABEL.owner}); {ROLE_LABEL.admin} gere conteúdo e membros; {ROLE_LABEL.moderator} só lança resultados.
      </p>
    </div>
  );
}

// ── Loading / Error states ────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 className="animate-spin mb-3" size={28} style={{ color: "var(--mc-primary)" }} />
      <p className="text-sm" style={{ color: "var(--mc-text-muted)" }}>Carregando membros...</p>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center py-20 rounded-2xl text-center"
      style={{ border: "1px solid var(--mc-border)", background: "var(--mc-surface)" }}
    >
      <AlertCircle size={28} className="mb-3" style={{ color: "var(--mc-danger)" }} />
      <p className="font-bold text-base mb-1" style={{ color: "var(--mc-text)" }}>
        Não foi possível carregar
      </p>
      <p className="text-sm" style={{ color: "var(--mc-text-muted)" }}>{message}</p>
    </div>
  );
}
