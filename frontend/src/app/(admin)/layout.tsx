"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { isAuthenticated } from "@/lib/auth";
import Sidebar from "@/components/admin/Sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  // "checking" enquanto validamos a sessão no client; evita renderizar
  // o conteúdo protegido antes de saber se o usuário está autenticado.
  const [status, setStatus] = useState<"checking" | "authed">("checking");

  useEffect(() => {
    if (isAuthenticated()) {
      setStatus("authed");
    } else {
      router.replace("/login");
    }
  }, [router]);

  if (status === "checking") {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--mc-bg)" }}
      >
        <Loader2 className="animate-spin" size={28} style={{ color: "var(--mc-primary)" }} />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--mc-bg)" }}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header
          className="h-[70px] shrink-0 flex items-center px-8 gap-4"
          style={{
            background: "var(--mc-surface)",
            borderBottom: "1px solid var(--mc-border)",
          }}
        >
          <div className="flex-1" />
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: "var(--mc-bg)", color: "var(--mc-text-muted)" }}
          >
            🔔
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
