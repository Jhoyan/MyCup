# MyCup — Frontend

Painel administrativo do MyCup. **Next.js 16 + React 19 + Tailwind v4 + shadcn**.

> Antes de usar APIs novas do Next, ler os docs em `node_modules/next/dist/docs/` (ver [AGENTS.md](AGENTS.md)).

## Rodar em desenvolvimento

```bash
npm install
npm run dev      # http://localhost:3000
```

A aplicação espera o **backend rodando em `http://localhost:5130`** (perfil `http`). Suba o backend antes:

```bash
cd ../backend
dotnet run --launch-profile http
```

### Portas e CORS

| App | URL |
|-----|-----|
| Frontend (Next dev) | `http://localhost:3000` |
| Backend (API) | `http://localhost:5130` |

O backend libera CORS para `http://localhost:3000`, então **rodar o front na porta padrão `3000` já funciona** — sem cert HTTPS nem ajuste de redirect. Não use o perfil `https` (`7213`) em dev.

### Variável de ambiente

A URL da API tem default `http://localhost:5130`. Para apontar para outro host, crie `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:5130
```

## Autenticação

Login/registro guardam `token` + `refreshToken` no `localStorage`. O access token (JWT) dura ~5 min; o [api.ts](src/lib/api.ts) renova sozinho num `401` via `/api/auth/refresh` (rotação) e repete a requisição — a sessão segue até o refresh token expirar (7 dias).

## Estrutura

```
src/
├── app/
│   ├── (auth)/        # login, registrar
│   └── (admin)/       # dashboard, universos, campeonatos (protegido por guard)
├── components/        # UI (shadcn) + componentes de domínio (campeonato/, admin/)
└── lib/               # api.ts, auth.ts, types.ts (espelha os DTOs do backend)
```
