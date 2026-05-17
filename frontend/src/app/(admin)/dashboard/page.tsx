"use client";

import Link from "next/link";
import {
  Globe, Trophy, CalendarDays, Activity,
  TrendingUp, Target, TrendingDown, Medal,
  ChevronRight, Plus, Shirt,
} from "lucide-react";
import {
  mockDashboardSummary,
  mockRecentResults,
  mockRecentChampionships,
  mockTopPlayers,
} from "@/lib/mocks/dashboard";
import type {
  RecentResult,
  ChampionshipSummary,
  TopWinsPlayer,
  TopGoalsPlayer,
  TopLossesPlayer,
} from "@/lib/types";

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

// ── Ticker ────────────────────────────────────────────────────────────────────

function ResultTicker({ results }: { results: RecentResult[] }) {
  // Duplicar a lista para criar loop visual contínuo
  const loop = [...results, ...results];

  return (
    <div
      className="overflow-hidden rounded-2xl"
      style={{
        background: "var(--mc-sidebar-bg)",
        border: "1px solid var(--mc-border)",
      }}
    >
      <div className="flex items-center">
        {/* Label fixo à esquerda */}
        <div
          className="shrink-0 flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider"
          style={{
            color: "#60a5fa",
            background: "rgba(0,91,170,0.15)",
            borderRight: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <Activity size={14} />
          Últimos resultados
        </div>

        {/* Marquee */}
        <div className="flex-1 overflow-hidden py-2.5">
          <div className="mc-marquee gap-8">
            {loop.map((r, i) => (
              <TickerItem key={`${r.id}-${i}`} result={r} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TickerItem({ result }: { result: RecentResult }) {
  const homeWon = result.homeGoals > result.awayGoals;
  const awayWon = result.awayGoals > result.homeGoals;

  return (
    <div className="flex items-center gap-3 px-2 shrink-0 text-sm">
      <span
        className="text-[0.65rem] font-bold uppercase tracking-wide shrink-0"
        style={{ color: "#94a3b8" }}
      >
        {result.championship}
      </span>
      <span
        className="font-semibold shrink-0"
        style={{ color: homeWon ? "#fff" : "#94a3b8" }}
      >
        {result.homeTeam}
      </span>
      <span
        className="font-extrabold tabular-nums shrink-0 px-2 py-0.5 rounded"
        style={{ background: "rgba(255,255,255,0.08)", color: "#fff" }}
      >
        {result.homeGoals} <span className="opacity-50">×</span> {result.awayGoals}
      </span>
      <span
        className="font-semibold shrink-0"
        style={{ color: awayWon ? "#fff" : "#94a3b8" }}
      >
        {result.awayTeam}
      </span>
      <span className="shrink-0" style={{ color: "#475569" }}>·</span>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const stats = [
    { label: "Universos",         value: mockDashboardSummary.totalUniverses,       icon: Globe,        color: "#005baa" },
    { label: "Camp. pendentes",   value: mockDashboardSummary.pendingChampionships, icon: Trophy,       color: "#00b341" },
    { label: "Jogadores ativos",  value: mockDashboardSummary.activePlayers,        icon: Shirt,        color: "#8b5cf6" },
    { label: "Partidas pendentes", value: mockDashboardSummary.pendingMatches,       icon: CalendarDays, color: "#f4b213" },
  ];

  return (
    <div className="space-y-8 max-w-[1280px]">

      {/* Ticker no topo */}
      <ResultTicker results={mockRecentResults} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: "var(--mc-text)" }}>
            Dashboard
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--mc-text-muted)" }}>
            Visão geral dos seus campeonatos
          </p>
        </div>
        <Link
          href="/campeonatos/novo"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors"
          style={{ background: "var(--mc-primary)" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--mc-primary-dark)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--mc-primary)")}
        >
          <Plus size={15} />
          Novo campeonato
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="mc-card p-5 flex items-center gap-4">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${stat.color}14` }}
              >
                <Icon size={20} style={{ color: stat.color }} strokeWidth={2} />
              </div>
              <div>
                <p className="text-2xl font-extrabold" style={{ color: "var(--mc-text)" }}>
                  {stat.value}
                </p>
                <p className="text-xs font-medium" style={{ color: "var(--mc-text-muted)" }}>
                  {stat.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">

        {/* Campeonatos atualizados recentemente */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold flex items-center gap-2" style={{ color: "var(--mc-text)" }}>
              <TrendingUp size={16} style={{ color: "var(--mc-primary)" }} />
              Atualizados recentemente
            </h2>
            <Link
              href="/campeonatos"
              className="text-sm font-medium flex items-center gap-1"
              style={{ color: "var(--mc-primary)" }}
            >
              Ver todos <ChevronRight size={14} />
            </Link>
          </div>

          <div className="space-y-3">
            {mockRecentChampionships.map((c) => (
              <ChampionshipCard key={c.id} championship={c} />
            ))}
          </div>
        </div>

        {/* Top Jogadores (30 dias) */}
        <TopPlayersCard data={mockTopPlayers} />
      </div>
    </div>
  );
}

// ── Championship card ─────────────────────────────────────────────────────────

function ChampionshipCard({ championship: c }: { championship: ChampionshipSummary }) {
  const progress = c.totalRounds > 0 ? (c.currentRound / c.totalRounds) * 100 : 0;

  return (
    <Link href={`/campeonatos/${c.id}`} className="mc-card block p-5 group">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <StatusBadge status={c.status} />
            <span
              className="inline-flex items-center px-2 py-0.5 rounded text-[0.7rem] font-semibold"
              style={{ background: "rgba(0,91,170,0.08)", color: "#005baa" }}
            >
              {FORMAT_LABEL[c.format] ?? c.format}
            </span>
          </div>
          <h3 className="font-bold text-base" style={{ color: "var(--mc-text)" }}>
            {c.name}
          </h3>
          <p className="text-xs mt-0.5 flex items-center gap-1.5" style={{ color: "var(--mc-text-muted)" }}>
            <Shirt size={11} />
            {c.teams} times
          </p>
        </div>

        {c.totalRounds > 0 && (
          <div className="text-right shrink-0">
            <p className="text-[0.65rem] font-medium uppercase tracking-wide" style={{ color: "var(--mc-text-muted)" }}>
              Rodada
            </p>
            <p className="text-lg font-extrabold" style={{ color: "var(--mc-text)" }}>
              {c.currentRound}
              <span className="text-sm font-normal" style={{ color: "var(--mc-text-muted)" }}>
                /{c.totalRounds}
              </span>
            </p>
          </div>
        )}
      </div>

      {c.status === "em_andamento" && c.totalRounds > 0 && (
        <div className="w-full h-1.5 rounded-full" style={{ background: "var(--mc-border)" }}>
          <div
            className="h-1.5 rounded-full transition-all"
            style={{
              width: `${progress}%`,
              background: "var(--mc-accent)",
            }}
          />
        </div>
      )}
    </Link>
  );
}

// ── Top players card ──────────────────────────────────────────────────────────

function TopPlayersCard({
  data,
}: {
  data: { mostWins: TopWinsPlayer[]; mostGoals: TopGoalsPlayer[]; mostLosses: TopLossesPlayer[] };
}) {
  return (
    <div
      className="rounded-xl p-5 self-start"
      style={{ background: "var(--mc-surface)", border: "1px solid var(--mc-border)" }}
    >
      <h2
        className="text-sm font-bold mb-4 pb-3 flex items-center gap-2"
        style={{ color: "var(--mc-text)", borderBottom: "1px solid var(--mc-border)" }}
      >
        <Medal size={14} style={{ color: "var(--mc-warning)" }} />
        Top jogadores
        <span
          className="ml-auto text-[0.65rem] font-medium px-2 py-0.5 rounded-full"
          style={{ background: "var(--mc-bg)", color: "var(--mc-text-muted)" }}
        >
          últimos 30 dias
        </span>
      </h2>

      <PlayerSection
        title="Mais vitórias"
        icon={TrendingUp}
        color="var(--mc-accent)"
        items={data.mostWins.slice(0, 3).map((p) => ({
          id: p.playerId, name: p.name, value: p.wins, suffix: "V",
        }))}
      />

      <PlayerSection
        title="Mais gols"
        icon={Target}
        color="var(--mc-primary)"
        items={data.mostGoals.slice(0, 3).map((p) => ({
          id: p.playerId, name: p.name, value: p.goals, suffix: "G",
        }))}
      />

      <PlayerSection
        title="Mais derrotas"
        icon={TrendingDown}
        color="var(--mc-danger)"
        items={data.mostLosses.slice(0, 3).map((p) => ({
          id: p.playerId, name: p.name, value: p.losses, suffix: "D",
        }))}
        isLast
      />
    </div>
  );
}

function PlayerSection({
  title, icon: Icon, color, items, isLast = false,
}: {
  title: string;
  icon: React.ElementType;
  color: string;
  items: { id: number; name: string; value: number; suffix: string }[];
  isLast?: boolean;
}) {
  return (
    <div
      className={isLast ? "pt-3" : "pt-3 pb-4 mb-2"}
      style={!isLast ? { borderBottom: "1px solid var(--mc-border)" } : undefined}
    >
      <div className="flex items-center gap-1.5 mb-2.5">
        <Icon size={13} style={{ color }} />
        <span className="text-[0.7rem] font-bold uppercase tracking-wide" style={{ color: "var(--mc-text-muted)" }}>
          {title}
        </span>
      </div>
      <ul className="space-y-1.5">
        {items.map((p, i) => (
          <li key={p.id} className="flex items-center gap-2.5">
            <span
              className="w-5 h-5 rounded-full flex items-center justify-center text-[0.65rem] font-bold shrink-0"
              style={{
                background: i === 0 ? color : "var(--mc-bg)",
                color: i === 0 ? "#fff" : "var(--mc-text-muted)",
              }}
            >
              {i + 1}
            </span>
            <span className="text-sm font-medium flex-1 truncate" style={{ color: "var(--mc-text)" }}>
              {p.name}
            </span>
            <span className="text-sm font-extrabold tabular-nums" style={{ color }}>
              {p.value}
              <span className="text-[0.65rem] font-medium ml-0.5" style={{ color: "var(--mc-text-muted)" }}>
                {p.suffix}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
