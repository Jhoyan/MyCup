"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ChevronLeft, ChevronRight, Trophy, Globe, Shirt, TrendingUp,
  CalendarDays, BarChart2, Network, ChartColumn,
  CheckCircle2, Clock, Circle,
} from "lucide-react";
import {
  getMockCampeonatoDetail,
  mockCampeonatoStatistics,
  mockCampeonatoBracket,
} from "@/lib/mocks/campeonatos";
import type {
  ChampionshipDetail, StandingsRow, RoundSummary, MatchSummary,
} from "@/lib/types";
import BracketView from "@/components/campeonato/BracketView";
import StatisticsView from "@/components/campeonato/StatisticsView";

// ── Helpers ───────────────────────────────────────────────────────────────────

const FORMAT_LABEL: Record<string, string> = {
  pontos_corridos:   "Pontos Corridos",
  mata_mata:         "Mata-mata",
  grupos_mata_mata:  "Grupos + Mata-mata",
};

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  em_andamento: { label: "Em andamento", cls: "mc-badge mc-badge-andamento"  },
  agendada:     { label: "Agendado",     cls: "mc-badge mc-badge-agendada"   },
  finalizada:   { label: "Finalizado",   cls: "mc-badge mc-badge-finalizada" },
};

function StatusBadge({ status }: { status: string }) {
  const item = STATUS_LABEL[status] ?? { label: status, cls: "mc-badge mc-badge-agendada" };
  return <span className={item.cls}>{item.label}</span>;
}

function MatchStatusIcon({ status }: { status: string }) {
  if (status === "finalizada")   return <CheckCircle2 size={13} style={{ color: "var(--mc-accent)" }} />;
  if (status === "em_andamento") return <Clock size={13} style={{ color: "var(--mc-warning)" }} />;
  return <Circle size={13} style={{ color: "var(--mc-text-muted)" }} />;
}

// Nomes de rodadas que pertencem à fase eliminatória (bracket)
const ELIMINATION_ROUND_NAMES = new Set([
  "Oitavas", "Quartas", "Semi", "Semifinal", "Final",
]);

function isEliminationRound(round: RoundSummary): boolean {
  return !!round.name && ELIMINATION_ROUND_NAMES.has(round.name);
}

// ── Page ──────────────────────────────────────────────────────────────────────

type Tab = "classificacao" | "eliminatorias" | "estatisticas";

export default function CampeonatoPage() {
  const { campeonatoId } = useParams<{ campeonatoId: string }>();
  const [tab, setTab] = useState<Tab>("classificacao");

  const c: ChampionshipDetail = getMockCampeonatoDetail(campeonatoId);
  const hasBracket = c.format === "mata_mata" || c.format === "grupos_mata_mata";
  const progresso = c.totalRounds > 0 ? Math.round((c.currentRound / c.totalRounds) * 100) : 0;

  const tabs: { value: Tab; label: string; icon: React.ElementType; show: boolean }[] = [
    { value: "classificacao",  label: "Classificação",  icon: BarChart2,    show: true       },
    { value: "eliminatorias",  label: "Eliminatórias",   icon: Network,      show: hasBracket },
    { value: "estatisticas",   label: "Estatísticas",    icon: ChartColumn,  show: true       },
  ];

  // Se o campeonato mudou para um formato sem bracket, voltar para classificação
  useEffect(() => {
    if (tab === "eliminatorias" && !hasBracket) setTab("classificacao");
  }, [tab, hasBracket]);

  return (
    <div className="space-y-6 max-w-[1280px]">

      {/* Back */}
      <Link
        href="/campeonatos"
        className="inline-flex items-center gap-1 text-sm font-medium transition-colors"
        style={{ color: "var(--mc-text-muted)" }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--mc-primary)")}
        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--mc-text-muted)")}
      >
        <ChevronLeft size={15} /> Campeonatos
      </Link>

      {/* Header card */}
      <div
        className="rounded-2xl p-6"
        style={{ background: "var(--mc-surface)", border: "1px solid var(--mc-border)" }}
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(0,91,170,0.1)" }}
            >
              <Trophy size={26} style={{ color: "var(--mc-primary)" }} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h1 className="text-xl font-extrabold" style={{ color: "var(--mc-text)" }}>
                  {c.name}
                </h1>
                <StatusBadge status={c.status} />
              </div>
              <div className="flex items-center gap-3 text-xs flex-wrap" style={{ color: "var(--mc-text-muted)" }}>
                <span className="flex items-center gap-1"><Globe size={11} />
                  <Link href={`/universos/${c.universe.id}`} className="hover:underline">{c.universe.name}</Link>
                </span>
                <span>·</span>
                <span className="flex items-center gap-1"><Shirt size={11} />{c.teams.length} times</span>
                <span>·</span>
                <span className="font-semibold" style={{ color: "var(--mc-primary)" }}>
                  {FORMAT_LABEL[c.format] ?? c.format}
                </span>
              </div>
            </div>
          </div>

          <Link
            href={`/campeonatos/${campeonatoId}/partidas`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors shrink-0"
            style={{ background: "var(--mc-primary)" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--mc-primary-dark)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--mc-primary)")}
          >
            <CalendarDays size={14} /> Lançar resultado
          </Link>
        </div>

        {/* Progress bar */}
        {c.status === "em_andamento" && (
          <div className="mt-5">
            <div className="flex justify-between text-xs mb-2" style={{ color: "var(--mc-text-muted)" }}>
              <span className="flex items-center gap-1.5">
                <TrendingUp size={12} /> Rodada {c.currentRound} de {c.totalRounds}
              </span>
              <span className="font-semibold">{progresso}% concluído</span>
            </div>
            <div className="w-full h-2 rounded-full" style={{ background: "var(--mc-bg)" }}>
              <div
                className="h-2 rounded-full transition-all"
                style={{ width: `${progresso}%`, background: "var(--mc-accent)" }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "var(--mc-surface)", border: "1px solid var(--mc-border)" }}
      >
        <div className="flex" style={{ borderBottom: "1px solid var(--mc-border)" }}>
          {tabs.filter((t) => t.show).map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => setTab(t.value)}
                aria-pressed={tab === t.value}
                className="flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-colors cursor-pointer"
                style={{
                  color: tab === t.value ? "var(--mc-primary)" : "var(--mc-text-muted)",
                  borderBottom: tab === t.value ? "2px solid var(--mc-primary)" : "2px solid transparent",
                  background: "transparent",
                }}
              >
                <Icon size={15} /> {t.label}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {tab === "classificacao" && (
            <ClassificacaoTab
              standings={c.standings}
              rounds={c.rounds}
              format={c.format}
              campeonatoId={campeonatoId}
            />
          )}
          {tab === "eliminatorias" && <BracketView bracket={mockCampeonatoBracket} />}
          {tab === "estatisticas"  && <StatisticsView stats={mockCampeonatoStatistics} />}
        </div>
      </div>
    </div>
  );
}

// ── Classificação tab (split: tabela + rodadas) ───────────────────────────────

function ClassificacaoTab({
  standings,
  rounds,
  format,
  campeonatoId,
}: {
  standings: StandingsRow[];
  rounds: RoundSummary[];
  format: string;
  campeonatoId: string;
}) {
  // Coluna direita só aparece para pontos corridos ou na fase de grupos.
  // Para mata-mata puro, as partidas vivem na aba "Eliminatórias".
  const hideRightColumn = format === "mata_mata";

  // Em grupos+mata-mata, filtrar apenas as rodadas da fase de grupos.
  const visibleRounds =
    format === "grupos_mata_mata"
      ? rounds.filter((r) => !isEliminationRound(r))
      : rounds;

  return (
    <div
      className={hideRightColumn ? "" : "grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6"}
    >
      {/* Esquerda: classificação */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: "var(--mc-text)" }}>
          <BarChart2 size={14} style={{ color: "var(--mc-primary)" }} />
          {format === "pontos_corridos" ? "Classificação geral" : "Classificação"}
        </h3>
        <StandingsTable standings={standings} />
      </div>

      {/* Direita: navegador de rodadas (apenas pontos corridos / fase de grupos) */}
      {!hideRightColumn && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: "var(--mc-text)" }}>
            <CalendarDays size={14} style={{ color: "var(--mc-primary)" }} />
            Partidas por rodada
          </h3>
          <RoundNavigator rounds={visibleRounds} campeonatoId={campeonatoId} />
        </div>
      )}
    </div>
  );
}

function StandingsTable({ standings }: { standings: StandingsRow[] }) {
  return (
    <div className="overflow-hidden rounded-xl" style={{ border: "1px solid var(--mc-border)" }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: "var(--mc-bg)" }}>
            {["#", "Time", "J", "V", "E", "D", "GP", "GC", "SG", "PTS"].map((h) => (
              <th
                key={h}
                className={`py-3 text-[0.72rem] font-bold uppercase tracking-wide ${h === "Time" ? "text-left px-4" : "text-center px-2"}`}
                style={{ color: "var(--mc-text-muted)" }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {standings.map((row) => {
            const zonaColor =
              row.position <= 2 ? "var(--mc-accent)" :
              row.position >= standings.length - 1 ? "var(--mc-danger)" : undefined;

            return (
              <tr
                key={row.team}
                className="transition-colors hover:bg-[var(--mc-bg)]"
                style={{ borderTop: "1px solid var(--mc-border)" }}
              >
                <td className="py-3 px-3 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    {zonaColor && (
                      <span className="w-1 h-5 rounded-full shrink-0" style={{ background: zonaColor }} />
                    )}
                    <span className="font-bold text-sm" style={{ color: "var(--mc-text)" }}>{row.position}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[0.7rem] font-bold shrink-0"
                      style={{ background: "rgba(0,91,170,0.1)", color: "var(--mc-primary)" }}
                    >
                      {row.team[0]}
                    </div>
                    <span className="font-semibold" style={{ color: "var(--mc-text)" }}>{row.team}</span>
                  </div>
                </td>
                <td className="py-3 px-2 text-center text-sm" style={{ color: "var(--mc-text-muted)" }}>{row.played}</td>
                <td className="py-3 px-2 text-center text-sm" style={{ color: "var(--mc-text-muted)" }}>{row.wins}</td>
                <td className="py-3 px-2 text-center text-sm" style={{ color: "var(--mc-text-muted)" }}>{row.draws}</td>
                <td className="py-3 px-2 text-center text-sm" style={{ color: "var(--mc-text-muted)" }}>{row.losses}</td>
                <td className="py-3 px-2 text-center text-sm" style={{ color: "var(--mc-text-muted)" }}>{row.goalsFor}</td>
                <td className="py-3 px-2 text-center text-sm" style={{ color: "var(--mc-text-muted)" }}>{row.goalsAgainst}</td>
                <td className="py-3 px-2 text-center text-sm" style={{ color: "var(--mc-text-muted)" }}>
                  {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                </td>
                <td className="py-3 px-2 text-center">
                  <span className="text-sm font-extrabold" style={{ color: "var(--mc-text)" }}>{row.points}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Legenda */}
      <div
        className="flex items-center gap-5 px-4 py-3 text-xs"
        style={{ borderTop: "1px solid var(--mc-border)", color: "var(--mc-text-muted)" }}
      >
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ background: "var(--mc-accent)" }} /> Classificação
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ background: "var(--mc-danger)" }} /> Rebaixamento
        </span>
      </div>
    </div>
  );
}

// ── Navegador de rodadas (coluna direita) ─────────────────────────────────────

function RoundNavigator({
  rounds,
  campeonatoId,
}: {
  rounds: RoundSummary[];
  campeonatoId: string;
}) {
  // Garantir ordem ascendente para que ← (anterior) leve a rodadas anteriores no tempo
  const sorted = useMemo(
    () => [...rounds].sort((a, b) => a.number - b.number),
    [rounds]
  );

  // Índice inicial: rodada em andamento, senão a última (mais recente)
  const initialIndex = useMemo(() => {
    if (!sorted.length) return 0;
    const inProgress = sorted.findIndex((r) => r.status === "em_andamento");
    return inProgress >= 0 ? inProgress : sorted.length - 1;
  }, [sorted]);

  const [index, setIndex] = useState(initialIndex);

  // Manter o índice válido caso a lista mude
  useEffect(() => {
    setIndex((i) => Math.min(i, Math.max(0, sorted.length - 1)));
  }, [sorted.length]);

  if (!sorted.length) {
    return (
      <div
        className="rounded-xl p-6 text-center text-sm"
        style={{ border: "1px solid var(--mc-border)", color: "var(--mc-text-muted)" }}
      >
        Nenhuma rodada ainda
      </div>
    );
  }

  const rodada = sorted[index];
  const hasPrev = index > 0;
  const hasNext = index < sorted.length - 1;

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: "1px solid var(--mc-border)" }}
    >
      {/* Header com navegação */}
      <div
        className="flex items-center justify-between gap-2 px-2.5 py-2"
        style={{ background: "var(--mc-bg)", borderBottom: "1px solid var(--mc-border)" }}
      >
        <button
          type="button"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={!hasPrev}
          className="p-1 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          style={{ color: "var(--mc-text-muted)" }}
          onMouseEnter={(e) => {
            if (hasPrev) (e.currentTarget as HTMLElement).style.background = "var(--mc-border)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
          }}
          aria-label="Rodada anterior"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="flex-1 flex flex-col items-center min-w-0">
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <span className="text-xs font-bold" style={{ color: "var(--mc-text)" }}>
              {rodada.name ?? `Rodada ${rodada.number}`}
            </span>
            <StatusBadge status={rodada.status} />
          </div>
          <span className="text-[0.65rem] font-medium mt-0.5" style={{ color: "var(--mc-text-muted)" }}>
            {rodada.matches.length} partida{rodada.matches.length === 1 ? "" : "s"}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIndex((i) => Math.min(sorted.length - 1, i + 1))}
          disabled={!hasNext}
          className="p-1 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          style={{ color: "var(--mc-text-muted)" }}
          onMouseEnter={(e) => {
            if (hasNext) (e.currentTarget as HTMLElement).style.background = "var(--mc-border)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
          }}
          aria-label="Próxima rodada"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Partidas da rodada selecionada */}
      <div>
        {rodada.matches.map((m, i) => (
          <MatchRow
            key={m.id}
            match={m}
            isFirst={i === 0}
            campeonatoId={campeonatoId}
          />
        ))}
      </div>

      {/* Indicador de posição (dots) */}
      {sorted.length > 1 && (
        <div
          className="flex items-center justify-center gap-1 py-2"
          style={{ borderTop: "1px solid var(--mc-border)", background: "var(--mc-bg)" }}
        >
          {sorted.map((r, i) => (
            <button
              key={r.number}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Ir para rodada ${r.number}`}
              className="cursor-pointer rounded-full transition-all"
              style={{
                width: i === index ? 16 : 6,
                height: 6,
                background: i === index ? "var(--mc-primary)" : "var(--mc-border)",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MatchRow({
  match,
  isFirst,
  campeonatoId,
}: {
  match: MatchSummary;
  isFirst: boolean;
  campeonatoId: string;
}) {
  const finalizada = match.status === "finalizada";
  const homeWon = finalizada && (match.homeGoals ?? 0) > (match.awayGoals ?? 0);
  const awayWon = finalizada && (match.awayGoals ?? 0) > (match.homeGoals ?? 0);

  return (
    <Link
      href={`/campeonatos/${campeonatoId}/partidas/${match.id}`}
      className="flex items-center gap-2 px-3 py-2.5 transition-colors hover:bg-[var(--mc-bg)]"
      style={{ borderTop: isFirst ? "none" : "1px solid var(--mc-border)" }}
    >
      <MatchStatusIcon status={match.status} />

      <span
        className="flex-1 text-xs font-semibold text-right truncate"
        style={{ color: homeWon ? "var(--mc-text)" : "var(--mc-text-muted)" }}
      >
        {match.homeTeam}
      </span>

      <div
        className="flex items-center gap-1 px-2 py-0.5 rounded shrink-0 min-w-[60px] justify-center"
        style={{
          background: finalizada ? "var(--mc-text)" : "var(--mc-bg)",
          color: finalizada ? "#fff" : "var(--mc-text-muted)",
        }}
      >
        <span className="text-xs font-extrabold tabular-nums">
          {finalizada ? (
            <>{match.homeGoals} <span className="opacity-50">×</span> {match.awayGoals}</>
          ) : (
            <>— <span className="opacity-50">×</span> —</>
          )}
        </span>
      </div>

      <span
        className="flex-1 text-xs font-semibold truncate"
        style={{ color: awayWon ? "var(--mc-text)" : "var(--mc-text-muted)" }}
      >
        {match.awayTeam}
      </span>
    </Link>
  );
}
