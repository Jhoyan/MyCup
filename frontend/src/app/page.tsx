import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-gray-50">
      <h1 className="text-4xl font-bold">EasyCup</h1>
      <p className="text-muted-foreground text-center max-w-sm">
        Crie e gerencie campeonatos de futebol para o seu grupo.
      </p>
      <div className="flex gap-3">
        <Link
          href="/login"
          className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
        >
          Entrar
        </Link>
        <Link
          href="/dashboard"
          className="inline-flex items-center rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
        >
          Dashboard
        </Link>
      </div>
    </div>
  );
}
