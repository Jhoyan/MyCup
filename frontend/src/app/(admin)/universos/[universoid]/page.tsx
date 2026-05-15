"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Users, Trophy, Plus, ChevronLeft, ChevronRight,
  User, Shirt, TrendingUp, MoreVertical, Pencil, Trash2,
  Globe,
} from "lucide-react";
import { mockUniversoDetail } from "@/lib/mocks/universos";
import type { UniverseDetail, UniversePlayerStats, ChampionshipSummary } from "@/lib/types";

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

// ── Page ──────────────────────────────────────────────────────────────────────

type Tab = "jogadores" | "campeonatos";

export default function UniversoPage() {
  const { universoid } = useParams<{ universoid: string }>();
  const [tab, setTab] = useState<Tab>("jogadores");

  // In production these would be fetched via API
  const universo: UniverseDetail = mockUniversoDetail;

  const stats = [
    { label: "Jogadores",   value: universo.players.length,                                                icon: Users      },
    { label: "Campeonatos", value: universo.championships.length,                                          icon: Trophy     },
    { label: "Ativos",      value: universo.championships.filter((c) => c.status === "em_andamento").length, icon: TrendingUp },
  ];

  return (
    <div className="space-y-6 max-w-[1280px]">

      {/* Back + Header */}
      <div>
        <Link
          href="/universos"
          className="inline-flex items-center gap-1 text-sm font-medium mb-4 transition-colors"
          style={{ color: "var(--mc-text-muted)" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--mc-primary)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--mc-text-muted)")}
        >
          <ChevronLeft size={15} /> Universos
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 min-w-0">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(0,91,170,0.1)" }}
            >
              <Globe size={26} style={{ color: "var(--mc-primary)" }} />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-extrabold" style={{ color: "var(--mc-text)" }}>
                {universo.name}
              </h1>
              {universo.description ? (
                <p className="text-sm mt-1 leading-relaxed" style={{ color: "var(--mc-text-muted)" }}>
                  {universo.description}
                </p>
              ) : (
                <p className="text-sm mt-0.5" style={{ color: "var(--mc-text-subtle)" }}>
                  Universo #{universoid}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={`/universos/${universoid}/jogadores/novo`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              style={{ border: "1px solid var(--mc-border)", color: "var(--mc-text)", background: "var(--mc-surface)" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--mc-bg)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--mc-surface)")}
            >
              <User size={14} /> Jogador
            </Link>
            <Link
              href={`/universos/${universoid}/campeonatos/novo`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors"
              style={{ background: "var(--mc-primary)" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--mc-primary-dark)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--mc-primary)")}
            >
              <Plus size={14} /> Campeonato
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="mc-card p-5 flex items-center gap-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "rgba(0,91,170,0.08)" }}
              >
                <Icon size={18} style={{ color: "var(--mc-primary)" }} />
              </div>
              <div>
                <p className="text-xl font-extrabold" style={{ color: "var(--mc-text)" }}>{s.value}</p>
                <p className="text-xs font-medium" style={{ color: "var(--mc-text-muted)" }}>{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "var(--mc-surface)", border: "1px solid var(--mc-border)" }}
      >
        <div className="flex" style={{ borderBottom: "1px solid var(--mc-border)" }}>
          {(["jogadores", "campeonatos"] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              aria-pressed={tab === t}
              className="flex items-center gap-2 px-6 py-4 text-sm font-semibold capitalize transition-colors cursor-pointer"
              style={{
                color: tab === t ? "var(--mc-primary)" : "var(--mc-text-muted)",
                borderBottom: tab === t ? "2px solid var(--mc-primary)" : "2px solid transparent",
                background: "transparent",
              }}
            >
              {t === "jogadores" ? <Users size={15} /> : <Trophy size={15} />}
              {t === "jogadores" ? "Jogadores" : "Campeonatos"}
              <span
                className="ml-1 px-1.5 py-0.5 rounded-full text-[0.65rem] font-bold"
                style={{
                  background: tab === t ? "rgba(0,91,170,0.1)" : "var(--mc-bg)",
                  color:      tab === t ? "var(--mc-primary)" : "var(--mc-text-muted)",
                }}
              >
                {t === "jogadores" ? universo.players.length : universo.championships.length}
              </span>
            </button>
          ))}
        </div>

        <div className="p-6">
          {tab === "jogadores" ? (
            <JogadoresTab players={universo.players} universoid={universoid} />
          ) : (
            <CampeonatosTab championships={universo.championships} />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Jogadores tab ─────────────────────────────────────────────────────────────

function JogadoresTab({
  players,
  universoid,
}: {
  players: UniversePlayerStats[];
  universoid: string;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: "var(--mc-text-muted)" }}>
          {players.length} jogadores cadastrados
        </p>
        <Link
          href={`/universos/${universoid}/jogadores/novo`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
          style={{ background: "rgba(0,91,170,0.08)", color: "var(--mc-primary)" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(0,91,170,0.15)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(0,91,170,0.08)")}
        >
          <Plus size={12} /> Adicionar
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl" style={{ border: "1px solid var(--mc-border)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "var(--mc-bg)" }}>
              <th className="text-left px-4 py-3 text-[0.72rem] font-bold uppercase tracking-wide" style={{ color: "var(--mc-text-muted)" }}>
                Jogador
              </th>
              <th className="text-center px-2 py-3 text-[0.72rem] font-bold uppercase tracking-wide" style={{ color: "var(--mc-text-muted)" }}>
                J
              </th>
              <th className="text-center px-2 py-3 text-[0.72rem] font-bold uppercase tracking-wide" style={{ color: "var(--mc-text-muted)" }}>
                V
              </th>
              <th className="text-center px-2 py-3 text-[0.72rem] font-bold uppercase tracking-wide" style={{ color: "var(--mc-text-muted)" }}>
                E
              </th>
              <th className="text-center px-2 py-3 text-[0.72rem] font-bold uppercase tracking-wide" style={{ color: "var(--mc-text-muted)" }}>
                D
              </th>
              <th className="text-center px-2 py-3 text-[0.72rem] font-bold uppercase tracking-wide" style={{ color: "var(--mc-text-muted)" }}>
                Gols
              </th>
              <th className="text-center px-2 py-3 text-[0.72rem] font-bold uppercase tracking-wide" style={{ color: "var(--mc-text-muted)" }}>
                Assist.
              </th>
              <th className="text-center px-2 py-3 text-[0.72rem] font-bold uppercase tracking-wide" style={{ color: "var(--mc-text-muted)" }}>
                Camp.
              </th>
              <th className="px-2 py-3 w-10" />
            </tr>
          </thead>
          <tbody>
            {players.map((p, i) => (
              <PlayerRow key={p.id} player={p} isFirst={i === 0} universoid={universoid} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PlayerRow({
  player,
  isFirst,
  universoid,
}: {
  player: UniversePlayerStats;
  isFirst: boolean;
  universoid: string;
}) {
  const winRate = player.matches > 0 ? Math.round((player.wins / player.matches) * 100) : 0;

  return (
    <tr
      style={{ borderTop: isFirst ? "none" : "1px solid var(--mc-border)" }}
      className="hover:bg-[var(--mc-bg)] transition-colors"
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
            style={{ background: "rgba(0,91,170,0.1)", color: "var(--mc-primary)" }}
          >
            {player.name[0]}
          </div>
          <div>
            <span className="font-semibold block" style={{ color: "var(--mc-text)" }}>
              {player.name}
            </span>
            <span className="text-[0.65rem]" style={{ color: "var(--mc-text-subtle)" }}>
              {winRate}% aproveitamento
            </span>
          </div>
        </div>
      </td>
      <td className="px-2 py-3 text-center text-sm" style={{ color: "var(--mc-text)" }}>
        {player.matches}
      </td>
      <td className="px-2 py-3 text-center text-sm font-bold" style={{ color: "var(--mc-accent)" }}>
        {player.wins}
      </td>
      <td className="px-2 py-3 text-center text-sm" style={{ color: "var(--mc-text-muted)" }}>
        {player.draws}
      </td>
      <td className="px-2 py-3 text-center text-sm font-bold" style={{ color: "var(--mc-danger)" }}>
        {player.losses}
      </td>
      <td className="px-2 py-3 text-center text-sm font-bold" style={{ color: "var(--mc-primary)" }}>
        {player.goals}
      </td>
      <td className="px-2 py-3 text-center text-sm" style={{ color: "var(--mc-text)" }}>
        {player.assists}
      </td>
      <td className="px-2 py-3 text-center text-sm" style={{ color: "var(--mc-text-muted)" }}>
        {player.championships}
      </td>
      <td className="px-2 py-3 text-right">
        <PlayerActionsMenu playerId={player.id} universoid={universoid} />
      </td>
    </tr>
  );
}

function PlayerActionsMenu({ playerId, universoid }: { playerId: number; universoid: string }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  return (
    <div className="relative inline-block" ref={menuRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-1.5 rounded-lg transition-colors"
        style={{ color: "var(--mc-text-muted)" }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--mc-bg)")}
        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
        aria-label="Opções do jogador"
      >
        <MoreVertical size={16} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1 z-10 w-44 rounded-lg overflow-hidden"
          style={{
            background: "var(--mc-surface)",
            border: "1px solid var(--mc-border)",
            boxShadow: "var(--mc-shadow-md)",
          }}
        >
          <Link
            href={`/universos/${universoid}/jogadores/${playerId}/editar`}
            className="flex items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-[var(--mc-bg)]"
            style={{ color: "var(--mc-text)" }}
            onClick={() => setOpen(false)}
          >
            <Pencil size={13} /> Editar
          </Link>
          <button
            onClick={() => {
              if (confirm("Excluir este jogador? Esta ação não pode ser desfeita.")) {
                // TODO: api.del(`/api/universes/${universoid}/players/${playerId}`)
                console.log("Excluir jogador", playerId);
              }
              setOpen(false);
            }}
            className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-[var(--mc-bg)]"
            style={{ color: "var(--mc-danger)" }}
          >
            <Trash2 size={13} /> Excluir
          </button>
        </div>
      )}
    </div>
  );
}

// ── Campeonatos tab ───────────────────────────────────────────────────────────

function CampeonatosTab({ championships }: { championships: ChampionshipSummary[] }) {
  if (championships.length === 0) {
    return (
      <div className="text-center py-12">
        <Trophy size={32} className="mx-auto mb-3" style={{ color: "var(--mc-text-subtle)" }} />
        <p className="text-sm" style={{ color: "var(--mc-text-muted)" }}>
          Nenhum campeonato criado neste universo
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {championships.map((c) => (
        <Link
          key={c.id}
          href={`/campeonatos/${c.id}`}
          className="flex items-center gap-4 p-4 rounded-xl transition-all group"
          style={{ border: "1px solid var(--mc-border)", background: "var(--mc-bg)" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--mc-surface)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--mc-bg)")}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(0,91,170,0.08)" }}
          >
            <Trophy size={18} style={{ color: "var(--mc-primary)" }} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <span className="font-bold text-sm truncate" style={{ color: "var(--mc-text)" }}>
                {c.name}
              </span>
              <StatusBadge status={c.status} />
            </div>
            <div className="flex items-center gap-3 text-xs flex-wrap" style={{ color: "var(--mc-text-muted)" }}>
              <span className="flex items-center gap-1">
                <Shirt size={11} /> {c.teams} times
              </span>
              <span>·</span>
              <span>{FORMAT_LABEL[c.format] ?? c.format}</span>
              {c.status === "em_andamento" && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <TrendingUp size={11} /> Rodada {c.currentRound}/{c.totalRounds}
                  </span>
                </>
              )}
            </div>
          </div>

          {c.status === "em_andamento" && c.totalRounds > 0 && (
            <div className="w-24 shrink-0">
              <div className="flex justify-between text-[0.65rem] mb-1" style={{ color: "var(--mc-text-muted)" }}>
                <span>Progresso</span>
                <span>{Math.round((c.currentRound / c.totalRounds) * 100)}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full" style={{ background: "var(--mc-border)" }}>
                <div
                  className="h-1.5 rounded-full"
                  style={{
                    width: `${(c.currentRound / c.totalRounds) * 100}%`,
                    background: "var(--mc-accent)",
                  }}
                />
              </div>
            </div>
          )}

          <ChevronRight size={16} style={{ color: "var(--mc-text-muted)", flexShrink: 0 }} />
        </Link>
      ))}
    </div>
  );
}
