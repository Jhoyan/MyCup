"use client";

import Link from "next/link";
import { Globe, Trophy, Users, ChevronRight, Plus } from "lucide-react";
import { mockUniversos } from "@/lib/mocks/universos";
import type { UniverseListItem } from "@/lib/types";

// ── Page ──────────────────────────────────────────────────────────────────────

export default function UniversosPage() {
  return (
    <div className="space-y-8 max-w-[1280px]">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: "var(--mc-text)" }}>
            Universos
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--mc-text-muted)" }}>
            Gerencie suas ligas e grupos
          </p>
        </div>
        <Link
          href="/universos/novo"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors"
          style={{ background: "var(--mc-primary)" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--mc-primary-dark)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--mc-primary)")}
        >
          <Plus size={15} />
          Novo universo
        </Link>
      </div>

      {/* Grid */}
      {mockUniversos.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {mockUniversos.map((u) => (
            <UniversoCard key={u.id} universo={u} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────

function UniversoCard({ universo }: { universo: UniverseListItem }) {
  return (
    <Link href={`/universos/${universo.id}`} className="mc-card block p-6 group">

      {/* Icon + nome */}
      <div className="flex items-start gap-4 mb-5">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "rgba(0,91,170,0.1)" }}
        >
          <Globe size={22} style={{ color: "var(--mc-primary)" }} />
        </div>
        <div className="min-w-0">
          <h2 className="font-bold text-base truncate" style={{ color: "var(--mc-text)" }}>
            {universo.name}
          </h2>
          {universo.activeChampionships > 0 ? (
            <span className="mc-badge mc-badge-andamento mt-1">
              {universo.activeChampionships} ativo{universo.activeChampionships > 1 ? "s" : ""}
            </span>
          ) : (
            <span className="mc-badge mc-badge-finalizada mt-1">Sem ativos</span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div
        className="grid grid-cols-2 gap-3 pt-4"
        style={{ borderTop: "1px solid var(--mc-border)" }}
      >
        <div className="flex items-center gap-2">
          <Users size={14} style={{ color: "var(--mc-text-muted)" }} />
          <span className="text-sm font-semibold" style={{ color: "var(--mc-text)" }}>
            {universo.players}
          </span>
          <span className="text-xs" style={{ color: "var(--mc-text-muted)" }}>jogadores</span>
        </div>
        <div className="flex items-center gap-2">
          <Trophy size={14} style={{ color: "var(--mc-text-muted)" }} />
          <span className="text-sm font-semibold" style={{ color: "var(--mc-text)" }}>
            {universo.championships}
          </span>
          <span className="text-xs" style={{ color: "var(--mc-text-muted)" }}>campeonatos</span>
        </div>
      </div>

      {/* Footer link */}
      <div
        className="flex items-center justify-end mt-4 pt-3 text-xs font-semibold gap-1 transition-colors group-hover:text-[var(--mc-primary)]"
        style={{ borderTop: "1px solid var(--mc-border)", color: "var(--mc-text-muted)" }}
      >
        Ver detalhes <ChevronRight size={13} />
      </div>
    </Link>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div
      className="flex flex-col items-center justify-center py-20 rounded-2xl"
      style={{ border: "2px dashed var(--mc-border)", background: "var(--mc-surface)" }}
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: "rgba(0,91,170,0.08)" }}
      >
        <Globe size={28} style={{ color: "var(--mc-primary)" }} />
      </div>
      <p className="font-bold text-base mb-1" style={{ color: "var(--mc-text)" }}>
        Nenhum universo criado
      </p>
      <p className="text-sm mb-6" style={{ color: "var(--mc-text-muted)" }}>
        Crie um universo para começar a organizar seus campeonatos
      </p>
      <Link
        href="/universos/novo"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white"
        style={{ background: "var(--mc-primary)" }}
      >
        <Plus size={15} />
        Criar primeiro universo
      </Link>
    </div>
  );
}
