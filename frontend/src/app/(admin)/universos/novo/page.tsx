"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/lib/api";
import { ChevronLeft, Globe } from "lucide-react";
import Link from "next/link";
import type { CreateUniverseRequest } from "@/lib/types";

const schema = z.object({
  name: z.string().min(1, "Nome obrigatório").max(120, "Máximo 120 caracteres"),
  description: z.string().max(500, "Máximo 500 caracteres").optional(),
});

type FormData = z.infer<typeof schema>;

export default function NovoUniversoPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    const body: CreateUniverseRequest = {
      name: data.name,
      description: data.description || undefined,
    };
    await api.post("/api/universes", body);
    router.push("/universos");
  }

  return (
    <div className="max-w-lg space-y-6">

      {/* Back */}
      <Link
        href="/universos"
        className="inline-flex items-center gap-1 text-sm font-medium transition-colors"
        style={{ color: "var(--mc-text-muted)" }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--mc-primary)")}
        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--mc-text-muted)")}
      >
        <ChevronLeft size={15} /> Universos
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold" style={{ color: "var(--mc-text)" }}>
          Novo Universo
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--mc-text-muted)" }}>
          Um universo é uma liga permanente com jogadores e histórico próprio
        </p>
      </div>

      {/* Form card */}
      <div
        className="rounded-2xl p-6 space-y-5"
        style={{ background: "var(--mc-surface)", border: "1px solid var(--mc-border)" }}
      >
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(0,91,170,0.08)" }}
        >
          <Globe size={22} style={{ color: "var(--mc-primary)" }} />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Nome */}
          <div className="space-y-1.5">
            <label
              htmlFor="name"
              className="block text-sm font-semibold"
              style={{ color: "var(--mc-text)" }}
            >
              Nome do universo
            </label>
            <input
              id="name"
              {...register("name")}
              placeholder="Ex: Pelada do Bairro"
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
              <p className="text-xs" style={{ color: "var(--mc-danger)" }}>
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Descrição */}
          <div className="space-y-1.5">
            <label
              htmlFor="description"
              className="block text-sm font-semibold"
              style={{ color: "var(--mc-text)" }}
            >
              Descrição <span className="font-normal" style={{ color: "var(--mc-text-muted)" }}>(opcional)</span>
            </label>
            <textarea
              id="description"
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
              <p className="text-xs" style={{ color: "var(--mc-danger)" }}>
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Actions */}
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
              onClick={() => router.back()}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
              style={{ border: "1px solid var(--mc-border)", color: "var(--mc-text)", background: "transparent" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--mc-bg)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
