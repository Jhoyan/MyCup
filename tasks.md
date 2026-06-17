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

- [x] **INT-001** ✅ Contrato do `/api/auth/register` alinhado: back espera `{ usuario, email?, senha, confirmaSenha }`; front ([auth.ts](frontend/src/lib/auth.ts) + [types.ts](frontend/src/lib/types.ts)) já envia nesse formato. Login = `{ email, password }`; resposta `{ token, refreshToken, expiraEm, user }`.
- [x] **INT-002** ✅ URL/porta padrão da API documentada no [frontend/README.md](frontend/README.md): front em `:3000`, back em `http://localhost:5130`, CORS já alinhado (perfil `http`, não usar `https`/`7213` em dev).
- [x] **INT-003** ✅ Formato de erro padronizado pelo backend (**BE-012/013**): todo erro sai como `{ message }`; o front lê `error.message` em [api.ts](frontend/src/lib/api.ts).
- [ ] **INT-004** 🟢 Manter `frontend/src/lib/types.ts` alinhado aos DTOs do backend (fonte da verdade = Swagger).

---

## 🎨 Gabiroska — Frontend (`frontend/`)

> Next.js 16 + React 19 + Tailwind v4 + shadcn. **Antes de usar APIs novas do Next, ler os docs em `node_modules/next/dist/docs/`** (ver [AGENTS.md](frontend/AGENTS.md)).

### Epic A — Integração com a API real (substituir mocks)
> Hoje as telas rodam em cima de `src/lib/mocks/`. Trocar por chamadas via `api`.

- [x] **FE-001** ✅ Dashboard ligada à API (`summary`/`recent-results`/`top-players`; recentes agregados por universo). PT→EN.
- [x] **FE-002** 🔴 Universos: ligar list / detalhe / novo à API (`mocks/universos.ts` → real). Depende de **BE-001**.
- [x] **FE-003** ✅ Campeonatos ligados à API: lista (agregada), detalhe (classificação/grupos + bracket + estatísticas), criação → configuração (times/jogadores/sorteio/gerar). BracketView e StatisticsView com DTOs reais. Inclui lançamento de resultado (editor completo + edição rápida inline na lista e no bracket).
- [x] **FE-004** 🔴 Jogadores: fluxo de criação ([universos/[universoid]/jogadores/novo](frontend/src/app/(admin)/universos/[universoid]/jogadores/novo/page.tsx)) ligado à API. Depende de **BE-002**.
- [x] **FE-012** ✅ `frontend/src/lib/mocks/` removido — todas as telas usam a API real.
- [x] **FE-014** ✅ UI de membros/RBAC do universo ([universos/[universoid]/membros](frontend/src/app/(admin)/universos/[universoid]/membros/page.tsx)) ligada ao `UserUniversesController` (BE-007): listar, adicionar por e-mail com papel, trocar papel e remover. Link no header do detalhe do universo.

### Epic B — Autenticação & sessão
- [x] **FE-005** 🔴 Ajustar `register()` ao contrato final (ver **INT-001**).
- [x] **FE-013** 🔴 Atualizar formulário de registro ([registrar/page.tsx](frontend/src/app/(auth)/registrar/page.tsx)) para o novo sistema: campos `usuario` (username), `email`, `senha` e `confirmaSenha` alinhados ao `RegisterRequestDTO` do back. Validar com `zod` (mínimo 6 chars na senha, regex no username `^[a-zA-Z0-9._-]+$`). Depende de **INT-001** e **FE-005**.
- [x] **FE-006** 🟡 Proteção de rotas: redirecionar para `/login` quando `!isAuthenticated()`; guard no [(admin)/layout.tsx](frontend/src/app/(admin)/layout.tsx).
- [x] **FE-007** 🟡 Refresh automático: [api.ts](frontend/src/lib/api.ts) intercepta `401`, chama `/api/auth/refresh` (refresh único em voo p/ não furar a rotação), persiste o novo par e repete a requisição. Se o refresh falhar, limpa a sessão e manda pro `/login`.
- [x] **FE-008** 🟢 Logout (`clearAuth`) na [Sidebar.tsx](frontend/src/components/admin/Sidebar.tsx) + feedback com `sonner`.

### Epic C — UX & qualidade
- [x] **FE-009** ✅ Estados de **loading / erro / vazio** nas telas de dados (dashboard, universos, campeonatos, partidas, configurar, membros). Forms usam `toast` + `isSubmitting`.
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
- [x] **BE-009** ✅ Classificação (`StandingsRowDto`, plana p/ liga + por grupo) e estatísticas (`GET /championships/{id}/statistics`): artilheiros (jogador via time que controla), maior goleada, gols/jogo, melhor/pior defesa, mais vitórias. `MostAssists`/`BiggestComeback` ficam vazios — não há dado de origem (sem eventos individuais; só placar final).
- [x] **BE-010** ✅ Autorização por papel no Universo (`owner` / `admin` / `moderator` via `UserUniverse`). Leitura pública; criador vira owner; membros/conteúdo = admin; resultados = moderator; owner só é gerenciado por owner.
- [ ] **BE-018** 🟡 Estatísticas de jogador no `UniverseDetailDto` (`GET /api/universes/{id}`). Hoje [UniversesService.GetByIdAsync](backend/Services/UniversesService.cs#L85) só preenche `Championships`; `Matches/Wins/Draws/Losses/Goals` ficam **0** → o front mostra tudo zerado e "0% aproveitamento". Computar em tempo de consulta, agregando por jogador via o time que ele controla (`PlayerChampionship` → partidas finalizadas), mesma lógica de **BE-009**. `Assists` deve continuar vazio/omitido (sem evento individual — coluna já removida no front). De quebra, o mesmo método zera `Status/CurrentRound/TotalRounds` nos `ChampionshipSummaryDto` desse endpoint (linha 96-99) — reaproveitar o cálculo derivado já existente.
- [x] **BE-019** ✅ Reaproveitar jogador entre universos — resolvido pela **abordagem (a)** via **BE-020**: a mesma pessoa tem N jogadores (1 por universo) amarrados pelo mesmo `Player.UserId`. (Abordagens (b) many-to-many e (c) jogador global descartadas — contrariam o modelo "1 jogador por universo".)
- [x] **BE-020** ✅ Vincular jogador a usuário via convite/notificação. Tabela focada `PlayerLinkRequest` (`player_link_requests`): admin do universo solicita (por e-mail) que um usuário assuma um jogador; o alvo aceita (preenche `Player.UserId`) ou recusa (some da lista). Endpoints `POST /api/players/{playerId}/link-requests`, `GET /api/players/link-requests`, `POST /api/players/link-requests/{id}/accept|decline`. Invariante "1 jogador por usuário por universo" garantido por índice único parcial em `players(UniverseId, UserId)`. Front (UI de notificações) fica a cargo do FE. Migration `AddPlayerLinkRequests`.

### Epic C — Auth & infra
- [x] **BE-011** ✅ Endpoint `POST /api/auth/refresh` com rotação. Secret separada (`Jwt:RefreshTokenSecretKey`), JWT 5min / refresh 7 dias, tabela `refresh_tokens` (multissessão, FK cascade). Refresh valida assinatura+validade+presença na tabela; o token usado é invalidado e um novo par é emitido. Login e registro persistem o refresh token.
- [x] **BE-012** ✅ Middleware global de exceções (`ExceptionMiddleware`, registrado primeiro no `Program.cs`) mapeia exceções de domínio (`NotFound`/`Conflict`/`BadRequest`/`Forbidden`/`Unauthorized`) para `ApiException` `{ statusCode, message }`. Controllers não fazem mais `catch`.
- [x] **BE-013** ✅ Resposta de validação padronizada: `ApiBehaviorOptions.InvalidModelStateResponseFactory` no `Program.cs` monta `ValidationErrorResponseDto` (`{ message, errors: { campo: [...] } }`) a partir do `ModelState`. Mantém o campo `message` consistente com o middleware (INT-003).
- [x] **BE-014** ✅ Arquivo renomeado para `AuthenticationController.cs` (classe `AuthController` e rota `api/auth` inalteradas).
- [x] **BE-015** ✅ Seed dos `Formats` via `HasData` + migration `SeedFormats`.
- [x] **BE-016** ✅ README de arquitetura do backend ([backend/README.md](backend/README.md)): stack, camadas, modelo de dados, auth/refresh/RBAC, motor de chaveamentos, estatísticas e setup — com o *porquê* de cada decisão.

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
