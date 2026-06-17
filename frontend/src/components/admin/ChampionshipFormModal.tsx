"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ChevronRight, Trophy, LayoutList,
  Swords, Layers, Check, Users, Shuffle, Hand,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type {
  CreateChampionshipRequest, ChampionshipFormat, ChampionshipDistribution, UniverseListItem,
} from "@/lib/types";
import { FORMAT_IDS } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

// ── Schemas ───────────────────────────────────────────────────────────────────
const step1Schema = z.object({
  nome:       z.string().min(1, "Nome obrigatório").max(120),
  universoid: z.string().min(1, "Selecione um universo"),
});

const step2Schema = z.object({
  formato: z.string().min(1, "Selecione um formato"),
});

const step3Schema = z.object({
  distribuicao: z.string().min(1, "Selecione um método"),
});

type Step1 = z.infer<typeof step1Schema>;
type Step2 = { formato: string };
type Step3 = { distribuicao: string };

// ── Formats config ─────────────────────────────────────────────────────────────
// `value` usa o Format.Type real do backend (inglês); o label fica em PT para o usuário.
const formatos = [
  {
    value: "round_robin",
    label: "Pontos Corridos",
    desc: "Todos contra todos. Classificação por pontos ao longo das rodadas.",
    icon: LayoutList,
    detail: "N times → N-1 rodadas → N/2 partidas por rodada",
  },
  {
    value: "knockout",
    label: "Mata-mata",
    desc: "Eliminação direta. Perdeu, saiu.",
    icon: Swords,
    detail: "Oitavas → Quartas → Semi → Final",
  },
  {
    value: "groups_knockout",
    label: "Grupos + Mata-mata",
    desc: "Fase de grupos seguida de eliminatórias com os classificados.",
    icon: Layers,
    detail: "Fase de grupos → Eliminatórias",
  },
];

const distribuicoes = [
  {
    value: "manual",
    label: "Manual",
    desc: "Você define quem vai para cada time.",
    icon: Hand,
  },
  {
    value: "sorteio",
    label: "Sorteio",
    desc: "O sistema distribui automaticamente de forma balanceada.",
    icon: Shuffle,
  },
  {
    value: "escolha",
    label: "Escolha",
    desc: "Os jogadores escolhem seus próprios times.",
    icon: Users,
  },
];

const STEPS = ["Informações", "Formato", "Distribuição", "Confirmar"];

// ── Modal ───────────────────────────────────────────────────────────────────────
export default function ChampionshipFormModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);

  const [step1Data, setStep1Data] = useState<Partial<Step1>>({});
  const [step2Data, setStep2Data] = useState<Partial<Step2>>({});
  const [step3Data, setStep3Data] = useState<Partial<Step3>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [universos, setUniversos] = useState<UniverseListItem[]>([]);

  const form1 = useForm<Step1>({ resolver: zodResolver(step1Schema), defaultValues: { nome: "", universoid: "" } });
  const form2 = useForm<Step2>({ resolver: zodResolver(step2Schema), defaultValues: { formato: undefined } });
  const form3 = useForm<Step3>({ resolver: zodResolver(step3Schema), defaultValues: { distribuicao: undefined } });

  // Carrega universos e reinicia o wizard a cada abertura.
  useEffect(() => {
    if (!open) return;
    setStep(0);
    setStep1Data({});
    setStep2Data({});
    setStep3Data({});
    setSubmitError(null);
    form1.reset({ nome: "", universoid: "" });
    form2.reset({ formato: undefined });
    form3.reset({ distribuicao: undefined });
    api
      .get<UniverseListItem[]>("/api/universes")
      .then(setUniversos)
      .catch((e) => toast.error((e as Error).message));
  }, [open, form1, form2, form3]);

  function nextStep1(data: Step1) { setStep1Data(data); setStep(1); }
  function nextStep2(data: Step2) { setStep2Data(data); setStep(2); }
  function nextStep3(data: Step3) { setStep3Data(data); setStep(3); }

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const format = step2Data.formato as ChampionshipFormat;
      const body: CreateChampionshipRequest = {
        name: step1Data.nome!,
        format,
        distribution: step3Data.distribuicao as ChampionshipDistribution,
        universeId: Number(step1Data.universoid),
        formatId: FORMAT_IDS[format],
      };
      const created = await api.post<{ id: number; message: string }>("/api/championships", body);
      // Recém-criado vem como draft (sem times/chaveamento): leva direto à configuração.
      onOpenChange(false);
      router.push(`/campeonatos/${created.id}/configurar`);
    } catch (e) {
      setSubmitError((e as Error).message);
      setSubmitting(false);
    }
  }

  const universeSelecionado = universos.find((u) => u.id === Number(step1Data.universoid));
  const formatoSelecionado  = formatos.find((f) => f.value === step2Data.formato);
  const distSelecionada     = distribuicoes.find((d) => d.value === step3Data.distribuicao);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-7 max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-extrabold" style={{ color: "var(--mc-text)" }}>
            Novo Campeonato
          </DialogTitle>
          <DialogDescription style={{ color: "var(--mc-text-muted)" }}>
            Configure o seu torneio passo a passo
          </DialogDescription>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex justify-center py-2">
          <StepIndicator current={step} />
        </div>

        {/* ── Step 0: Informações ── */}
        {step === 0 && (
          <form onSubmit={form1.handleSubmit(nextStep1)} className="space-y-5">
            <div>
              <h2 className="text-base font-bold mb-0.5" style={{ color: "var(--mc-text)" }}>
                Informações básicas
              </h2>
              <p className="text-sm" style={{ color: "var(--mc-text-muted)" }}>
                Dê um nome e escolha o universo onde o campeonato será realizado.
              </p>
            </div>

            <Field label="Nome do campeonato" error={form1.formState.errors.nome?.message}>
              <TextInput
                {...form1.register("nome")}
                placeholder="Ex: Campeonato Verão 2025"
                error={!!form1.formState.errors.nome}
              />
            </Field>

            <Field label="Universo" error={form1.formState.errors.universoid?.message}>
              <select
                {...form1.register("universoid")}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all appearance-none"
                style={{
                  background: "var(--mc-bg)",
                  border: `1px solid ${form1.formState.errors.universoid ? "var(--mc-danger)" : "var(--mc-border)"}`,
                  color: "var(--mc-text)",
                }}
              >
                <option value="">Selecione um universo</option>
                {universos.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </Field>

            <StepActions onBack={() => onOpenChange(false)} backLabel="Cancelar" />
          </form>
        )}

        {/* ── Step 1: Formato ── */}
        {step === 1 && (
          <form onSubmit={form2.handleSubmit(nextStep2)} className="space-y-5">
            <div>
              <h2 className="text-base font-bold mb-0.5" style={{ color: "var(--mc-text)" }}>
                Formato do campeonato
              </h2>
              <p className="text-sm" style={{ color: "var(--mc-text-muted)" }}>
                Escolha como as partidas serão organizadas.
              </p>
            </div>

            <div className="space-y-3">
              {formatos.map((f) => (
                <OptionCard
                  key={f.value}
                  selected={form2.watch("formato") === f.value}
                  onClick={() => form2.setValue("formato", f.value as Step2["formato"], { shouldValidate: true })}
                  icon={f.icon}
                  label={f.label}
                  desc={f.desc}
                  detail={f.detail}
                />
              ))}
            </div>
            {form2.formState.errors.formato && (
              <p className="text-xs" style={{ color: "var(--mc-danger)" }}>
                {form2.formState.errors.formato.message}
              </p>
            )}

            <StepActions onBack={() => setStep(0)} />
          </form>
        )}

        {/* ── Step 2: Distribuição ── */}
        {step === 2 && (
          <form onSubmit={form3.handleSubmit(nextStep3)} className="space-y-5">
            <div>
              <h2 className="text-base font-bold mb-0.5" style={{ color: "var(--mc-text)" }}>
                Distribuição de jogadores
              </h2>
              <p className="text-sm" style={{ color: "var(--mc-text-muted)" }}>
                Como os jogadores serão alocados nos times?
              </p>
            </div>

            <div className="space-y-3">
              {distribuicoes.map((d) => (
                <OptionCard
                  key={d.value}
                  selected={form3.watch("distribuicao") === d.value}
                  onClick={() => form3.setValue("distribuicao", d.value as Step3["distribuicao"], { shouldValidate: true })}
                  icon={d.icon}
                  label={d.label}
                  desc={d.desc}
                />
              ))}
            </div>
            {form3.formState.errors.distribuicao && (
              <p className="text-xs" style={{ color: "var(--mc-danger)" }}>
                {form3.formState.errors.distribuicao.message}
              </p>
            )}

            <StepActions onBack={() => setStep(1)} />
          </form>
        )}

        {/* ── Step 3: Confirmar ── */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-base font-bold mb-0.5" style={{ color: "var(--mc-text)" }}>
                Confirmar criação
              </h2>
              <p className="text-sm" style={{ color: "var(--mc-text-muted)" }}>
                Revise as informações antes de criar o campeonato.
              </p>
            </div>

            <div className="space-y-3 rounded-xl p-5" style={{ background: "var(--mc-bg)", border: "1px solid var(--mc-border)" }}>
              <SummaryRow icon={Trophy}    label="Nome"         value={step1Data.nome ?? "—"} />
              <SummaryRow icon={Layers}    label="Universo"     value={universeSelecionado?.name ?? "—"} />
              <SummaryRow icon={LayoutList} label="Formato"     value={formatoSelecionado?.label ?? "—"} />
              <SummaryRow icon={Users}     label="Distribuição" value={distSelecionada?.label ?? "—"} />
            </div>

            {submitError && (
              <p className="text-sm" style={{ color: "var(--mc-danger)" }}>{submitError}</p>
            )}

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-60"
                style={{ background: "var(--mc-primary)" }}
                onMouseEnter={(e) => { if (!submitting) (e.currentTarget as HTMLElement).style.background = "var(--mc-primary-dark)"; }}
                onMouseLeave={(e) => { if (!submitting) (e.currentTarget as HTMLElement).style.background = "var(--mc-primary)"; }}
              >
                {submitting ? "Criando..." : "Criar campeonato"}
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                style={{ border: "1px solid var(--mc-border)", color: "var(--mc-text)", background: "transparent" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--mc-bg)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
              >
                Voltar
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ── Sub-componentes ─────────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((label, i) => {
        const done   = i < current;
        const active = i === current;
        const isLast = i === STEPS.length - 1;

        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                style={{
                  background: done || active ? "var(--mc-primary)" : "var(--mc-border)",
                  color:      done || active ? "white" : "var(--mc-text-muted)",
                }}
              >
                {done ? <Check size={14} /> : i + 1}
              </div>
              <span
                className="text-[0.7rem] font-semibold whitespace-nowrap hidden sm:block"
                style={{ color: active ? "var(--mc-primary)" : done ? "var(--mc-text-muted)" : "var(--mc-text-subtle)" }}
              >
                {label}
              </span>
            </div>
            {!isLast && (
              <div
                className="w-12 sm:w-20 h-[2px] mb-3 mx-1 transition-all"
                style={{ background: done ? "var(--mc-primary)" : "var(--mc-border)" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold" style={{ color: "var(--mc-text)" }}>
        {label}
      </label>
      {children}
      {error && <p className="text-xs" style={{ color: "var(--mc-danger)" }}>{error}</p>}
    </div>
  );
}

function TextInput({ error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
  return (
    <input
      {...props}
      className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all"
      style={{
        background: "var(--mc-bg)",
        border: `1px solid ${error ? "var(--mc-danger)" : "var(--mc-border)"}`,
        color: "var(--mc-text)",
      }}
      onFocus={(e) => {
        if (!error) {
          e.currentTarget.style.borderColor = "var(--mc-primary)";
          e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,91,170,0.1)";
        }
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = error ? "var(--mc-danger)" : "var(--mc-border)";
        e.currentTarget.style.boxShadow = "none";
        props.onBlur?.(e);
      }}
    />
  );
}

function OptionCard({
  selected, onClick, icon: Icon, label, desc, detail,
}: {
  selected: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
  desc: string;
  detail?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left p-4 rounded-xl transition-all cursor-pointer"
      style={{
        border: `2px solid ${selected ? "var(--mc-primary)" : "var(--mc-border)"}`,
        background: selected ? "rgba(0,91,170,0.04)" : "var(--mc-surface)",
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
          style={{ background: selected ? "rgba(0,91,170,0.12)" : "var(--mc-bg)" }}
        >
          <Icon size={18} style={{ color: selected ? "var(--mc-primary)" : "var(--mc-text-muted)" }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-bold" style={{ color: "var(--mc-text)" }}>{label}</span>
            {selected && (
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "var(--mc-primary)" }}
              >
                <Check size={11} color="white" />
              </span>
            )}
          </div>
          <p className="text-xs mt-0.5" style={{ color: "var(--mc-text-muted)" }}>{desc}</p>
          {detail && (
            <p className="text-[0.7rem] mt-1.5 font-medium" style={{ color: "var(--mc-text-subtle)" }}>
              {detail}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}

function StepActions({ onBack, backLabel = "Voltar" }: { onBack: () => void; backLabel?: string }) {
  return (
    <div className="flex gap-3 pt-1">
      <button
        type="submit"
        className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors"
        style={{ background: "var(--mc-primary)" }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--mc-primary-dark)")}
        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--mc-primary)")}
      >
        Continuar <ChevronRight size={15} />
      </button>
      <button
        type="button"
        onClick={onBack}
        className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
        style={{ border: "1px solid var(--mc-border)", color: "var(--mc-text)", background: "transparent" }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--mc-bg)")}
        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
      >
        {backLabel}
      </button>
    </div>
  );
}

function SummaryRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-2" style={{ borderBottom: "1px solid var(--mc-border)" }}>
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: "rgba(0,91,170,0.08)" }}
      >
        <Icon size={15} style={{ color: "var(--mc-primary)" }} />
      </div>
      <span className="text-xs font-medium w-24 shrink-0" style={{ color: "var(--mc-text-muted)" }}>
        {label}
      </span>
      <span className="text-sm font-semibold" style={{ color: "var(--mc-text)" }}>
        {value}
      </span>
    </div>
  );
}
