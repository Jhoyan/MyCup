"use client";

import { useCallback, useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Users, Trophy, Plus, ChevronLeft,
  Shirt, TrendingUp, Pencil, Trash2,
  Globe, Loader2, AlertCircle, Search,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { UniverseDetail, UniversePlayerStats, ChampionshipSummary, TeamSummary } from "@/lib/types";
import PlayerFormModal from "@/components/admin/PlayerFormModal";
import ChampionshipFormModal from "@/components/admin/ChampionshipFormModal";
import TeamFormModal from "@/components/admin/TeamFormModal";

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

type Tab = "jogadores" | "campeonatos" | "times";

export default function UniversoPage() {
  const { universoid } = useParams<{ universoid: string }>();
  const [tab, setTab] = useState<Tab>("jogadores");
  const [universo, setUniverso] = useState<UniverseDetail | null>(null);
  const [teams, setTeams] = useState<TeamSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [newPlayerOpen, setNewPlayerOpen] = useState(false);
  const [newChampOpen, setNewChampOpen] = useState(false);

  const load = useCallback(() => {
    if (!universoid) return;
    api
      .get<UniverseDetail>(`/api/universes/${universoid}`)
      .then(setUniverso)
      .catch((e) => setError((e as Error).message));
  }, [universoid]);

  // Times não vêm no detalhe do universo: busca separada (também alimenta o badge da aba).
  const loadTeams = useCallback(() => {
    if (!universoid) return;
    api
      .get<TeamSummary[]>(`/api/teams?universeId=${universoid}`)
      .then(setTeams)
      .catch((e) => setError((e as Error).message));
  }, [universoid]);

  useEffect(() => { load(); loadTeams(); }, [load, loadTeams]);

  // Remove o jogador da lista local após exclusão (evita refetch).
  function handlePlayerDeleted(playerId: number) {
    setUniverso((u) => (u ? { ...u, players: u.players.filter((p) => p.id !== playerId) } : u));
  }

  if (error) {
    return <DetailState icon={AlertCircle} tone="danger" title="Não foi possível carregar" subtitle={error} />;
  }
  if (!universo) {
    return <DetailState icon={Loader2} tone="loading" title="Carregando universo..." />;
  }

  const stats = [
    { label: "Jogadores",   value: universo.players.length,                                                icon: Users      },
    { label: "Campeonatos", value: universo.championships.length,                                          icon: Trophy     },
    { label: "Ativos",      value: universo.championships.filter((c) => c.status === "em_andamento").length, icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">

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
              href={`/universos/${universoid}/membros`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              style={{ border: "1px solid var(--mc-border)", color: "var(--mc-text)", background: "var(--mc-surface)" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--mc-bg)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--mc-surface)")}
            >
              <Users size={14} /> Membros
            </Link>
            <button
              type="button"
              onClick={() => setNewPlayerOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
              style={{ border: "1px solid var(--mc-border)", color: "var(--mc-text)", background: "var(--mc-surface)" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--mc-bg)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--mc-surface)")}
            >
              <Plus size={14} /> Jogador
            </button>
            <button
              type="button"
              onClick={() => setNewChampOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors cursor-pointer"
              style={{ background: "var(--mc-primary)" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--mc-primary-dark)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--mc-primary)")}
            >
              <Plus size={14} /> Campeonato
            </button>
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
          {([
            { id: "jogadores",   label: "Jogadores",   icon: Users,  count: universo.players.length },
            { id: "campeonatos", label: "Campeonatos", icon: Trophy, count: universo.championships.length },
            { id: "times",       label: "Times",       icon: Shirt,  count: teams.length },
          ] as { id: Tab; label: string; icon: React.ElementType; count: number }[]).map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                aria-pressed={active}
                className="flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-colors cursor-pointer"
                style={{
                  color: active ? "var(--mc-primary)" : "var(--mc-text-muted)",
                  borderBottom: active ? "2px solid var(--mc-primary)" : "2px solid transparent",
                  background: "transparent",
                }}
              >
                <Icon size={15} />
                {t.label}
                <span
                  className="ml-1 px-1.5 py-0.5 rounded-full text-[0.65rem] font-bold"
                  style={{
                    background: active ? "rgba(0,91,170,0.1)" : "var(--mc-bg)",
                    color:      active ? "var(--mc-primary)" : "var(--mc-text-muted)",
                  }}
                >
                  {t.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {tab === "jogadores" && (
            <JogadoresTab
              players={universo.players}
              universoid={universoid}
              onPlayerDeleted={handlePlayerDeleted}
              onNewPlayer={() => setNewPlayerOpen(true)}
              onChanged={load}
            />
          )}
          {tab === "campeonatos" && <CampeonatosTab championships={universo.championships} onChanged={load} />}
          {tab === "times" && (
            <TimesTab teams={teams} universoid={universoid} onChanged={loadTeams} />
          )}
        </div>
      </div>

      <PlayerFormModal
        open={newPlayerOpen}
        onOpenChange={setNewPlayerOpen}
        universeId={Number(universoid)}
        onSaved={load}
      />

      <ChampionshipFormModal open={newChampOpen} onOpenChange={setNewChampOpen} />
    </div>
  );
}

// ── Jogadores tab ─────────────────────────────────────────────────────────────

function JogadoresTab({
  players,
  universoid,
  onPlayerDeleted,
  onNewPlayer,
  onChanged,
}: {
  players: UniversePlayerStats[];
  universoid: string;
  onPlayerDeleted: (playerId: number) => void;
  onNewPlayer: () => void;
  onChanged: () => void;
}) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const filtered = q ? players.filter((p) => p.name.toLowerCase().includes(q)) : players;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: "var(--mc-text-muted)" }}>
          {players.length} jogadores cadastrados
        </p>
        <button
          type="button"
          onClick={onNewPlayer}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          style={{ background: "rgba(0,91,170,0.08)", color: "var(--mc-primary)" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(0,91,170,0.15)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(0,91,170,0.08)")}
        >
          <Plus size={12} /> Adicionar
        </button>
      </div>

      <SearchBar value={query} onChange={setQuery} placeholder="Buscar jogador..." />

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
                Camp.
              </th>
              <th className="px-2 py-3 w-10" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-sm" style={{ color: "var(--mc-text-muted)" }}>
                  Nenhum jogador encontrado para “{query.trim()}”
                </td>
              </tr>
            ) : (
              filtered.map((p, i) => (
                <PlayerRow key={p.id} player={p} isFirst={i === 0} universoid={universoid} onDeleted={onPlayerDeleted} onChanged={onChanged} />
              ))
            )}
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
  onDeleted,
  onChanged,
}: {
  player: UniversePlayerStats;
  isFirst: boolean;
  universoid: string;
  onDeleted: (playerId: number) => void;
  onChanged: () => void;
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
      <td className="px-2 py-3 text-center text-sm" style={{ color: "var(--mc-text-muted)" }}>
        {player.championships}
      </td>
      <td className="px-2 py-3 text-right">
        <PlayerActionsMenu player={player} universoid={universoid} onDeleted={onDeleted} onChanged={onChanged} />
      </td>
    </tr>
  );
}

function PlayerActionsMenu({
  player,
  universoid,
  onDeleted,
  onChanged,
}: {
  player: UniversePlayerStats;
  universoid: string;
  onDeleted: (playerId: number) => void;
  onChanged: () => void;
}) {
  const [editOpen, setEditOpen] = useState(false);

  async function handleDelete() {
    if (!confirm("Excluir este jogador? Esta ação não pode ser desfeita.")) return;
    try {
      await api.del(`/api/players/${player.id}`);
      toast.success("Jogador excluído");
      onDeleted(player.id);
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <div className="inline-flex items-center gap-1">
      <button
        type="button"
        onClick={() => setEditOpen(true)}
        className="p-1.5 rounded-lg transition-colors"
        style={{ color: "var(--mc-text-muted)" }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--mc-surface)")}
        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
        aria-label="Editar jogador"
      >
        <Pencil size={14} />
      </button>
      <button
        type="button"
        onClick={handleDelete}
        className="p-1.5 rounded-lg transition-colors"
        style={{ color: "var(--mc-danger)" }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--mc-surface)")}
        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
        aria-label="Excluir jogador"
      >
        <Trash2 size={14} />
      </button>

      <PlayerFormModal
        open={editOpen}
        onOpenChange={setEditOpen}
        universeId={Number(universoid)}
        player={{ id: player.id, name: player.name }}
        onSaved={onChanged}
      />
    </div>
  );
}

// ── Shared search bar ─────────────────────────────────────────────────────────

function SearchBar({
  value, onChange, placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative">
      <Search
        size={15}
        className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: "var(--mc-text-muted)" }}
      />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full text-sm rounded-lg pl-9 pr-3 py-2.5 outline-none transition-all"
        style={{ background: "var(--mc-bg)", border: "1px solid var(--mc-border)", color: "var(--mc-text)" }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "var(--mc-primary)";
          e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,91,170,0.1)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "var(--mc-border)";
          e.currentTarget.style.boxShadow = "none";
        }}
      />
    </div>
  );
}

// ── Times tab ─────────────────────────────────────────────────────────────────

function TimesTab({
  teams,
  universoid,
  onChanged,
}: {
  teams: TeamSummary[];
  universoid: string;
  onChanged: () => void;
}) {
  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editTeam, setEditTeam] = useState<TeamSummary | null>(null);

  const q = query.trim().toLowerCase();
  const filtered = q ? teams.filter((t) => t.name.toLowerCase().includes(q)) : teams;

  async function handleDelete(team: TeamSummary) {
    if (!confirm(`Excluir o time "${team.name}"? Esta ação não pode ser desfeita.`)) return;
    try {
      await api.del(`/api/teams/${team.id}`);
      toast.success("Time excluído");
      onChanged();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm" style={{ color: "var(--mc-text-muted)" }}>
          {teams.length} times cadastrados
        </p>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          style={{ background: "rgba(0,91,170,0.08)", color: "var(--mc-primary)" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(0,91,170,0.15)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(0,91,170,0.08)")}
        >
          <Plus size={12} /> Adicionar
        </button>
      </div>

      <SearchBar value={query} onChange={setQuery} placeholder="Buscar time..." />

      {/* Lista */}
      {teams.length === 0 ? (
        <div className="text-center py-12">
          <Shirt size={32} className="mx-auto mb-3" style={{ color: "var(--mc-text-subtle)" }} />
          <p className="text-sm" style={{ color: "var(--mc-text-muted)" }}>
            Nenhum time cadastrado neste universo
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm py-6 text-center" style={{ color: "var(--mc-text-muted)" }}>
          Nenhum time encontrado para “{query.trim()}”
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl" style={{ border: "1px solid var(--mc-border)" }}>
          {filtered.map((t, i) => (
            <div
              key={t.id}
              className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--mc-bg)] transition-colors"
              style={{ borderTop: i === 0 ? "none" : "1px solid var(--mc-border)" }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "rgba(0,91,170,0.1)", color: "var(--mc-primary)" }}
              >
                <Shirt size={14} />
              </div>
              <span className="flex-1 text-sm font-semibold truncate" style={{ color: "var(--mc-text)" }}>
                {t.name}
              </span>
              <button
                type="button"
                onClick={() => setEditTeam(t)}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: "var(--mc-text-muted)" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--mc-surface)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                aria-label="Editar time"
              >
                <Pencil size={14} />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(t)}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: "var(--mc-danger)" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--mc-surface)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                aria-label="Excluir time"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <TeamFormModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        universeId={Number(universoid)}
        onSaved={onChanged}
      />
      <TeamFormModal
        open={editTeam !== null}
        onOpenChange={(o) => { if (!o) setEditTeam(null); }}
        universeId={Number(universoid)}
        team={editTeam ?? undefined}
        onSaved={onChanged}
      />
    </div>
  );
}

// ── Campeonatos tab ───────────────────────────────────────────────────────────

function CampeonatosTab({
  championships,
  onChanged,
}: {
  championships: ChampionshipSummary[];
  onChanged: () => void;
}) {
  const [query, setQuery] = useState("");

  async function handleDelete(c: ChampionshipSummary) {
    if (!confirm(`Excluir o campeonato "${c.name}"? Esta ação não pode ser desfeita.`)) return;
    try {
      await api.del(`/api/championships/${c.id}`);
      toast.success("Campeonato excluído");
      onChanged();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

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

  const q = query.trim().toLowerCase();
  const filtered = q ? championships.filter((c) => c.name.toLowerCase().includes(q)) : championships;

  return (
    <div className="space-y-3">
      <SearchBar value={query} onChange={setQuery} placeholder="Buscar campeonato..." />

      {filtered.length === 0 ? (
        <p className="text-sm py-6 text-center" style={{ color: "var(--mc-text-muted)" }}>
          Nenhum campeonato encontrado para “{query.trim()}”
        </p>
      ) : (
        filtered.map((c) => (
          <div
            key={c.id}
            className="flex items-center gap-4 p-4 rounded-xl transition-all hover:bg-[var(--mc-surface)]"
            style={{ border: "1px solid var(--mc-border)", background: "var(--mc-bg)" }}
          >
            <Link href={`/campeonatos/${c.id}`} className="flex items-center gap-4 flex-1 min-w-0">
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
            </Link>

            <div className="flex items-center gap-1 shrink-0">
              <Link
                href={`/campeonatos/${c.id}/configurar`}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: "var(--mc-text-muted)" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--mc-bg)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                aria-label="Editar campeonato"
                title="Editar (configurar)"
              >
                <Pencil size={14} />
              </Link>
              <button
                type="button"
                onClick={() => handleDelete(c)}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: "var(--mc-danger)" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--mc-bg)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                aria-label="Excluir campeonato"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ── Loading / Error state (full page) ─────────────────────────────────────────

function DetailState({
  icon: Icon, tone, title, subtitle,
}: {
  icon: React.ElementType;
  tone: "loading" | "danger";
  title: string;
  subtitle?: string;
}) {
  return (
    <div>
      <Link
        href="/universos"
        className="inline-flex items-center gap-1 text-sm font-medium mb-8 transition-colors"
        style={{ color: "var(--mc-text-muted)" }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--mc-primary)")}
        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--mc-text-muted)")}
      >
        <ChevronLeft size={15} /> Universos
      </Link>
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Icon
          className={tone === "loading" ? "animate-spin" : ""}
          size={28}
          style={{ color: tone === "danger" ? "var(--mc-danger)" : "var(--mc-primary)" }}
        />
        <p className="font-bold text-base mt-3 mb-1" style={{ color: "var(--mc-text)" }}>{title}</p>
        {subtitle && <p className="text-sm" style={{ color: "var(--mc-text-muted)" }}>{subtitle}</p>}
      </div>
    </div>
  );
}
