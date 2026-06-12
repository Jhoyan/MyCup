# 📋 MyCup — Quadro de Tarefas

> Organização do trabalho por responsável. Cada pessoa tem sua seção; tarefas que dependem das duas pontas ficam em **Integração**.

---

## Como usar este arquivo

- Cada tarefa tem um **ID** (`FE-001`, `BE-001`, `INT-001`) — use-o em branches, commits e PRs.
- Marque o progresso na própria checkbox: `- [ ]` → `- [x]`.
- Ao concluir, mova para **✅ Concluído** no fim da seção (ou só marque, como preferirem).
- Para criar uma tarefa nova: pegue o **próximo ID livre** do prefixo e adicione no epic correspondente.

**Prioridade:** 🔴 Alta (bloqueia) · 🟡 Média · 🟢 Baixa
**Convenção de branch:** `tipo/ID-descricao-curta` (ex.: `feat/BE-003-championships-controller`)
**Commits:** [Conventional Commits](https://www.conventionalcommits.org/) (ex.: `feat(BE-001): universes CRUD`)

---

## 🔗 Integração — Contrato compartilhado (alinhar antes de tocar nas pontas)

> Estas precisam de acordo entre **Gabiroska** e **Jhoyan**. Resolver primeiro evita retrabalho.

- [ ] **INT-001** 🔴 Alinhar contrato do `/api/auth/register`.
  Front envia `{ name, email, password }` → [auth.ts:29](frontend/src/lib/auth.ts#L29); back espera `{ usuario, email, senha, confirmaSenha }` → [RegisterRequestDTO.cs](backend/DTOs/Authentication/RegisterRequestDTO.cs). **Registro está quebrado hoje.** Decidir os nomes dos campos e ajustar os dois lados.
- [ ] **INT-002** 🔴 Definir URL/porta padrão da API.
  Front aponta `http://localhost:5130` → [api.ts:1](frontend/src/lib/api.ts#L1), mas o backend faz `UseHttpsRedirection()` ([Program.cs](backend/Program.cs)) e expõe HTTPS em `7213`. Decidir: relaxar redirect em dev **ou** usar `https://localhost:7213` + cert dev. Documentar no README.
- [ ] **INT-003** 🟡 Padronizar formato de erro da API.
  Front lê `error.message` → [api.ts:33](frontend/src/lib/api.ts#L33). Back deve **sempre** responder `{ "message": "..." }` (ou ProblemDetails consistente) em erros. Ver **BE-012**.
- [ ] **INT-004** 🟢 Manter `frontend/src/lib/types.ts` alinhado aos DTOs do backend (fonte da verdade = Swagger).

---

## 🎨 Gabiroska — Frontend (`frontend/`)

> Next.js 16 + React 19 + Tailwind v4 + shadcn. **Antes de usar APIs novas do Next, ler os docs em `node_modules/next/dist/docs/`** (ver [AGENTS.md](frontend/AGENTS.md)).

### Epic A — Integração com a API real (substituir mocks)
> Hoje as telas rodam em cima de `src/lib/mocks/`. Trocar por chamadas via `api`.

- [ ] **FE-001** 🔴 Dashboard: trocar `mocks/dashboard.ts` por `api.get` em [dashboard/page.tsx](frontend/src/app/(admin)/dashboard/page.tsx).
- [x] **FE-002** 🔴 Universos: ligar list / detalhe / novo à API (`mocks/universos.ts` → real). Depende de **BE-001**.
- [ ] **FE-003** 🔴 Campeonatos: ligar list / detalhe / novo (`mocks/campeonatos.ts` → real); alimentar [BracketView.tsx](frontend/src/components/campeonato/BracketView.tsx) e [StatisticsView.tsx](frontend/src/components/campeonato/StatisticsView.tsx) com DTOs reais. Depende de **BE-003/008/009**.
- [x] **FE-004** 🔴 Jogadores: fluxo de criação ([universos/[universoid]/jogadores/novo](frontend/src/app/(admin)/universos/[universoid]/jogadores/novo/page.tsx)) ligado à API. Depende de **BE-002**.
- [ ] **FE-012** 🟢 Remover `frontend/src/lib/mocks/` quando todas as telas estiverem integradas.

### Epic B — Autenticação & sessão
- [x] **FE-005** 🔴 Ajustar `register()` ao contrato final (ver **INT-001**).
- [x] **FE-013** 🔴 Atualizar formulário de registro ([registrar/page.tsx](frontend/src/app/(auth)/registrar/page.tsx)) para o novo sistema: campos `usuario` (username), `email`, `senha` e `confirmaSenha` alinhados ao `RegisterRequestDTO` do back. Validar com `zod` (mínimo 6 chars na senha, regex no username `^[a-zA-Z0-9._-]+$`). Depende de **INT-001** e **FE-005**.
- [x] **FE-006** 🟡 Proteção de rotas: redirecionar para `/login` quando `!isAuthenticated()`; guard no [(admin)/layout.tsx](frontend/src/app/(admin)/layout.tsx).
- [ ] **FE-007** 🟡 Refresh automático: interceptar `401` no [api.ts](frontend/src/lib/api.ts) e chamar `/api/auth/refresh`. Depende de **BE-011**.
- [x] **FE-008** 🟢 Logout (`clearAuth`) na [Sidebar.tsx](frontend/src/components/admin/Sidebar.tsx) + feedback com `sonner`.

### Epic C — UX & qualidade
- [ ] **FE-009** 🟡 Estados de **loading / erro / vazio** em toda tela que faz fetch.
- [x] **FE-010** 🟡 Validação de formulários com `zod` + `react-hook-form` (já nas deps) em login, registrar, novo universo/campeonato/jogador.
- [x] **FE-011** 🟢 Consolidar tipos em [types.ts](frontend/src/lib/types.ts) espelhando os DTOs (ver **INT-004**).

---

## ⚙️ Jhoyan — Backend (`backend/`)

> .NET 8 + EF Core + PostgreSQL + JWT. Hoje **só existe o `AuthController`**; vários DTOs e alguns services já estão prontos, faltam os controllers que os expõem.

### Epic A — Expor a API (controllers faltando)
- [ ] **BE-003** 🔴 `ChampionshipsController` + `ChampionshipsService` (não existe) — DTOs prontos em [DTOs/Championships/](backend/DTOs/Championships/).
- [ ] **BE-004** 🔴 `TeamsController` + service — DTOs em [DTOs/Teams/](backend/DTOs/Teams/).
- [ ] **BE-005** 🔴 `MatchesController` + service: atualizar resultado e estatísticas — DTOs em [DTOs/Matches/](backend/DTOs/Matches/).
- [ ] **BE-006** 🔴 `DashboardController` + service — DTOs prontos em [DTOs/Dashboard/](backend/DTOs/Dashboard/).
- [ ] **BE-007** 🟡 `UserUniversesController` (membros / papéis) — service pronto em [UserUniversesService.cs](backend/Services/UserUniversesService.cs).

### Epic B — Domínio & regras (núcleo do produto)
- [x] **BE-008** ✅ Geração de chaveamento/fixtures por `Format`: `round_robin`, `knockout` (simples + dupla eliminação), `groups_knockout`. Bracket pré-gerado com preenchimento automático de vagas; `GET /championships/{id}/bracket`.
- [ ] **BE-009** 🟡 Classificação (`StandingsRowDto`) ✅ feita (plana p/ liga + por grupo); falta estatísticas (`ChampionshipStatisticsDto`, artilheiros/assistências).
- [x] **BE-010** ✅ Autorização por papel no Universo (`owner` / `admin` / `moderator` via `UserUniverse`). Leitura pública; criador vira owner; membros/conteúdo = admin; resultados = moderator; owner só é gerenciado por owner.

### Epic C — Auth & infra
- [x] **BE-011** ✅ Endpoint `POST /api/auth/refresh` com rotação. Secret separada (`Jwt:RefreshTokenSecretKey`), JWT 5min / refresh 7 dias, tabela `refresh_tokens` (multissessão, FK cascade). Refresh valida assinatura+validade+presença na tabela; o token usado é invalidado e um novo par é emitido. Login e registro persistem o refresh token.
- [x] **BE-012** ✅ Middleware global de exceções (`ExceptionMiddleware`, registrado primeiro no `Program.cs`) mapeia exceções de domínio (`NotFound`/`Conflict`/`BadRequest`/`Forbidden`/`Unauthorized`) para `ApiException` `{ statusCode, message }`. Controllers não fazem mais `catch`.
- [ ] **BE-013** 🟡 Resposta de validação padronizada com `ValidationErrorResponseDto` (já existe) a partir do `ModelState`.
- [ ] **BE-014** 🟢 Renomear arquivo `AutheticationController.cs` → `AuthenticationController.cs` (typo; a classe `AuthController` e a rota `api/auth` continuam iguais).
- [ ] **BE-015** 🟢 Seed dos `Formats` (`round_robin` / `knockout` / `groups_knockout`) via migration.
- [ ] **BE-016** 🟢 README do backend: setup (`dotnet user-secrets`, `dotnet ef database update`, portas, connection string).

### Epic D — Qualidade
- [ ] **BE-017** 🟢 Testes (xUnit) para o `AuthService` e para a geração de fixtures (**BE-008**).

---

## 🤝 Definition of Done (vale pros dois)

- [ ] Código compila/builda sem warnings novos.
- [ ] Caminho feliz testado manualmente (front: na tela / back: via Swagger).
- [ ] Sem segredo commitado (usar `user-secrets` no back, `.env.local` no front).
- [ ] PR pequeno, com o **ID da tarefa** no título, revisado pela outra pessoa.

---

_Última atualização: 2026-06-02_
