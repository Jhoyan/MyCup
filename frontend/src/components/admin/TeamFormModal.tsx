"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Shirt } from "lucide-react";
import { api } from "@/lib/api";
import type { CreateTeamRequest, UpdateTeamRequest } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const schema = z.object({
  name: z.string().min(1, "Nome obrigatório").max(120, "Máximo 120 caracteres"),
});

type FormData = z.infer<typeof schema>;

export default function TeamFormModal({
  open,
  onOpenChange,
  universeId,
  team,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  universeId: number;
  /** Presença indica modo edição. */
  team?: { id: number; name: string };
  onSaved: () => void;
}) {
  const isEdit = !!team;
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (open) reset({ name: team?.name ?? "" });
  }, [open, team, reset]);

  async function onSubmit(data: FormData) {
    try {
      if (isEdit) {
        const body: UpdateTeamRequest = { name: data.name };
        await api.put(`/api/teams/${team!.id}`, body);
        toast.success("Time atualizado");
      } else {
        const body: CreateTeamRequest = { name: data.name, universeId };
        await api.post("/api/teams", body);
        toast.success("Time criado");
      }
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
            <Shirt size={22} style={{ color: "var(--mc-primary)" }} />
          </div>
          <DialogTitle className="text-xl font-extrabold" style={{ color: "var(--mc-text)" }}>
            {isEdit ? "Editar Time" : "Novo Time"}
          </DialogTitle>
          <DialogDescription style={{ color: "var(--mc-text-muted)" }}>
            {isEdit ? "Atualize os dados deste time" : "Adicione um time a este universo"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="team-name" className="block text-sm font-semibold" style={{ color: "var(--mc-text)" }}>
              Nome do time
            </label>
            <input
              id="team-name"
              {...register("name")}
              placeholder="Ex: Real Madruga"
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

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-60"
              style={{ background: "var(--mc-primary)" }}
              onMouseEnter={(e) => { if (!isSubmitting) (e.currentTarget as HTMLElement).style.background = "var(--mc-primary-dark)"; }}
              onMouseLeave={(e) => { if (!isSubmitting) (e.currentTarget as HTMLElement).style.background = "var(--mc-primary)"; }}
            >
              {isSubmitting ? "Salvando..." : isEdit ? "Salvar alterações" : "Adicionar time"}
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
