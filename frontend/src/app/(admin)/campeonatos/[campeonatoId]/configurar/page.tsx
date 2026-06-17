"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft, Shirt, Users, Shuffle, Plus, Trash2, Zap,
  Loader2, AlertCircle, Settings2, Search,
} from "lucide-react";
import { api } from "@/lib/api";
import PlayerFormModal from "@/components/admin/PlayerFormModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import type {
  ChampionshipDetail, TeamSummary, PlayerListItem,
  ChampionshipPlayer, GenerateChampionshipRequest,
} from "@/lib/types";

export default function ConfigurarCampeonatoPage() {
  const { campeonatoId } = useParams<{ campeonatoId: string }>();
  const router = useRouter();

  const [detail, setDetail] = useState<ChampionshipDetail | null>(null);
  const [champTeams, setChampTeams] = useState<TeamSummary[]>([]);
  const [champPlayers, setChampPlayers] = useState<ChampionshipPlayer[]>([]);
  const [universeTeams, setUniverseTeams] = useState<TeamSummary[]>([]);
  const [universePlayers, setUniversePlayers] = useState<PlayerListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // Nome digitado na busca que ainda não existe → fluxo de criação.
  const [teamToCreate, setTeamToCreate] = useState<string | null>(null);
  const [playerToCreate, setPlayerToCreate] = useState<string | null>(null);

  const load = useCallback(async () => {
    const d = await api.get<ChampionshipDetail>(`/api/championships/${campeonatoId}`);
    const [ct, cp, ut, up] = await Promise.all([
      api.get<TeamSummary[]>(`/api/championships/${campeonatoId}/teams`),
      api.get<ChampionshipPlayer[]>(`/api/championships/${campeonatoId}/players`),
      api.get<TeamSummary[]>(`/api/teams?universeId=${d.universe.id}`),
      api.get<PlayerListItem[]>(`/api/players?universeId=${d.universe.id}`),
    ]);
    setDetail(d);
    setChampTeams(ct);
    setChampPlayers(cp);
    setUniverseTeams(ut);
    setUniversePlayers(up);
  }, [campeonatoId]);

  useEffect(() => {
    let active = true;
    load().catch((e) => active && setError((e as Error).message));
    return () => {
      active = false;
    };
  }, [load]);

  // Executa uma ação e recarrega; concentra tratamento de erro/estado de loading.
  async function run(action: () => Promise<unknown>) {
    setBusy(true);
    setActionError(null);
    try {
      await action();
      await load();
    } catch (e) {
      setActionError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (error) return <ErrorState message={error} />;
  if (!detail) return <LoadingState />;

  const enrolledIds = new Set(champPlayers.map((p) => p.playerId));
  const champTeamIds = new Set(champTeams.map((t) => t.id));
  const availableTeams = universeTeams.filter((t) => !champTeamIds.has(t.id));
  const availablePlayers = universePlayers.filter((p) => !enrolledIds.has(p.id));

  return (
    <div className="max-w-3xl space-y-6">

      {/* Back */}
      <Link
        href={`/campeonatos/${campeonatoId}`}
        className="inline-flex items-center gap-1 text-sm font-medium transition-colors"
        style={{ color: "var(--mc-text-muted)" }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--mc-primary)")}
        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--mc-text-muted)")}
      >
        <ChevronLeft size={15} /> {detail.name}
      </Link>

      <div>
        <h1 className="text-2xl font-extrabold flex items-center gap-2" style={{ color: "var(--mc-text)" }}>
          <Settings2 size={22} style={{ color: "var(--mc-primary)" }} /> Configurar campeonato
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--mc-text-muted)" }}>
          Adicione times e jogadores, depois gere o chaveamento
        </p>
      </div>

      {actionError && (
        <div
          className="rounded-lg px-4 py-3 text-sm flex items-start gap-2"
          style={{ background: "rgba(220,38,38,0.08)", border: "1px solid var(--mc-danger)", color: "var(--mc-danger)" }}
        >
          <AlertCircle size={16} className="mt-0.5 shrink-0" /> {actionError}
        </div>
      )}

      {/* ── Times ── */}
      <Section icon={Shirt} title="Times" count={champTeams.length}>
        {champTeams.length === 0 ? (
          <Empty text="Nenhum time adicionado ainda." />
        ) : (
          <ul className="space-y-1.5">
            {champTeams.map((t) => (
              <RowItem key={t.id} name={t.name} onRemove={() => run(() => api.del(`/api/championships/${campeonatoId}/teams/${t.id}`))} disabled={busy} />
            ))}
          </ul>
        )}

        <AddFromList
          placeholder="Buscar ou criar time..."
          options={availableTeams.map((t) => ({ id: t.id, name: t.name }))}
          onAdd={(id) => run(() => api.post(`/api/championships/${campeonatoId}/teams`, { teamId: id }))}
          onCreateNew={(name) => setTeamToCreate(name)}
          disabled={busy}
        />
      </Section>

      {/* ── Jogadores ── */}
      <Section icon={Users} title="Jogadores" count={champPlayers.length}>
        {champPlayers.length === 0 ? (
          <Empty text="Nenhum jogador inscrito ainda." />
        ) : (
          <ul className="space-y-1.5">
            {champPlayers.map((p) => (
              <li
                key={p.playerId}
                className="flex items-center gap-2 px-3 py-2 rounded-lg"
                style={{ background: "var(--mc-bg)", border: "1px solid var(--mc-border)" }}
              >
                <span className="flex-1 text-sm font-semibold truncate" style={{ color: "var(--mc-text)" }}>
                  {p.playerName}
                </span>
                <select
                  value={p.teamId ?? ""}
                  onChange={(e) =>
                    run(() =>
                      api.put(`/api/championships/${campeonatoId}/players/${p.playerId}`, { teamId: Number(e.target.value) }),
                    )
                  }
                  disabled={busy || champTeams.length === 0}
                  className="text-xs rounded-md px-2 py-1 outline-none"
                  style={{ background: "var(--mc-surface)", border: "1px solid var(--mc-border)", color: "var(--mc-text)" }}
                >
                  <option value="" disabled>Sem time</option>
                  {champTeams.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => run(() => api.del(`/api/championships/${campeonatoId}/players/${p.playerId}`))}
                  disabled={busy}
                  className="p-1 rounded-md transition-colors disabled:opacity-40"
                  style={{ color: "var(--mc-danger)" }}
                  aria-label="Remover jogador"
                >
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}

        <AddFromList
          placeholder="Buscar ou criar jogador..."
          options={availablePlayers.map((p) => ({ id: p.id, name: p.name }))}
          onAdd={(id) => run(() => api.post(`/api/championships/${campeonatoId}/players`, { playerId: id }))}
          onCreateNew={(name) => setPlayerToCreate(name)}
          disabled={busy}
        />

        {champPlayers.length > 0 && champTeams.length > 0 && (
          <button
            type="button"
            onClick={() => run(() => api.post(`/api/championships/${campeonatoId}/players/draw`, {}))}
            disabled={busy}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
            style={{ background: "var(--mc-bg)", border: "1px solid var(--mc-border)", color: "var(--mc-text)" }}
          >
            <Shuffle size={14} /> Sortear times entre os jogadores
          </button>
        )}
      </Section>

      {/* ── Gerar ── */}
      <GenerateSection
        format={detail.format}
        teamCount={champTeams.length}
        busy={busy}
        onGenerate={async (options) => {
          setBusy(true);
          setActionError(null);
          try {
            await api.post(`/api/championships/${campeonatoId}/generate`, options);
            router.push(`/campeonatos/${campeonatoId}`);
          } catch (e) {
            setActionError((e as Error).message);
            setBusy(false);
          }
        }}
      />

      {/* Confirmação de criação de time novo (a partir da busca) */}
      <Dialog open={teamToCreate !== null} onOpenChange={(o) => { if (!o) setTeamToCreate(null); }}>
        <DialogContent className="sm:max-w-sm p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold" style={{ color: "var(--mc-text)" }}>
              Criar novo time
            </DialogTitle>
            <DialogDescription style={{ color: "var(--mc-text-muted)" }}>
              O time “{teamToCreate}” não existe no universo. Deseja criá-lo e adicioná-lo a este campeonato?
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => {
                const name = teamToCreate;
                setTeamToCreate(null);
                if (name) run(() => api.post(`/api/championships/${campeonatoId}/teams`, { name }));
              }}
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors"
              style={{ background: "var(--mc-primary)" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--mc-primary-dark)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--mc-primary)")}
            >
              <Plus size={15} /> Criar e adicionar
            </button>
            <button
              type="button"
              onClick={() => setTeamToCreate(null)}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
              style={{ border: "1px solid var(--mc-border)", color: "var(--mc-text)", background: "transparent" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--mc-bg)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
            >
              Cancelar
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Criação de jogador novo (a partir da busca) → cria no universo e inscreve */}
      <PlayerFormModal
        open={playerToCreate !== null}
        onOpenChange={(o) => { if (!o) setPlayerToCreate(null); }}
        universeId={detail.universe.id}
        initialName={playerToCreate ?? ""}
        onSaved={(saved) => {
          setPlayerToCreate(null);
          run(() => api.post(`/api/championships/${campeonatoId}/players`, { playerId: saved.id }));
        }}
      />
    </div>
  );
}

// ── Generate section ──────────────────────────────────────────────────────────

function GenerateSection({
  format,
  teamCount,
  busy,
  onGenerate,
}: {
  format: string;
  teamCount: number;
  busy: boolean;
  onGenerate: (options: GenerateChampionshipRequest) => void;
}) {
  const [doubleRound, setDoubleRound] = useState(false);
  const [thirdPlace, setThirdPlace] = useState(false);
  const [elimination, setElimination] = useState<"single" | "double">("single");
  const [groupsCount, setGroupsCount] = useState(2);
  const [groupSize, setGroupSize] = useState(4);
  const [qualifiersPerGroup, setQualifiersPerGroup] = useState(2);

  function build(): GenerateChampionshipRequest {
    if (format === "round_robin") return { doubleRound };
    if (format === "knockout") return { thirdPlace, elimination };
    return { doubleRound, thirdPlace, groupsCount, groupSize, qualifiersPerGroup, bracketSeeding: "cross_adjacent" };
  }

  return (
    <Section icon={Zap} title="Gerar chaveamento">
      <p className="text-xs" style={{ color: "var(--mc-text-muted)" }}>
        Os times atuais ({teamCount}) serão usados. Após gerar, o chaveamento é criado e o campeonato começa.
      </p>

      <div className="space-y-3 mt-1">
        {format === "round_robin" && (
          <Toggle label="Ida e volta (turno e returno)" checked={doubleRound} onChange={setDoubleRound} />
        )}

        {format === "knockout" && (
          <>
            <Toggle label="Disputa de 3º lugar" checked={thirdPlace} onChange={setThirdPlace} />
            <div className="space-y-1.5">
              <span className="text-sm font-semibold" style={{ color: "var(--mc-text)" }}>Eliminação</span>
              <div className="flex gap-1.5">
                {(["single", "double"] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setElimination(opt)}
                    className="flex-1 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
                    style={{
                      background: elimination === opt ? "var(--mc-primary)" : "var(--mc-bg)",
                      color: elimination === opt ? "#fff" : "var(--mc-text-muted)",
                      border: "1px solid var(--mc-border)",
                    }}
                  >
                    {opt === "single" ? "Simples" : "Dupla"}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {format === "groups_knockout" && (
          <>
            <div className="grid grid-cols-3 gap-3">
              <NumField label="Grupos" value={groupsCount} onChange={setGroupsCount} min={1} />
              <NumField label="Times/grupo" value={groupSize} onChange={setGroupSize} min={2} />
              <NumField label="Classificados" value={qualifiersPerGroup} onChange={setQualifiersPerGroup} min={1} />
            </div>
            <Toggle label="Grupos com ida e volta" checked={doubleRound} onChange={setDoubleRound} />
            <Toggle label="Disputa de 3º lugar" checked={thirdPlace} onChange={setThirdPlace} />
          </>
        )}
      </div>

      <button
        type="button"
        onClick={() => onGenerate(build())}
        disabled={busy || teamCount < 2}
        className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-50"
        style={{ background: "var(--mc-primary)" }}
      >
        {busy ? <Loader2 size={15} className="animate-spin" /> : <Zap size={15} />}
        Gerar chaveamento
      </button>
      {teamCount < 2 && (
        <p className="text-xs" style={{ color: "var(--mc-text-muted)" }}>Adicione ao menos 2 times.</p>
      )}
    </Section>
  );
}

// ── Sub-componentes ────────────────────────────────────────────────────────────

function Section({
  icon: Icon, title, count, children,
}: {
  icon: React.ElementType;
  title: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl p-5 space-y-3"
      style={{ background: "var(--mc-surface)", border: "1px solid var(--mc-border)" }}
    >
      <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: "var(--mc-text)" }}>
        <Icon size={15} style={{ color: "var(--mc-primary)" }} /> {title}
        {count !== undefined && (
          <span
            className="text-[0.65rem] px-1.5 py-0.5 rounded-full font-semibold"
            style={{ background: "var(--mc-bg)", color: "var(--mc-text-muted)" }}
          >
            {count}
          </span>
        )}
      </h2>
      {children}
    </div>
  );
}

function RowItem({ name, onRemove, disabled }: { name: string; onRemove: () => void; disabled: boolean }) {
  return (
    <li
      className="flex items-center gap-2 px-3 py-2 rounded-lg"
      style={{ background: "var(--mc-bg)", border: "1px solid var(--mc-border)" }}
    >
      <span className="flex-1 text-sm font-semibold truncate" style={{ color: "var(--mc-text)" }}>{name}</span>
      <button
        type="button"
        onClick={onRemove}
        disabled={disabled}
        className="p-1 rounded-md transition-colors disabled:opacity-40"
        style={{ color: "var(--mc-danger)" }}
        aria-label="Remover"
      >
        <Trash2 size={14} />
      </button>
    </li>
  );
}

// Combobox com busca: filtra a lista por texto e adiciona ao clicar num item.
// Quando `onCreateNew` é fornecido, um nome sem correspondência exata vira opção de
// criar (linha "Criar 'x'" e botão Adicionar). Útil quando o universo tem muitos
// times/jogadores e também para criar um novo direto da busca.
function AddFromList({
  placeholder, options, onAdd, onCreateNew, disabled,
}: {
  placeholder: string;
  options: { id: number; name: string }[];
  onAdd: (id: number) => void;
  onCreateNew?: (name: string) => void;
  disabled: boolean;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  // Sem opções na lista mas com possibilidade de criar, ainda exibimos o campo.
  if (options.length === 0 && !onCreateNew) return null;

  const raw = query.trim();
  const q = raw.toLowerCase();
  const filtered = q ? options.filter((o) => o.name.toLowerCase().includes(q)) : options;
  const exactMatch = options.find((o) => o.name.toLowerCase() === q);
  const canCreate = !!onCreateNew && raw.length > 0 && !exactMatch;

  function add(id: number) {
    onAdd(id);
    setQuery("");
  }

  function create() {
    onCreateNew?.(raw);
    setQuery("");
    setOpen(false);
  }

  // Ação do botão/Enter: nome existente → adiciona; nome novo → cria.
  function commit() {
    if (exactMatch) add(exactMatch.id);
    else if (canCreate) create();
    else if (!onCreateNew && filtered[0]) add(filtered[0].id);
  }

  return (
    <div className="relative flex gap-2" ref={ref}>
      <div className="relative flex-1">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: "var(--mc-text-muted)" }}
        />
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocusCapture={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); commit(); }
            else if (e.key === "Escape") setOpen(false);
          }}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full text-sm rounded-lg pl-9 pr-3 py-2 outline-none"
          style={{ background: "var(--mc-bg)", border: "1px solid var(--mc-border)", color: "var(--mc-text)" }}
        />
        {open && (
          <div
            className="absolute left-0 right-0 top-full mt-1 z-20 max-h-56 overflow-y-auto rounded-lg py-1"
            style={{ background: "var(--mc-surface)", border: "1px solid var(--mc-border)", boxShadow: "var(--mc-shadow-md)" }}
          >
            {filtered.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => add(o.id)}
                disabled={disabled}
                className="w-full text-left px-3 py-2 text-sm transition-colors hover:bg-[var(--mc-bg)] disabled:opacity-50"
                style={{ color: "var(--mc-text)" }}
              >
                {o.name}
              </button>
            ))}
            {canCreate && (
              <button
                type="button"
                onClick={create}
                disabled={disabled}
                className="w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors hover:bg-[var(--mc-bg)] disabled:opacity-50"
                style={{ color: "var(--mc-primary)", borderTop: filtered.length > 0 ? "1px solid var(--mc-border)" : undefined }}
              >
                <Plus size={14} /> Criar “{raw}”
              </button>
            )}
            {filtered.length === 0 && !canCreate && (
              <p className="px-3 py-2 text-sm" style={{ color: "var(--mc-text-muted)" }}>
                {raw ? `Nenhum resultado para “${raw}”` : "Nenhuma opção disponível"}
              </p>
            )}
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={commit}
        disabled={disabled || !raw || (!exactMatch && !canCreate && (!!onCreateNew || filtered.length === 0))}
        className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-50"
        style={{ background: "var(--mc-primary)" }}
      >
        <Plus size={14} /> Adicionar
      </button>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between w-full py-1.5 cursor-pointer"
    >
      <span className="text-sm font-medium" style={{ color: "var(--mc-text)" }}>{label}</span>
      <span
        className="w-9 h-5 rounded-full transition-colors relative shrink-0"
        style={{ background: checked ? "var(--mc-primary)" : "var(--mc-border)" }}
      >
        <span
          className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
          style={{ left: checked ? 18 : 2 }}
        />
      </span>
    </button>
  );
}

function NumField({ label, value, onChange, min }: { label: string; value: number; onChange: (v: number) => void; min: number }) {
  return (
    <div className="space-y-1">
      <span className="text-xs font-semibold" style={{ color: "var(--mc-text-muted)" }}>{label}</span>
      <input
        type="number"
        min={min}
        value={value}
        onChange={(e) => onChange(Math.max(min, Number(e.target.value) || min))}
        className="w-full text-sm rounded-lg px-3 py-2 outline-none tabular-nums"
        style={{ background: "var(--mc-bg)", border: "1px solid var(--mc-border)", color: "var(--mc-text)" }}
      />
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <p className="text-sm py-2" style={{ color: "var(--mc-text-muted)" }}>{text}</p>
  );
}

// ── Loading / Error states ────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 className="animate-spin mb-3" size={28} style={{ color: "var(--mc-primary)" }} />
      <p className="text-sm" style={{ color: "var(--mc-text-muted)" }}>Carregando...</p>
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
