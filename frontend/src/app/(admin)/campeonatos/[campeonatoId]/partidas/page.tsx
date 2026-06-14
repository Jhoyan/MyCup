"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ChevronLeft, ChevronRight, CalendarDays, CheckCircle2, Clock, Circle,
  Loader2, AlertCircle,
} from "lucide-react";
import { api } from "@/lib/api";
import type { ChampionshipDetail, RoundSummary, MatchSummary } from "@/lib/types";
import InlineResultForm from "@/components/campeonato/InlineResultForm";

function MatchStatusIcon({ status }: { status: string }) {
  if (status === "finished") return <CheckCircle2 size={13} style={{ color: "var(--mc-accent)" }} />;
  if (status === "ongoing")  return <Clock size={13} style={{ color: "var(--mc-warning)" }} />;
  return <Circle size={13} style={{ color: "var(--mc-text-muted)" }} />;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PartidasPage() {
  const { campeonatoId } = useParams<{ campeonatoId: string }>();
  const [c, setC] = useState<ChampionshipDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const data = await api.get<ChampionshipDetail>(`/api/championships/${campeonatoId}`);
    setC(data);
  }, [campeonatoId]);

  useEffect(() => {
    let active = true;
    reload().catch((e) => active && setError((e as Error).message));
    return () => {
      active = false;
    };
  }, [reload]);

  if (error) return <ErrorState message={error} />;
  if (!c) return <LoadingState />;

  const rounds = [...c.rounds].sort((a, b) => a.number - b.number);

  return (
    <div className="space-y-6 max-w-[900px]">

      {/* Back */}
      <Link
        href={`/campeonatos/${campeonatoId}`}
        className="inline-flex items-center gap-1 text-sm font-medium transition-colors"
        style={{ color: "var(--mc-text-muted)" }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--mc-primary)")}
        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--mc-text-muted)")}
      >
        <ChevronLeft size={15} /> {c.name}
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold flex items-center gap-2" style={{ color: "var(--mc-text)" }}>
          <CalendarDays size={22} style={{ color: "var(--mc-primary)" }} /> Lançar resultados
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--mc-text-muted)" }}>
          Selecione uma partida para registrar o placar
        </p>
      </div>

      {rounds.length === 0 ? (
        <div
          className="rounded-2xl p-8 text-center text-sm"
          style={{ border: "1px dashed var(--mc-border)", background: "var(--mc-surface)", color: "var(--mc-text-muted)" }}
        >
          Nenhuma partida gerada. Gere o chaveamento primeiro.
        </div>
      ) : (
        <div className="space-y-5">
          {rounds.map((round) => (
            <RoundBlock key={`${round.number}-${round.name ?? ""}`} round={round} campeonatoId={campeonatoId} onSaved={reload} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Round block ───────────────────────────────────────────────────────────────

function RoundBlock({ round, campeonatoId, onSaved }: { round: RoundSummary; campeonatoId: string; onSaved: () => void }) {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: "var(--mc-surface)", border: "1px solid var(--mc-border)" }}
    >
      <div
        className="px-4 py-2.5 text-xs font-bold uppercase tracking-wide"
        style={{ background: "var(--mc-bg)", color: "var(--mc-text-muted)", borderBottom: "1px solid var(--mc-border)" }}
      >
        {round.name ?? `Rodada ${round.number}`}
      </div>
      <div>
        {round.matches.map((m, i) => (
          <MatchRow key={m.id} match={m} isFirst={i === 0} campeonatoId={campeonatoId} onSaved={onSaved} />
        ))}
      </div>
    </div>
  );
}

function MatchRow({
  match,
  isFirst,
  campeonatoId,
  onSaved,
}: {
  match: MatchSummary;
  isFirst: boolean;
  campeonatoId: string;
  onSaved: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const finished = match.status === "finished";
  const undefinedSlot = !match.homeTeam || !match.awayTeam;
  const fullHref = `/campeonatos/${campeonatoId}/partidas/${match.id}`;

  return (
    <div
      className="flex items-center gap-3 px-4 py-3"
      style={{ borderTop: isFirst ? "none" : "1px solid var(--mc-border)" }}
    >
      <MatchStatusIcon status={match.status} />

      <span className="flex-1 text-sm font-semibold text-right truncate" style={{ color: "var(--mc-text)" }}>
        {match.homeTeam ?? <span style={{ color: "var(--mc-text-subtle)", fontStyle: "italic" }}>A definir</span>}
      </span>

      {/* Placar: clique abre edição rápida inline */}
      <div className="shrink-0 flex justify-center min-w-[64px]">
        {editing ? (
          <InlineResultForm
            matchId={match.id}
            initialHome={match.homeGoals}
            initialAway={match.awayGoals}
            onSaved={() => { setEditing(false); onSaved(); }}
            onCancel={() => setEditing(false)}
            fullEditorHref={fullHref}
          />
        ) : (
          <button
            type="button"
            onClick={() => !undefinedSlot && setEditing(true)}
            disabled={undefinedSlot}
            title={undefinedSlot ? undefined : "Clique para lançar o resultado"}
            className="flex items-center gap-1 px-2.5 py-1 rounded min-w-[64px] justify-center transition-colors disabled:cursor-default"
            style={{
              background: finished ? "var(--mc-text)" : "var(--mc-bg)",
              color: finished ? "#fff" : "var(--mc-text-muted)",
              cursor: undefinedSlot ? "default" : "pointer",
            }}
          >
            <span className="text-sm font-extrabold tabular-nums">
              {finished ? (
                <>{match.homeGoals} <span className="opacity-50">×</span> {match.awayGoals}</>
              ) : (
                <>— <span className="opacity-50">×</span> —</>
              )}
            </span>
          </button>
        )}
      </div>

      <span className="flex-1 text-sm font-semibold truncate" style={{ color: "var(--mc-text)" }}>
        {match.awayTeam ?? <span style={{ color: "var(--mc-text-subtle)", fontStyle: "italic" }}>A definir</span>}
      </span>

      {/* Atalho para o editor completo */}
      <Link
        href={fullHref}
        className="p-1 rounded-md transition-colors hover:bg-[var(--mc-bg)] shrink-0"
        style={{ color: "var(--mc-text-muted)" }}
        title="Abrir editor completo"
        aria-label="Editor completo"
      >
        <ChevronRight size={16} />
      </Link>
    </div>
  );
}

// ── Loading / Error states ────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 className="animate-spin mb-3" size={28} style={{ color: "var(--mc-primary)" }} />
      <p className="text-sm" style={{ color: "var(--mc-text-muted)" }}>Carregando partidas...</p>
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
