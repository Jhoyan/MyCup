"use client";

import { useState } from "react";
import Link from "next/link";
import { Trophy, Globe, Shirt, TrendingUp, CalendarDays, ChevronRight, Plus, Search } from "lucide-react";
import { mockCampeonatosLista, type CampeonatoListItem } from "@/lib/mocks/campeonatos";

// ── Helpers ───────────────────────────────────────────────────────────────────

const FORMAT_LABEL: Record<string, string> = {
  pontos_corridos:   "Pontos Corridos",
  mata_mata:         "Mata-mata",
  grupos_mata_mata:  "Grupos + Mata-mata",
};

const STATUS_FILTERS = [
  { value: "todos",        label: "Todos"        },
  { value: "em_andamento", label: "Em andamento" },
  { value: "agendada",     label: "Agendados"    },
  { value: "finalizada",   label: "Finalizados"  },
] as const;

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    em_andamento: { label: "Em andamento", cls: "mc-badge mc-badge-andamento"  },
    agendada:     { label: "Agendado",     cls: "mc-badge mc-badge-agendada"   },
    finalizada:   { label: "Finalizado",   cls: "mc-badge mc-badge-finalizada" },
  };
  const item = map[status] ?? { label: status, cls: "mc-badge mc-badge-agendada" };
  return <span className={item.cls}>{item.label}</span>;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CampeonatosPage() {
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [busca, setBusca] = useState("");

  const filtrados = mockCampeonatosLista.filter((c) => {
    const matchStatus = filtroStatus === "todos" || c.status === filtroStatus;
    const term = busca.toLowerCase();
    const matchBusca = c.name.toLowerCase().includes(term) || c.universe.name.toLowerCase().includes(term);
    return matchStatus && matchBusca;
  });

  const counts = {
    todos:        mockCampeonatosLista.length,
    em_andamento: mockCampeonatosLista.filter((c) => c.status === "em_andamento").length,
    agendada:     mockCampeonatosLista.filter((c) => c.status === "agendada").length,
    finalizada:   mockCampeonatosLista.filter((c) => c.status === "finalizada").length,
  };

  return (
    <div className="space-y-6 max-w-[1280px]">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: "var(--mc-text)" }}>
            Campeonatos
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--mc-text-muted)" }}>
            {mockCampeonatosLista.length} campeonatos no total
          </p>
        </div>
        <Link
          href="/campeonatos/novo"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors"
          style={{ background: "var(--mc-primary)" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--mc-primary-dark)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--mc-primary)")}
        >
          <Plus size={15} /> Novo campeonato
        </Link>
      </div>

      {/* Filters */}
      <div
        className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 rounded-xl"
        style={{ background: "var(--mc-surface)", border: "1px solid var(--mc-border)" }}
      >
        <div className="flex items-center gap-1 flex-wrap">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFiltroStatus(f.value)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              style={{
                background: filtroStatus === f.value ? "var(--mc-primary)" : "var(--mc-bg)",
                color:      filtroStatus === f.value ? "white" : "var(--mc-text-muted)",
              }}
            >
              {f.label}
              <span
                className="px-1.5 py-0.5 rounded-full text-[0.6rem] font-bold"
                style={{
                  background: filtroStatus === f.value ? "rgba(255,255,255,0.25)" : "var(--mc-border)",
                  color:      filtroStatus === f.value ? "white" : "var(--mc-text-muted)",
                }}
              >
                {counts[f.value as keyof typeof counts]}
              </span>
            </button>
          ))}
        </div>

        <div className="relative sm:ml-auto">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--mc-text-muted)" }} />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar campeonato..."
            className="pl-8 pr-4 py-2 rounded-lg text-sm outline-none w-56 transition-all"
            style={{
              background: "var(--mc-bg)",
              border: "1px solid var(--mc-border)",
              color: "var(--mc-text)",
            }}
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
      </div>

      {/* List */}
      {filtrados.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3">
          {filtrados.map((c) => (
            <CampeonatoRow key={c.id} campeonato={c} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Row ───────────────────────────────────────────────────────────────────────

function CampeonatoRow({ campeonato: c }: { campeonato: CampeonatoListItem }) {
  const progresso = c.totalRounds > 0 ? (c.currentRound / c.totalRounds) * 100 : 0;

  return (
    <Link
      href={`/campeonatos/${c.id}`}
      className="flex items-center gap-5 p-5 rounded-xl transition-all group"
      style={{ background: "var(--mc-surface)", border: "1px solid var(--mc-border)" }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "var(--mc-shadow-md)";
        (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "none";
        (e.currentTarget as HTMLElement).style.transform = "none";
      }}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: "rgba(0,91,170,0.08)" }}
      >
        <Trophy size={22} style={{ color: "var(--mc-primary)" }} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <h3 className="font-bold text-sm" style={{ color: "var(--mc-text)" }}>
            {c.name}
          </h3>
          <StatusBadge status={c.status} />
        </div>
        <div className="flex items-center gap-3 text-xs flex-wrap" style={{ color: "var(--mc-text-muted)" }}>
          <span className="flex items-center gap-1"><Globe size={11} />{c.universe.name}</span>
          <span>·</span>
          <span className="flex items-center gap-1"><Shirt size={11} />{c.teams} times</span>
          <span>·</span>
          <span>{FORMAT_LABEL[c.format] ?? c.format}</span>
        </div>
      </div>

      {c.status === "em_andamento" && (
        <div className="hidden sm:block w-36 shrink-0">
          <div className="flex justify-between text-[0.65rem] mb-1.5" style={{ color: "var(--mc-text-muted)" }}>
            <span className="flex items-center gap-1"><TrendingUp size={10} /> Rodada {c.currentRound}/{c.totalRounds}</span>
            <span>{Math.round(progresso)}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full" style={{ background: "var(--mc-border)" }}>
            <div
              className="h-1.5 rounded-full transition-all"
              style={{ width: `${progresso}%`, background: "var(--mc-accent)" }}
            />
          </div>
        </div>
      )}

      {c.status === "agendada" && (
        <div className="hidden sm:flex items-center gap-1 text-xs shrink-0" style={{ color: "var(--mc-text-muted)" }}>
          <CalendarDays size={13} /> Não iniciado
        </div>
      )}

      {c.status === "finalizada" && (
        <div className="hidden sm:flex items-center gap-1 text-xs font-semibold shrink-0" style={{ color: "var(--mc-text-muted)" }}>
          <Trophy size={13} /> Concluído
        </div>
      )}

      <ChevronRight size={16} style={{ color: "var(--mc-text-muted)", flexShrink: 0 }} />
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
        <Trophy size={28} style={{ color: "var(--mc-primary)" }} />
      </div>
      <p className="font-bold text-base mb-1" style={{ color: "var(--mc-text)" }}>
        Nenhum campeonato encontrado
      </p>
      <p className="text-sm mb-6" style={{ color: "var(--mc-text-muted)" }}>
        Tente outro filtro ou crie um novo campeonato
      </p>
      <Link
        href="/campeonatos/novo"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white"
        style={{ background: "var(--mc-primary)" }}
      >
        <Plus size={15} /> Criar campeonato
      </Link>
    </div>
  );
}
