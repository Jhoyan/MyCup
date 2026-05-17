"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearAuth, getAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Globe, Trophy, LogOut, Volleyball } from "lucide-react";

const navSections = [
  {
    label: "Geral",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Organização",
    items: [
      { href: "/universos", label: "Universos", icon: Globe },
      { href: "/campeonatos", label: "Campeonatos", icon: Trophy },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = getAuth();

  function handleLogout() {
    clearAuth();
    router.push("/login");
  }

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  return (
    <aside
      className="w-[260px] shrink-0 flex flex-col h-screen sticky top-0"
      style={{ background: "var(--mc-sidebar-bg)" }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-2 px-5 h-[70px] shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
      >
        <Volleyball size={22} style={{ color: "#60a5fa" }} />
        <span className="text-white font-bold text-lg tracking-tight">
          My<span style={{ color: "#60a5fa" }}>Cup</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {navSections.map((section) => (
          <div key={section.label}>
            <p
              className="px-3 mb-1.5 text-[0.7rem] font-semibold uppercase tracking-widest"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              {section.label}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                        active ? "text-[#60a5fa]" : "text-[#94a3b8] hover:text-white hover:bg-[#1e293b]"
                      )}
                      style={active ? { background: "rgba(0,91,170,0.25)" } : undefined}
                    >
                      <Icon size={16} strokeWidth={2} />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div
        className="px-4 py-4 shrink-0"
        style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
            style={{ background: "var(--mc-primary)", color: "white" }}
          >
            {user?.name?.[0]?.toUpperCase() ?? "A"}
          </div>
          <div className="overflow-hidden">
            <p className="text-white text-sm font-medium truncate">{user?.name ?? "Admin"}</p>
            <p className="text-[#64748b] text-xs truncate">{user?.email ?? ""}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-[0.8rem] font-medium text-[#94a3b8] hover:text-white hover:bg-[#1e293b] transition-colors"
        >
          <LogOut size={14} />
          Sair
        </button>
      </div>
    </aside>
  );
}
