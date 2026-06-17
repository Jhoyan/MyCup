"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Globe } from "lucide-react";
import { api } from "@/lib/api";
import type { CreateUniverseRequest } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const schema = z.object({
  name: z.string().min(1, "Nome obrigatório").max(120, "Máximo 120 caracteres"),
  description: z.string().max(500, "Máximo 500 caracteres").optional(),
});

type FormData = z.infer<typeof schema>;

export default function UniverseFormModal({
  open,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (open) reset({ name: "", description: "" });
  }, [open, reset]);

  async function onSubmit(data: FormData) {
    const body: CreateUniverseRequest = {
      name: data.name,
      description: data.description || undefined,
    };
    try {
      await api.post("/api/universes", body);
      toast.success("Universo criado");
      onOpenChange(false);
      onSaved();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-6">
        <DialogHeader>
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(0,91,170,0.08)" }}
          >
            <Globe size={22} style={{ color: "var(--mc-primary)" }} />
          </div>
          <DialogTitle className="text-xl font-extrabold" style={{ color: "var(--mc-text)" }}>
            Novo Universo
          </DialogTitle>
          <DialogDescription style={{ color: "var(--mc-text-muted)" }}>
            Um universo é uma liga permanente com jogadores e histórico próprio
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="universe-name" className="block text-sm font-semibold" style={{ color: "var(--mc-text)" }}>
              Nome do universo
            </label>
            <input
              id="universe-name"
              {...register("name")}
              placeholder="Ex: Pelada do Bairro"
              autoFocus
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all"
              style={{
                background: "var(--mc-bg)",
                border: `1px solid ${errors.name ? "var(--mc-danger)" : "var(--mc-border)"}`,
                color: "var(--mc-text)",
              }}
              onFocus={(e) => {
                if (!errors.name) {
                  e.currentTarget.style.borderColor = "var(--mc-primary)";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,91,170,0.1)";
                }
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = errors.name ? "var(--mc-danger)" : "var(--mc-border)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
            {errors.name && (
              <p className="text-xs" style={{ color: "var(--mc-danger)" }}>{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="universe-description" className="block text-sm font-semibold" style={{ color: "var(--mc-text)" }}>
              Descrição <span className="font-normal" style={{ color: "var(--mc-text-muted)" }}>(opcional)</span>
            </label>
            <textarea
              id="universe-description"
              {...register("description")}
              placeholder="Ex: Liga semanal entre amigos do bairro..."
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all resize-none"
              style={{
                background: "var(--mc-bg)",
                border: `1px solid ${errors.description ? "var(--mc-danger)" : "var(--mc-border)"}`,
                color: "var(--mc-text)",
              }}
              onFocus={(e) => {
                if (!errors.description) {
                  e.currentTarget.style.borderColor = "var(--mc-primary)";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,91,170,0.1)";
                }
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = errors.description ? "var(--mc-danger)" : "var(--mc-border)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
            {errors.description && (
              <p className="text-xs" style={{ color: "var(--mc-danger)" }}>{errors.description.message}</p>
            )}
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-60"
              style={{ background: "var(--mc-primary)" }}
              onMouseEnter={(e) => { if (!isSubmitting) (e.currentTarget as HTMLElement).style.background = "var(--mc-primary-dark)"; }}
              onMouseLeave={(e) => { if (!isSubmitting) (e.currentTarget as HTMLElement).style.background = "var(--mc-primary)"; }}
            >
              {isSubmitting ? "Criando..." : "Criar universo"}
            </button>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
              style={{ border: "1px solid var(--mc-border)", color: "var(--mc-text)", background: "transparent" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--mc-bg)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
            >
              Cancelar
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
