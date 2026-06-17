# MyCup — Backend

API REST que organiza **campeonatos** (de jogos tipo PES/FIFA, onde cada jogador controla um time inteiro) dentro de **universos** isolados, com geração automática de tabelas/chaveamentos, lançamento de resultados, classificação, estatísticas e controle de acesso por papéis.

Este documento explica a **arquitetura completa** e, principalmente, **o porquê** de cada decisão: o que cada parte busca resolver e por que foi feita daquela forma.

---

## 1. Stack e por que cada escolha

| Tecnologia | Por quê |
|---|---|
| **.NET 8 / ASP.NET Core** | LTS, performance, ecossistema maduro de DI/middleware/validação prontos para uma API REST. |
| **EF Core + Npgsql (PostgreSQL)** | ORM com *migrations* versionadas (o schema vira código revisável) e um banco relacional robusto — o domínio é fortemente relacional (universo → campeonato → fase → rodada → partida). |
| **JWT (Bearer)** | Autenticação *stateless* no token de acesso (escala bem, não precisa de sessão no servidor) somada a um *refresh token* **com estado** no banco, para conseguir invalidação e multissessão (ver §6). |
| **BCrypt** | Hash de senha com *work factor* 12 — lento de propósito contra força bruta. |

---

## 2. Estrutura de pastas

```
backend/
├── Controllers/      # Camada HTTP: fina, só traduz request→service→response
├── Services/         # Regras de negócio (uma classe por agregado)
│   ├── Authentication/   # AuthService, TokenManager, TokenHelpers
│   ├── Authorization/    # UniverseAuthorizer (RBAC)
│   └── Fixtures/         # Motor de geração de chaveamentos (BE-008)
├── Models/           # Entidades de domínio (mapeadas pelo EF)
├── DTOs/             # Contratos de entrada/saída (nunca expõem entidades)
├── Data/             # AppDbContext (mapeamentos, chaves, relacionamentos, seed)
├── Errors/           # Exceções de domínio + ApiException (payload de erro)
├── Middleware/       # ExceptionMiddleware (tratamento global)
├── Migrations/       # Histórico de schema (EF Core)
└── Program.cs        # Composição: DI, pipeline HTTP, JWT, CORS, Swagger
```

---

## 3. Arquitetura em camadas

O fluxo é sempre **Controller → Service → DbContext**. Cada camada tem uma responsabilidade única:

- **Controllers** — finos. Recebem o DTO, chamam **um** método de service e devolvem `Ok(...)`/`CreatedAtAction(...)` com mensagens em português. **Não** contêm regra de negócio nem `try/catch`. *Por quê:* manter o HTTP separado do domínio facilita testar a regra sem subir a web, e evita duplicar lógica entre endpoints.
- **Services** — uma classe por **agregado raiz** (`Universe`, `Championship`, `Team`, `Match`, `UserUniverse`, `Dashboard`, `Auth`). Concentram as regras e **lançam exceções** quando algo é inválido. *Por quê:* só os agregados principais ganham service/controller próprios; entidades internas (`Phase`, `Group`, `Round`, `ChampionshipRule`, `PlayerChampionship`…) são gerenciadas **dentro** do agregado dono — elas não fazem sentido isoladas, então não viram CRUD público.
- **DTOs** — todo dado que entra/sai passa por DTO. *Por quê:* desacopla o contrato da API do schema do banco (posso evoluir a entidade sem quebrar o cliente) e evita vazar campos sensíveis (ex.: `PasswordHash`).

### Tratamento de erros centralizado

Em vez de cada controller tratar erro, os services lançam **exceções de domínio** (`NotFoundException`, `ConflictException`, `BadRequestException`, `ForbiddenException`, `UnauthorizedException`) e um único **`ExceptionMiddleware`** (registrado **primeiro** no pipeline) as mapeia para o HTTP correto e serializa um `ApiException` `{ statusCode, message }`.

*Por quê:* um único ponto de mapeamento evita `catch` repetido nos controllers, garante que **todo** erro saia no mesmo formato `{ message }` (contrato com o front) e impede vazar *stack trace* em produção (em dev, o erro 500 inclui o detalhe para debug).

### Validação de entrada padronizada

A validação de `ModelState` (DataAnnotations nos DTOs) é interceptada no `Program.cs` por um `InvalidModelStateResponseFactory` que devolve `ValidationErrorResponseDto` → `{ message, errors: { campo: [...] } }`.

*Por quê:* o comportamento padrão do `[ApiController]` devolve `ProblemDetails`, que tem um formato diferente do resto da API. Padronizando, **todo** erro (validação ou domínio) tem o campo `message`, e o front lê de um jeito só.

---

## 4. Pipeline HTTP (`Program.cs`)

A ordem importa:

1. **`ExceptionMiddleware`** primeiro — para capturar exceções de **qualquer** etapa seguinte.
2. Swagger (só em Development).
3. `UseHttpsRedirection` → `UseCors` → `UseAuthentication` → `UseAuthorization` → `MapControllers`.

DI: cada service é `AddScoped` (um por request — casa com o tempo de vida do `DbContext`). Os geradores de chaveamento são registrados como **múltiplas** implementações de `IFixtureGenerator` e injetados como `IEnumerable<IFixtureGenerator>` (ver §7). `AddHttpContextAccessor()` existe para o `UniverseAuthorizer` enxergar o usuário do token dentro dos services.

---

## 5. Modelo de dados e decisões de modelagem

Hierarquia central:

```
User ──< UserUniverse >── Universe ──< Championship ──< Phase ──< Round ──< Match
                              │            │              └──< Group ──< GroupTeam
                              ├──< Team     ├──< ChampionshipTeam
                              └──< Player   ├──< ChampionshipRule
                                            └──< PlayerChampionship (Player↔Team no campeonato)
Format ──< Championship          User ──< RefreshToken
```

Decisões e o porquê:

- **Times com escopo por universo** (`Team.UniverseId`). *Por quê:* o "Flamengo" de um grupo de amigos não é o do outro; listagens e validações são sempre filtradas pelo universo.
- **`Championship.Status` / `CurrentRound` / `TotalRounds` são calculados em tempo de consulta**, não há coluna no banco. Regra: sem partidas = `draft`; alguma finalizada = `ongoing`; todas finalizadas = `finished`. *Por quê:* status derivado de partidas **nunca** fica inconsistente com a realidade — não há como "esquecer" de atualizar uma coluna.
- **`Slug` autogerado** a partir do nome, único dentro do universo. *Por quê:* URL amigável sem o usuário precisar inventar/garantir unicidade.
- **Jogador controla um time inteiro** (estilo PES/FIFA). A relação `PlayerChampionship` liga *Player → Team* **dentro de um campeonato**. O time pode ser atribuído **manualmente** ou por **sorteio** aleatório (`Championship.Distribution` registra o modo). *Por quê:* é o modelo real do jogo; o mesmo jogador pode usar times diferentes em campeonatos diferentes.
- **Sem estatísticas individuais.** Não existem gols/assistências/cartões por jogador — só o **placar final** da partida. Qualquer "métrica de jogador" é, na verdade, a métrica do **time que ele controlou**, derivada do resultado (ver §8). *Por quê:* o jogo não expõe eventos individuais; modelar isso seria inventar dado que não existe.
- **Políticas de exclusão pensadas por entidade:**
  - `Championship` → *cascade* (apaga fases/rodadas/partidas/regras/inscrições).
  - `Universe` → *cascade* total.
  - `Player` → **soft delete** (`IsActive = false`) — preserva o histórico nas inscrições/partidas.
  - `Team` → **bloqueado com 409** se já estiver referenciado por partida/grupo/inscrição — apagar corromperia históricos.
- **Tabelas em `snake_case`** via `ToTable`, configuração de chaves/FKs/índices centralizada no `AppDbContext.OnModelCreating`. *Por quê:* convenção comum em Postgres e um único lugar para entender o schema.
- **Identificadores de código em inglês**, mensagens ao usuário (validação/erros) em **português**. *Por quê:* código universal/legível; produto falando a língua do usuário.

---

## 6. Autenticação e autorização

### 6.1 Token de acesso (JWT, curto)

`POST /api/auth/login` e `/register` devolvem um **access token** JWT (claim `sub` = id do usuário), assinado com `Jwt:SecretKey`, válido por **5 minutos**. *Por quê tão curto:* se o token vazar, a janela de abuso é pequena; a renovação frequente é resolvida pelo refresh token.

### 6.2 Refresh token com rotação e multissessão (BE-011)

O ponto delicado da autenticação. Decisões:

- **Secret separada** (`Jwt:RefreshTokenSecretKey`). *Por quê:* o refresh token tem poder maior (gera novos acessos) e vida longa; isolar a chave evita que comprometer uma comprometa a outra. Comprovadamente separadas: usar um access token como refresh é rejeitado com 401.
- **Validade de 7 dias** e **`jti` único (GUID)** em cada refresh token. *Por quê o jti:* dois logins do mesmo usuário no mesmo segundo gerariam *strings* idênticas; o GUID garante que cada token seja distinto — pré-requisito para multissessão e rotação.
- **Tabela `refresh_tokens`** (uma linha por sessão ativa, FK para `users` com *cascade*, índice no `Token`). *Por quê com estado:* JWT puro é *stateless* e **não dá pra invalidar** antes de expirar. Guardando o token emitido, o servidor consegue (a) saber se foi ele que emitiu e (b) **revogar** uma sessão apagando a linha. Várias linhas por usuário = **multissessão** (logar no celular e no PC ao mesmo tempo).
- **Rotação a cada uso.** `POST /api/auth/refresh` valida **assinatura + validade + presença na tabela**; se passar, **apaga** o refresh token usado e emite um par novo (access + refresh). *Por quê:* se um refresh token vaza e é usado, o legítimo para de funcionar no próximo uso (rotação detecta reuso) e o atacante não consegue reusar o mesmo token (já foi removido).

Login e registro **persistem** o refresh token na tabela.

### 6.3 RBAC por universo (BE-010)

Cada `UserUniverse` tem `(UserId, UniverseId)` como **chave composta** — isso, por si só, garante a regra de negócio de **um único cargo por usuário em cada universo**. Cargos ranqueados: `owner > admin > moderator`.

A checagem vive no **`UniverseAuthorizer`** (service *scoped*): lê o usuário do JWT (via `IHttpContextAccessor`) e expõe `RequireRoleAsync(universeId, cargoMínimo)`, que lança **403** se o usuário não for membro ou não tiver cargo suficiente.

Política aplicada (decidida com o cliente):

| Ação | Cargo mínimo |
|---|---|
| **Ler** universos/campeonatos/times/jogadores/partidas/bracket/estatísticas | **Público** (sem login) |
| Criar universo | qualquer logado → vira **owner** |
| Gerenciar membros/conteúdo (campeonatos, times, jogadores, gerar chaveamento) | **admin** |
| Lançar resultado de partida | **moderator** |
| Excluir universo / conceder-mudar-remover o cargo *owner* | **owner** |

Decisões e porquês:

- **Leitura pública.** Acompanhar a competição (tabela, chaveamento, resultados) não exige conta — o cliente quis que qualquer um pudesse seguir um universo/campeonato. Endpoints GET levam `[AllowAnonymous]`; só a **lista de membros** e o **dashboard** (escopado ao usuário) seguem autenticados.
- **Checagem no service, não em atributo.** A maioria das ações tem `championshipId`/`teamId`/`matchId` na rota, não `universeId`. Como o service sabe resolver "qual universo é o dono desta partida", a verificação fica lá (cada método resolve o `universeId` da entidade e chama o `RequireRoleAsync`). *Por quê:* um atributo de rota não conseguiria resolver o universo a partir de um id de partida sem ir ao banco — fica mais limpo no service.
- **Criador vira owner** ao criar o universo. *Por quê:* todo universo precisa de pelo menos um dono desde o nascimento; o sistema sempre impede remover/rebaixar o **último** owner.
- **Moderator = "mesário".** Só lança resultados; não mexe na estrutura. *Por quê:* separa quem organiza (admin) de quem só registra os jogos.

---

## 7. Motor de geração de chaveamentos (BE-008) — o coração do backend

É a parte mais complexa, e a que mais teve decisão arquitetural. O objetivo: a partir do `Format` do campeonato e do conjunto de times, **gerar fases → rodadas → partidas** automaticamente, em `POST /championships/{id}/generate`.

### 7.1 A decisão central: bracket **pré-gerado** com **vínculos**, não round-by-round

A pergunta-chave foi: *como representar um mata-mata onde a semifinal é "vencedor(QF1) × vencedor(QF2)" se esses times ainda não são conhecidos?*

Houve duas opções:

1. **Round-by-round** — gerar só a rodada atual e criar a próxima quando a anterior terminar.
2. **Bracket completo com vínculos** — gerar **todas** as partidas de uma vez; as futuras nascem com **vagas vazias** ligadas às partidas que as alimentam.

Escolhemos a **opção 2**. *Por quê:* o requisito explícito do cliente foi poder **lançar resultados de qualquer fase sem precisar fechar a fase anterior inteira**. Com vínculos, uma partida fica jogável assim que **os seus dois alimentadores específicos** terminam — sem esperar o resto da rodada (terminar QF1 e QF2 já libera a SF1, mesmo com QF3/QF4 pendentes).

### 7.2 Modelo da partida que viabiliza isso

A entidade `Match` ganhou:

- `HomeTeamId`/`AwayTeamId` **nuláveis** — a vaga fica vazia até ser definida.
- `HomeSourceMatchId`/`AwaySourceMatchId` (auto-FK para `Match`) + `Home/AwaySourceOutcome` (`"winner"`/`"loser"`) — "esta vaga recebe o **vencedor** (ou **perdedor**) daquela partida".
- `HomeSourceGroupId`/`AwaySourceGroupId` + `Home/AwaySourceGroupRank` — "esta vaga recebe o **N-ésimo colocado** daquele grupo" (usado no `groups_knockout`).
- `HomePenalties`/`AwayPenalties` (nuláveis) — pênaltis decidem empate no mata-mata (não há entidade de prorrogação; guardamos só o placar final + os pênaltis quando houver).
- `Round.Bracket` (`upper`/`lower`/`grand_final`/`third_place`) — para o front agrupar as chaves.

*Por quê auto-FK com `OnDelete: SetNull`:* ao regenerar/excluir, as partidas referenciam umas às outras; `SetNull` evita que a FK trave o apagamento em cascata.

### 7.3 Propagação (preenchimento de vagas)

O avanço **não cria rodadas** — ele **preenche vagas**. Quando um resultado é salvo, `FixturesService.PropagateResultAsync` roteia por tipo de fase:

- **Mata-mata** → resolve vencedor/perdedor (placar, com pênaltis no empate) e preenche as vagas das partidas que apontam para ela (ou as **limpa**, se o resultado for revertido). Uma partida que **já** tem resultado nunca é sobrescrita.
- **Grupos** → quando **todas** as partidas de um grupo terminam, classifica o grupo e preenche as vagas do mata-mata semeadas por aquele grupo.

*Por quê é elegante:* a mesma lógica de winner/loser serve para o mata-mata simples, para a **dupla eliminação** (o perdedor "cai" para a chave de baixo via `outcome="loser"`) e para a **disputa de 3º lugar** — sem código novo de avanço.

### 7.4 Arquitetura plugável dos formatos

`IFixtureGenerator` (um por formato), todos injetados como `IEnumerable` e indexados por `Format.Type`. *Por quê:* adicionar um formato novo é registrar uma classe, sem tocar no coordenador (`FixturesService`).

#### `round_robin` (pontos corridos)
Método do círculo (Berger): turno único ou ida-e-volta (`double_round`); número ímpar de times gera um *bye* por rodada. Todos os jogos nascem com times reais.

#### `knockout` (mata-mata)
- **Simples:** chave completa pré-gerada. Rodada 1 com jogos reais (sorteio aleatório); quando o número de times não é potência de 2, os excedentes recebem **bye** e entram já na 2ª fase (intercalados para um bye encarar um vencedor, não outro bye). Rodadas seguintes nascem com vagas vazias ligadas pelo vencedor. **3º lugar** (opcional) é alimentado pelos perdedores das semifinais.
- **Dupla eliminação:** chave de **vencedores** (`upper`) + chave de **perdedores** (`lower`, com o interleave canônico *minor/major*) + **grande final** (`grand_final`, MVP de final única, sem *reset*). Total de `2N−2` partidas. Hoje exige número de times **potência de 2** (bye em dupla eliminação é backlog).

#### `groups_knockout` (grupos + mata-mata)
Duas fases: **grupos** (sorteio aleatório, pontos corridos por grupo, cada partida com `GroupId`) + **mata-mata** cuja primeira rodada é **semeada pela classificação dos grupos**, não por resultados de partida. Semeadura `cross_adjacent` (`1ºA×2ºB`, `1ºB×2ºA`, …). *MVP:* grupos em potência de 2 (1, 2, 4, 8, …), 2 classificados por grupo, semeadura `cross_adjacent`. Com **1 grupo** o formato vira pontos corridos + final (`1º×2º`) — equivale a liga + mata-mata sem precisar de um modo novo.

### 7.5 Critérios de desempate (classificação)

Cadeia ordenada e determinística: **pontos → saldo de gols → gols pró → vitórias → id do time** (último critério como "sorteio" determinístico). Empate em mata-mata é decidido por **pênaltis**; sem os pênaltis, a partida não avança (erro pedindo o resultado da disputa).

---

## 8. Classificação e estatísticas (BE-009)

- **Classificação** (`StandingsRowDto`): para `round_robin` é uma tabela única; para `groups_knockout` é **uma tabela por grupo** (`Groups`), calculada só com os jogos daquele grupo. Para `knockout` a visão é o **bracket** (`GET /championships/{id}/bracket`).
- **Estatísticas** (`GET /championships/{id}/statistics`): **artilheiros** (jogador ranqueado pelos gols do **time que ele controla**), **mais vitórias**, **maior goleada**, **gols por jogo**, **melhor/pior defesa**.
- **`MostAssists` e `BiggestComeback` ficam vazios de propósito** — não há dado de assistência (sem eventos individuais) nem progressão dentro do jogo (só o placar final). *Por quê não inventar:* manter o DTO honesto; preencher com número fabricado seria mentir.

Tudo é **calculado em tempo de consulta** a partir das partidas finalizadas — coerente com a decisão de não materializar status/estatística no banco.

---

## 9. Convenções

- **Commits** em inglês, modo imperativo, primeira linha ≤ 72 chars; corpo em *bullets* (`*`) explicando *o quê* e *porquê*.
- **Migrations:** toda mudança de schema é uma migration versionada (`dotnet ef migrations add`).
- **Identificadores em inglês**, mensagens ao usuário em português.

---

## 10. Setup e execução

### Pré-requisitos
- .NET 8 SDK
- PostgreSQL rodando

### Configuração (segredos fora do versionamento)
A `connection string` e as chaves JWT **não** ficam no `appsettings.json` (lá há só o placeholder `"USER SECRETS"`). Use *user-secrets*:

```bash
cd backend
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Port=5432;Database=mycup_db;Username=postgres;Password=SUA_SENHA"
dotnet user-secrets set "Jwt:SecretKey" "<chave-aleatoria-forte>"
dotnet user-secrets set "Jwt:RefreshTokenSecretKey" "<outra-chave-aleatoria-forte>"
```

Tempos e issuer/audience ficam no `appsettings.json` (`Jwt:ExpirationTimeInMinutes` = 5, `RefreshExpirationTimeInHours` = 168).

### Banco
As migrations criam todo o schema **e** semeiam os `Format` (`round_robin`, `knockout`, `groups_knockout`) — então um banco zerado já consegue criar campeonatos:

```bash
dotnet ef database update
```

### Rodar
```bash
dotnet run --launch-profile http     # http://localhost:5130 (Swagger em /swagger)
```
Há também o perfil `https` (`https://localhost:7213`). O front aponta para a porta `5130` em desenvolvimento.

---

## 11. Testes

Hoje cada feature foi validada por **testes de integração end-to-end via HTTP** (scripts que sobem a API, exercitam o fluxo completo e conferem cada resposta — inclusive comparando estatísticas com o cálculo feito localmente). Um **projeto de testes xUnit** (`AuthService` + geração de chaveamentos) é o próximo passo (BE-017), num projeto separado dentro da *solution*.
