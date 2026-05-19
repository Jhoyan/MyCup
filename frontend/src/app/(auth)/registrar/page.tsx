"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { register as registerApi } from "@/lib/auth";
import { Eye, EyeOff, Trophy, Volleyball, ArrowLeft } from "lucide-react";

const schema = z
  .object({
    usuario: z
      .string()
      .min(3, "Usuário deve ter ao menos 3 caracteres")
      .max(50, "Máximo 50 caracteres")
      .regex(/^[a-zA-Z0-9._-]+$/, "Use apenas letras, números, ponto, hífen ou underscore"),
    email: z.email("Email inválido").optional().or(z.literal("")),
    senha: z.string().min(6, "Senha deve ter ao menos 6 caracteres"),
    confirmaSenha: z.string().min(1, "Confirme a senha"),
  })
  .refine((data) => data.senha === data.confirmaSenha, {
    path: ["confirmaSenha"],
    message: "As senhas não conferem",
  });

type FormData = z.infer<typeof schema>;

export default function RegistrarPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    setError(null);
    try {
      await registerApi({
        usuario: data.usuario,
        email: data.email || undefined,
        senha: data.senha,
        confirmaSenha: data.confirmaSenha,
      });
      router.push("/dashboard");
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: "var(--mc-bg)" }}>

      {/* Left panel — decorative */}
      <div
        className="hidden lg:flex flex-col justify-between w-[45%] p-12"
        style={{ background: "var(--mc-sidebar-bg)" }}
      >
        <div className="flex items-center gap-2">
          <Volleyball size={22} style={{ color: "#60a5fa" }} />
          <span className="text-white font-bold text-xl tracking-tight">
            My<span style={{ color: "#60a5fa" }}>Cup</span>
          </span>
        </div>

        <div className="space-y-6">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center"
            style={{ background: "rgba(0,91,170,0.25)" }}
          >
            <Trophy size={38} style={{ color: "#60a5fa" }} />
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-extrabold text-white leading-tight">
              Comece a organizar<br />seus campeonatos<br />em minutos
            </h2>
            <p style={{ color: "#64748b" }} className="text-sm leading-relaxed">
              Crie sua conta gratuitamente e tenha acesso a todas as funcionalidades.
            </p>
          </div>

          <ul className="space-y-3">
            {[
              "Universos ilimitados",
              "Pontos corridos, mata-mata e grupos",
              "Páginas públicas para compartilhar",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm" style={{ color: "#94a3b8" }}>
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[0.65rem] font-bold"
                  style={{ background: "rgba(0,179,65,0.2)", color: "#00b341" }}
                >
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs" style={{ color: "#334155" }}>
          © {new Date().getFullYear()} MyCup. Todos os direitos reservados.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <Volleyball size={20} style={{ color: "var(--mc-primary)" }} />
            <span className="font-bold text-lg tracking-tight" style={{ color: "var(--mc-text)" }}>
              My<span style={{ color: "var(--mc-primary)" }}>Cup</span>
            </span>
          </div>

          {/* Back to login */}
          <Link
            href="/login"
            className="inline-flex items-center gap-1 text-sm font-medium transition-colors"
            style={{ color: "var(--mc-text-muted)" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--mc-primary)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--mc-text-muted)")}
          >
            <ArrowLeft size={14} /> Voltar para o login
          </Link>

          {/* Heading */}
          <div>
            <h1 className="text-2xl font-extrabold" style={{ color: "var(--mc-text)" }}>
              Criar conta
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--mc-text-muted)" }}>
              Preencha seus dados para começar
            </p>
          </div>

          {/* Form */}
          <div
            className="rounded-2xl p-7 space-y-5"
            style={{ background: "var(--mc-surface)", border: "1px solid var(--mc-border)" }}
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

              {/* Usuário */}
              <SimpleField
                id="usuario"
                label="Usuário"
                type="text"
                autoComplete="username"
                placeholder="seu_usuario"
                error={errors.usuario?.message}
                registerProps={register("usuario")}
              />

              {/* Email (opcional) */}
              <SimpleField
                id="email"
                label="Email (opcional)"
                type="email"
                autoComplete="email"
                placeholder="seu@email.com"
                error={errors.email?.message}
                registerProps={register("email")}
              />

              {/* Senha */}
              <div className="space-y-1.5">
                <label
                  htmlFor="senha"
                  className="block text-sm font-semibold"
                  style={{ color: "var(--mc-text)" }}
                >
                  Senha
                </label>
                <div className="relative">
                  <input
                    id="senha"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    {...register("senha")}
                    placeholder="••••••••"
                    className="w-full px-3 py-2.5 pr-10 rounded-lg text-sm outline-none transition-all"
                    style={{
                      background: "var(--mc-bg)",
                      border: `1px solid ${errors.senha ? "var(--mc-danger)" : "var(--mc-border)"}`,
                      color: "var(--mc-text)",
                    }}
                    onFocus={(e) => {
                      if (!errors.senha) {
                        e.currentTarget.style.borderColor = "var(--mc-primary)";
                        e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,91,170,0.1)";
                      }
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = errors.senha ? "var(--mc-danger)" : "var(--mc-border)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: "var(--mc-text-muted)" }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.senha && (
                  <p className="text-xs" style={{ color: "var(--mc-danger)" }}>
                    {errors.senha.message}
                  </p>
                )}
              </div>

              {/* Confirma senha */}
              <SimpleField
                id="confirmaSenha"
                label="Confirme a senha"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                error={errors.confirmaSenha?.message}
                registerProps={register("confirmaSenha")}
              />

              {/* Error global */}
              {error && (
                <div
                  className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm"
                  style={{ background: "rgba(227,0,15,0.06)", border: "1px solid rgba(227,0,15,0.2)", color: "var(--mc-danger)" }}
                >
                  <span className="font-medium">{error}</span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-60 mt-1"
                style={{ background: "var(--mc-primary)" }}
                onMouseEnter={(e) => { if (!isSubmitting) (e.currentTarget as HTMLElement).style.background = "var(--mc-primary-dark)"; }}
                onMouseLeave={(e) => { if (!isSubmitting) (e.currentTarget as HTMLElement).style.background = "var(--mc-primary)"; }}
              >
                {isSubmitting ? "Criando conta..." : "Criar conta"}
              </button>
            </form>
          </div>

          <p className="text-xs text-center" style={{ color: "var(--mc-text-muted)" }}>
            Já tem uma conta?{" "}
            <Link href="/login" className="font-semibold hover:underline" style={{ color: "var(--mc-primary)" }}>
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Field helper ──────────────────────────────────────────────────────────────

function SimpleField({
  id, label, type, autoComplete, placeholder, error, registerProps,
}: {
  id: string;
  label: string;
  type: string;
  autoComplete: string;
  placeholder: string;
  error?: string;
  registerProps: ReturnType<ReturnType<typeof useForm<FormData>>["register"]>;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-sm font-semibold"
        style={{ color: "var(--mc-text)" }}
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        {...registerProps}
        placeholder={placeholder}
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
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error ? "var(--mc-danger)" : "var(--mc-border)";
          e.currentTarget.style.boxShadow = "none";
        }}
      />
      {error && (
        <p className="text-xs" style={{ color: "var(--mc-danger)" }}>
          {error}
        </p>
      )}
    </div>
  );
}
