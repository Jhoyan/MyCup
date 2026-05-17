"use client";

import { CheckCircle2, Clock, Circle, Trophy } from "lucide-react";
import type { Bracket, BracketMatch } from "@/lib/types";

// Visualização de chaveamento (mata-mata). Scroll horizontal entre fases.

export default function BracketView({
  bracket,
  onMatchClick,
}: {
  bracket: Bracket;
  onMatchClick?: (matchId: number) => void;
}) {
  if (!bracket.rounds.length) {
    return (
      <div className="text-center py-16">
        <Trophy size={32} className="mx-auto mb-3" style={{ color: "var(--mc-text-subtle)" }} />
        <p className="text-sm" style={{ color: "var(--mc-text-muted)" }}>
          Chaveamento ainda não foi gerado
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex gap-8 min-w-max items-stretch">
        {bracket.rounds.map((round, roundIndex) => {
          const matchesInRound = round.matches.length;
          // Espaçamento vertical aumenta a cada fase para alinhar visualmente
          const spacing = Math.pow(2, roundIndex);

          return (
            <div key={round.name} className="flex flex-col">
              {/* Round title */}
              <div className="mb-3 flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--mc-text-muted)" }}>
                  {round.name}
                </span>
                <span
                  className="text-[0.65rem] px-1.5 py-0.5 rounded-full font-semibold"
                  style={{ background: "var(--mc-bg)", color: "var(--mc-text-muted)" }}
                >
                  {matchesInRound}
                </span>
              </div>

              {/* Matches stack */}
              <div className="flex flex-col justify-around flex-1 gap-3">
                {round.matches.map((match) => (
                  <div
                    key={match.id}
                    style={{
                      marginTop: roundIndex > 0 ? `${(spacing - 1) * 22}px` : 0,
                      marginBottom: roundIndex > 0 ? `${(spacing - 1) * 22}px` : 0,
                    }}
                  >
                    <BracketMatchCard match={match} onClick={onMatchClick} />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BracketMatchCard({
  match,
  onClick,
}: {
  match: BracketMatch;
  onClick?: (matchId: number) => void;
}) {
  const finalizada = match.status === "finalizada";
  const emAndamento = match.status === "em_andamento";

  return (
    <button
      onClick={() => onClick?.(match.id)}
      className="w-56 rounded-lg overflow-hidden text-left transition-all hover:shadow-md"
      style={{
        background: "var(--mc-surface)",
        border: `1px solid ${emAndamento ? "var(--mc-warning)" : "var(--mc-border)"}`,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-1.5 px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-wider"
        style={{
          background: emAndamento ? "rgba(244,178,19,0.1)" : "var(--mc-bg)",
          color: emAndamento ? "#b78200" : "var(--mc-text-muted)",
          borderBottom: "1px solid var(--mc-border)",
        }}
      >
        {finalizada && <CheckCircle2 size={11} style={{ color: "var(--mc-accent)" }} />}
        {emAndamento && <Clock size={11} />}
        {!finalizada && !emAndamento && <Circle size={11} />}
        <span>
          {finalizada ? "Finalizada" : emAndamento ? "Ao vivo" : "Agendada"}
        </span>
        <span className="ml-auto opacity-50">#{match.id}</span>
      </div>

      {/* Teams */}
      <BracketTeamRow team={match.homeTeam} winnerId={match.winnerId} />
      <div style={{ borderTop: "1px solid var(--mc-border)" }} />
      <BracketTeamRow team={match.awayTeam} winnerId={match.winnerId} />
    </button>
  );
}

function BracketTeamRow({
  team,
  winnerId,
}: {
  team: BracketMatch["homeTeam"];
  winnerId: number | null;
}) {
  if (!team) {
    return (
      <div className="flex items-center px-3 py-2 gap-2">
        <span className="text-sm italic flex-1 truncate" style={{ color: "var(--mc-text-subtle)" }}>
          A definir
        </span>
        <span className="text-sm font-bold tabular-nums" style={{ color: "var(--mc-text-subtle)" }}>
          —
        </span>
      </div>
    );
  }

  const isWinner = winnerId === team.id;

  return (
    <div
      className="flex items-center px-3 py-2 gap-2"
      style={{
        background: isWinner ? "rgba(0,179,65,0.06)" : "transparent",
      }}
    >
      <div
        className="w-5 h-5 rounded-full flex items-center justify-center text-[0.6rem] font-bold shrink-0"
        style={{
          background: isWinner ? "var(--mc-accent)" : "rgba(0,91,170,0.1)",
          color: isWinner ? "#fff" : "var(--mc-primary)",
        }}
      >
        {team.name[0]}
      </div>
      <span
        className="text-sm flex-1 truncate"
        style={{
          color: isWinner ? "var(--mc-text)" : "var(--mc-text-muted)",
          fontWeight: isWinner ? 700 : 500,
        }}
      >
        {team.name}
      </span>
      <span
        className="text-sm font-extrabold tabular-nums"
        style={{
          color: isWinner ? "var(--mc-accent)" : "var(--mc-text)",
        }}
      >
        {team.goals ?? "—"}
      </span>
    </div>
  );
}
