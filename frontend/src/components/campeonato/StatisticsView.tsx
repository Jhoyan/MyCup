"use client";

import {
  Target, Crosshair, Zap, Flame, BarChart3, Shield, ShieldAlert, Trophy,
} from "lucide-react";
import type { ChampionshipStatistics } from "@/lib/types";

export default function StatisticsView({ stats }: { stats: ChampionshipStatistics }) {
  return (
    <div className="space-y-6">

      {/* Highlight cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <HighlightCard
          icon={Target}
          color="var(--mc-primary)"
          label="Artilheiro"
          name={stats.topScorer.name}
          subtitle={stats.topScorer.team}
          value={stats.topScorer.goals}
          unit="gols"
        />
        <HighlightCard
          icon={Crosshair}
          color="#8b5cf6"
          label="Mais assistências"
          name={stats.mostAssists.name}
          subtitle={stats.mostAssists.team}
          value={stats.mostAssists.assists}
          unit="assist."
        />
        <HighlightCard
          icon={Trophy}
          color="var(--mc-accent)"
          label="Mais vitórias"
          name={stats.mostWins.name}
          subtitle="Time"
          value={stats.mostWins.wins}
          unit="vit."
        />
        <HighlightCard
          icon={BarChart3}
          color="var(--mc-warning)"
          label="Gols por partida"
          name={stats.goalsPerMatch.toFixed(1)}
          subtitle="média"
          value={null}
          unit=""
        />
      </div>

      {/* Match highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <MatchHighlightCard
          icon={Flame}
          color="var(--mc-danger)"
          label="Goleada do campeonato"
        >
          <div className="flex items-center justify-center gap-3">
            <span className="text-sm font-semibold truncate flex-1 text-right" style={{ color: "var(--mc-text)" }}>
              {stats.biggestWin.homeTeam}
            </span>
            <span
              className="text-lg font-extrabold tabular-nums px-3 py-1 rounded-lg"
              style={{ background: "var(--mc-text)", color: "#fff" }}
            >
              {stats.biggestWin.homeGoals} <span className="opacity-50">×</span> {stats.biggestWin.awayGoals}
            </span>
            <span className="text-sm font-semibold truncate flex-1" style={{ color: "var(--mc-text-muted)" }}>
              {stats.biggestWin.awayTeam}
            </span>
          </div>
        </MatchHighlightCard>

        <MatchHighlightCard
          icon={Zap}
          color="var(--mc-warning)"
          label="Maior virada"
        >
          <p className="text-sm font-semibold text-center" style={{ color: "var(--mc-text)" }}>
            {stats.biggestComeback.description}
          </p>
        </MatchHighlightCard>
      </div>

      {/* Gols sofridos por partida */}
      <div
        className="rounded-xl p-5"
        style={{ background: "var(--mc-surface)", border: "1px solid var(--mc-border)" }}
      >
        <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: "var(--mc-text)" }}>
          <Shield size={14} style={{ color: "var(--mc-primary)" }} />
          Gols sofridos por partida
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <DefenseRow
            icon={Shield}
            color="var(--mc-accent)"
            label="Melhor defesa"
            team={stats.goalsConcededPerMatch.best.name}
            average={stats.goalsConcededPerMatch.best.average}
          />
          <DefenseRow
            icon={ShieldAlert}
            color="var(--mc-danger)"
            label="Pior defesa"
            team={stats.goalsConcededPerMatch.worst.name}
            average={stats.goalsConcededPerMatch.worst.average}
          />
        </div>

        <p className="text-[0.7rem] mt-3" style={{ color: "var(--mc-text-subtle)" }}>
          Calculado como média (gols sofridos ÷ partidas jogadas) para evitar distorção de times eliminados cedo.
        </p>
      </div>

      {/* Top artilheiros */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: "var(--mc-surface)", border: "1px solid var(--mc-border)" }}
      >
        <h3
          className="text-sm font-bold p-5 flex items-center gap-2"
          style={{ color: "var(--mc-text)", borderBottom: "1px solid var(--mc-border)" }}
        >
          <Target size={14} style={{ color: "var(--mc-primary)" }} />
          Top artilheiros
        </h3>

        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "var(--mc-bg)" }}>
              <th className="text-left px-4 py-2.5 text-[0.7rem] font-bold uppercase tracking-wide w-12" style={{ color: "var(--mc-text-muted)" }}>#</th>
              <th className="text-left px-4 py-2.5 text-[0.7rem] font-bold uppercase tracking-wide" style={{ color: "var(--mc-text-muted)" }}>Jogador</th>
              <th className="text-left px-4 py-2.5 text-[0.7rem] font-bold uppercase tracking-wide" style={{ color: "var(--mc-text-muted)" }}>Time</th>
              <th className="text-center px-4 py-2.5 text-[0.7rem] font-bold uppercase tracking-wide" style={{ color: "var(--mc-text-muted)" }}>Gols</th>
            </tr>
          </thead>
          <tbody>
            {stats.topScorers.map((p, i) => (
              <tr
                key={p.playerId}
                style={{ borderTop: "1px solid var(--mc-border)" }}
                className="hover:bg-[var(--mc-bg)] transition-colors"
              >
                <td className="px-4 py-2.5">
                  <span
                    className="inline-flex items-center justify-center w-6 h-6 rounded-full text-[0.65rem] font-bold"
                    style={{
                      background: i === 0 ? "var(--mc-primary)" : "var(--mc-bg)",
                      color: i === 0 ? "#fff" : "var(--mc-text-muted)",
                    }}
                  >
                    {i + 1}
                  </span>
                </td>
                <td className="px-4 py-2.5 font-semibold" style={{ color: "var(--mc-text)" }}>
                  {p.name}
                </td>
                <td className="px-4 py-2.5" style={{ color: "var(--mc-text-muted)" }}>
                  {p.team}
                </td>
                <td className="px-4 py-2.5 text-center font-extrabold" style={{ color: "var(--mc-primary)" }}>
                  {p.goals}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Sub-componentes ──────────────────────────────────────────────────────────

function HighlightCard({
  icon: Icon, color, label, name, subtitle, value, unit,
}: {
  icon: React.ElementType;
  color: string;
  label: string;
  name: string;
  subtitle: string;
  value: number | null;
  unit: string;
}) {
  return (
    <div className="mc-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: `${color}14` }}
        >
          <Icon size={14} style={{ color }} />
        </div>
        <span className="text-[0.7rem] font-bold uppercase tracking-wide" style={{ color: "var(--mc-text-muted)" }}>
          {label}
        </span>
      </div>
      <p className="text-base font-bold truncate" style={{ color: "var(--mc-text)" }}>
        {name}
      </p>
      <div className="flex items-baseline gap-1.5 mt-0.5">
        <span className="text-xs" style={{ color: "var(--mc-text-muted)" }}>
          {subtitle}
        </span>
        {value !== null && (
          <span className="ml-auto text-xl font-extrabold tabular-nums" style={{ color }}>
            {value}
            <span className="text-[0.65rem] font-medium ml-0.5" style={{ color: "var(--mc-text-muted)" }}>
              {unit}
            </span>
          </span>
        )}
      </div>
    </div>
  );
}

function MatchHighlightCard({
  icon: Icon, color, label, children,
}: {
  icon: React.ElementType;
  color: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-xl p-5"
      style={{ background: "var(--mc-surface)", border: "1px solid var(--mc-border)" }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Icon size={14} style={{ color }} />
        <span className="text-[0.7rem] font-bold uppercase tracking-wide" style={{ color: "var(--mc-text-muted)" }}>
          {label}
        </span>
      </div>
      {children}
    </div>
  );
}

function DefenseRow({
  icon: Icon, color, label, team, average,
}: {
  icon: React.ElementType;
  color: string;
  label: string;
  team: string;
  average: number;
}) {
  return (
    <div
      className="flex items-center gap-3 p-3 rounded-lg"
      style={{ background: "var(--mc-bg)" }}
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: `${color}14` }}
      >
        <Icon size={16} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[0.65rem] font-bold uppercase tracking-wide" style={{ color: "var(--mc-text-muted)" }}>
          {label}
        </p>
        <p className="text-sm font-bold truncate" style={{ color: "var(--mc-text)" }}>
          {team}
        </p>
      </div>
      <div className="text-right">
        <p className="text-lg font-extrabold tabular-nums" style={{ color }}>
          {average.toFixed(2)}
        </p>
        <p className="text-[0.6rem] font-medium" style={{ color: "var(--mc-text-muted)" }}>
          gols/jogo
        </p>
      </div>
    </div>
  );
}
