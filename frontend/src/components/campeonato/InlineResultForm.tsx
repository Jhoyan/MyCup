"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, X, Loader2, ExternalLink } from "lucide-react";
import { api } from "@/lib/api";
import type { UpdateMatchResultRequest } from "@/lib/types";

// Formulário compacto de resultado, usado inline (lista de partidas e bracket).
// Salva sempre como "finished", só placar — sem pênaltis (use o editor completo para
// desempate de mata-mata). Mantém a edição visualmente limpa.
export default function InlineResultForm({
  matchId,
  initialHome,
  initialAway,
  onSaved,
  onCancel,
  fullEditorHref,
}: {
  matchId: number;
  initialHome: number | null;
  initialAway: number | null;
  onSaved: () => void;
  onCancel: () => void;
  fullEditorHref: string;
}) {
  const [home, setHome] = useState(initialHome ?? 0);
  const [away, setAway] = useState(initialAway ?? 0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    e.stopPropagation();
    setSaving(true);
    setError(false);
    try {
      const body: UpdateMatchResultRequest = {
        homeGoals: home,
        awayGoals: away,
        status: "finished",
      };
      await api.put(`/api/matches/${matchId}`, body);
      onSaved();
    } catch {
      setError(true);
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} onClick={(e) => e.stopPropagation()} className="inline-flex flex-wrap items-center justify-center gap-1">
      <Mini value={home} onChange={setHome} />
      <span className="text-xs font-bold" style={{ color: "var(--mc-text-subtle)" }}>×</span>
      <Mini value={away} onChange={setAway} />

      <button
        type="submit"
        disabled={saving}
        className="p-1 rounded transition-colors disabled:opacity-50"
        style={{ color: "var(--mc-accent)" }}
        aria-label="Salvar resultado"
      >
        {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
      </button>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onCancel(); }}
        className="p-1 rounded transition-colors"
        style={{ color: "var(--mc-text-muted)" }}
        aria-label="Cancelar"
      >
        <X size={14} />
      </button>
      <Link
        href={fullEditorHref}
        onClick={(e) => e.stopPropagation()}
        className="p-1 transition-colors"
        style={{ color: "var(--mc-text-muted)" }}
        title="Editor completo"
        aria-label="Editor completo"
      >
        <ExternalLink size={13} />
      </Link>

      {error && <span className="text-[0.6rem] w-full text-center" style={{ color: "var(--mc-danger)" }}>Erro ao salvar</span>}
    </form>
  );
}

function Mini({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <input
      type="number"
      min={0}
      value={value}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
      className="w-9 h-7 text-center text-sm font-bold rounded outline-none tabular-nums"
      style={{ background: "var(--mc-surface)", border: "1px solid var(--mc-border)", color: "var(--mc-text)" }}
    />
  );
}
