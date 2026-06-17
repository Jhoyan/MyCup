"use client";

import { useEffect, useState } from "react";
import { Loader2, AlertCircle, Save } from "lucide-react";
import { api } from "@/lib/api";
import type { MatchSummary, MatchStatus, UpdateMatchResultRequest } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const STATUS_OPTIONS: { value: MatchStatus; label: string }[] = [
  { value: "scheduled", label: "Agendada" },
  { value: "ongoing", label: "Ao vivo" },
  { value: "finished", label: "Finalizada" },
];

// Editor completo de resultado (placar + pênaltis de desempate + situação).
// Substitui a antiga rota /partidas/[matchId]; acionado pelo InlineResultForm.
export default function MatchResultModal({
  open,
  onOpenChange,
  matchId,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matchId: number | null;
  onSaved: () => void;
}) {
  const [match, setMatch] = useState<MatchSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [homeGoals, setHomeGoals] = useState(0);
  const [awayGoals, setAwayGoals] = useState(0);
  const [homePenalties, setHomePenalties] = useState(0);
  const [awayPenalties, setAwayPenalties] = useState(0);
  const [status, setStatus] = useState<MatchStatus>("finished");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || matchId == null) return;
    let active = true;
    setMatch(null);
    setError(null);
    setSubmitError(null);
    api
      .get<MatchSummary>(`/api/matches/${matchId}`)
      .then((data) => {
        if (!active) return;
        setMatch(data);
        setHomeGoals(data.homeGoals ?? 0);
        setAwayGoals(data.awayGoals ?? 0);
        setHomePenalties(data.homePenalties ?? 0);
        setAwayPenalties(data.awayPenalties ?? 0);
        setStatus(data.status === "scheduled" ? "finished" : (data.status as MatchStatus));
      })
      .catch((e) => active && setError((e as Error).message));
    return () => { active = false; };
  }, [open, matchId]);

  const undefinedSlot = !match?.homeTeam || !match?.awayTeam;
  const showPenalties = status === "finished" && homeGoals === awayGoals;

  async function handleSubmit() {
    if (matchId == null) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const body: UpdateMatchResultRequest = {
        homeGoals,
        awayGoals,
        status,
        ...(showPenalties ? { homePenalties, awayPenalties } : {}),
      };
      await api.put(`/api/matches/${matchId}`, body);
      setSubmitting(false);
      onOpenChange(false);
      onSaved();
    } catch (e) {
      setSubmitError((e as Error).message);
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold" style={{ color: "var(--mc-text)" }}>
            Lançar resultado
          </DialogTitle>
          <DialogDescription style={{ color: "var(--mc-text-muted)" }}>
            Registre o placar final da partida
          </DialogDescription>
        </DialogHeader>

        {error ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <AlertCircle size={26} style={{ color: "var(--mc-danger)" }} />
            <p className="font-bold text-base mt-3 mb-1" style={{ color: "var(--mc-text)" }}>
              Não foi possível carregar
            </p>
            <p className="text-sm" style={{ color: "var(--mc-text-muted)" }}>{error}</p>
          </div>
        ) : !match ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Loader2 size={26} className="animate-spin" style={{ color: "var(--mc-primary)" }} />
            <p className="text-sm mt-3" style={{ color: "var(--mc-text-muted)" }}>Carregando partida...</p>
          </div>
        ) : undefinedSlot ? (
          <div
            className="rounded-2xl p-8 text-center text-sm"
            style={{ border: "1px dashed var(--mc-border)", background: "var(--mc-bg)", color: "var(--mc-text-muted)" }}
          >
            Os times desta partida ainda não foram definidos. Conclua as partidas anteriores do chaveamento.
          </div>
        ) : (
          <div className="space-y-6">
            {/* Placar */}
            <div className="space-y-2">
              <div className="flex justify-center gap-4">
                <span className="w-24 text-sm font-bold text-center truncate" style={{ color: "var(--mc-text)" }}>
                  {match.homeTeam}
                </span>
                <span className="w-7 shrink-0" />
                <span className="w-24 text-sm font-bold text-center truncate" style={{ color: "var(--mc-text)" }}>
                  {match.awayTeam}
                </span>
              </div>
              <div className="flex items-center justify-center gap-4">
                <div className="w-24 flex justify-center">
                  <NumberInput value={homeGoals} onChange={setHomeGoals} />
                </div>
                <span className="w-7 shrink-0 text-center text-xl font-extrabold" style={{ color: "var(--mc-text-subtle)" }}>×</span>
                <div className="w-24 flex justify-center">
                  <NumberInput value={awayGoals} onChange={setAwayGoals} />
                </div>
              </div>
            </div>

            {/* Pênaltis (empate em mata-mata finalizado) */}
            {showPenalties && (
              <div
                className="rounded-xl px-4 py-3 space-y-2"
                style={{ background: "var(--mc-bg)", border: "1px solid var(--mc-border)" }}
              >
                <p className="text-[0.65rem] font-bold uppercase tracking-wide text-center" style={{ color: "var(--mc-text-muted)" }}>
                  Pênaltis (desempate)
                </p>
                <div className="flex items-center justify-center gap-4">
                  <div className="w-24 flex justify-center">
                    <NumberInput value={homePenalties} onChange={setHomePenalties} size="sm" />
                  </div>
                  <span className="w-7 shrink-0 text-center text-base font-bold" style={{ color: "var(--mc-text-subtle)" }}>×</span>
                  <div className="w-24 flex justify-center">
                    <NumberInput value={awayPenalties} onChange={setAwayPenalties} size="sm" />
                  </div>
                </div>
              </div>
            )}

            {/* Status */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold" style={{ color: "var(--mc-text)" }}>
                Situação
              </label>
              <div className="flex gap-1.5">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setStatus(opt.value)}
                    className="flex-1 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
                    style={{
                      background: status === opt.value ? "var(--mc-primary)" : "var(--mc-bg)",
                      color: status === opt.value ? "#fff" : "var(--mc-text-muted)",
                      border: "1px solid var(--mc-border)",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {submitError && (
              <p className="text-sm" style={{ color: "var(--mc-danger)" }}>{submitError}</p>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-60"
              style={{ background: "var(--mc-primary)" }}
              onMouseEnter={(e) => { if (!submitting) (e.currentTarget as HTMLElement).style.background = "var(--mc-primary-dark)"; }}
              onMouseLeave={(e) => { if (!submitting) (e.currentTarget as HTMLElement).style.background = "var(--mc-primary)"; }}
            >
              {submitting ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              {submitting ? "Salvando..." : "Salvar resultado"}
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function NumberInput({
  value, onChange, size = "lg",
}: {
  value: number;
  onChange: (v: number) => void;
  size?: "lg" | "sm";
}) {
  const dims = size === "lg" ? "w-16 h-14 text-2xl" : "w-12 h-11 text-lg";
  return (
    <input
      type="number"
      min={0}
      value={value}
      onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
      className={`${dims} text-center font-extrabold rounded-xl outline-none transition-all tabular-nums`}
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
  );
}
