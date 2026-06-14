// Tipos alinhados com os DTOs do backend (MyCup-Backend).
// ASP.NET Core serializa em camelCase por padrão, então as chaves
// aqui batem com o JSON real retornado pela API.

// ─── Auth ─────────────────────────────────────────────────────────────────────
export type LoginRequest = {
  email: string;
  password: string;
};

// Espelha RegisterRequestDTO do backend (campos em camelCase no JSON).
// `email` é opcional no back; `confirmaSenha` é validado server-side contra `senha`.
export type RegisterRequest = {
  usuario: string;
  email?: string;
  senha: string;
  confirmaSenha: string;
};

// Espelha UserInfoResponseDTO do backend (camelCase no JSON).
export type UserInfo = {
  id: number;
  username: string;
};

// Espelha AuthResponseDTO do backend. `refreshToken` vem vazio no register
// (só o login o preenche hoje); `expiraEm` é ISO string.
export type AuthResponse = {
  token: string;
  refreshToken: string;
  expiraEm: string;
  user: UserInfo;
};

// ─── Erros da API ─────────────────────────────────────────────────────────────
// Espelha ErrorResponseDto — formato padrão de erro lido em api.ts (`error.message`).
export type ApiError = {
  message: string;
};

// Espelha ValidationErrorResponseDto — erros de validação por campo (ModelState).
export type ValidationErrorResponse = {
  message: string;
  errors: Record<string, string[]>;
};

// ─── Universos ────────────────────────────────────────────────────────────────
export type UniverseListItem = {
  id: number;
  name: string;
  players: number;
  championships: number;
  activeChampionships: number;
};

export type CreateUniverseRequest = {
  name: string;
  description?: string;
};

export type UniversePlayerStats = {
  id: number;
  name: string;
  championships: number;
  goals: number;
  assists: number;
  wins: number;
  draws: number;
  losses: number;
  matches: number;
};

export type UniverseDetail = {
  id: number;
  name: string;
  description?: string | null;
  players: UniversePlayerStats[];
  championships: ChampionshipSummary[];
};

// ─── Membros do universo (RBAC) ───────────────────────────────────────────────
// Cargos ranqueados: owner > admin > moderator.
export type UniverseRole = "owner" | "admin" | "moderator";

// Espelha UniverseMemberDto.
export type UniverseMember = {
  userId: number;
  name: string;
  email: string;
  role: UniverseRole;
};

// Espelha AddMemberDto — adiciona um usuário existente (resolvido por email).
export type AddMemberRequest = {
  email: string;
  role: UniverseRole;
};

// Espelha UpdateMemberRoleDto.
export type UpdateMemberRoleRequest = {
  role: UniverseRole;
};

// ─── Campeonatos ──────────────────────────────────────────────────────────────
// Os valores espelham exatamente o que o backend serializa (inglês, snake_case).
// Format.Type seed fixo: 1=round_robin, 2=knockout, 3=groups_knockout (ver FORMAT_IDS).
export type ChampionshipFormat = "round_robin" | "knockout" | "groups_knockout";
export type ChampionshipDistribution = "manual" | "sorteio" | "escolha";
// Status é derivado das partidas no backend (sem coluna): draft → ongoing → finished.
export type ChampionshipStatus = "draft" | "ongoing" | "finished";
// Status de partida/rodada: scheduled → ongoing → finished.
export type MatchStatus = "scheduled" | "ongoing" | "finished";

// Mapa format → formatId exigido pelo CreateChampionshipDto (seed em AppDbContext).
export const FORMAT_IDS: Record<ChampionshipFormat, number> = {
  round_robin: 1,
  knockout: 2,
  groups_knockout: 3,
};

export type ChampionshipSummary = {
  id: number;
  name: string;
  format: string;
  status: string;
  teams: number;
  currentRound: number;
  totalRounds: number;
};

// Espelha CreateChampionshipDto: { name, format, distribution, universeId, formatId }.
// `formatId` deriva de `format` via FORMAT_IDS; o backend pede ambos.
export type CreateChampionshipRequest = {
  name: string;
  format: ChampionshipFormat;
  distribution: ChampionshipDistribution;
  universeId: number;
  formatId: number;
};

// Espelha GenerateChampionshipDto (POST /championships/{id}/generate). Todos opcionais
// com default no backend; só os campos relevantes ao formato são usados. Persistidos
// como ChampionshipRule. Ver docs/be-008-fixtures.md §4.
export type GenerateChampionshipRequest = {
  doubleRound?: boolean;
  thirdPlace?: boolean;
  elimination?: "single" | "double";
  bracketSeeding?: "cross_adjacent" | "seeded_best_vs_worst";
  groupsCount?: number;
  groupSize?: number;
  qualifiersPerGroup?: number;
};

export type TeamSummary = {
  id: number;
  name: string;
};

// Espelha ChampionshipPlayerDto — jogador inscrito + time atribuído (null se sem time).
export type ChampionshipPlayer = {
  playerId: number;
  playerName: string;
  teamId: number | null;
  teamName: string | null;
};

export type UniverseSummary = {
  id: number;
  name: string;
};

export type StandingsRow = {
  position: number;
  team: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
};

// Espelha GroupStandingsDto — classificação de um grupo (formato groups_knockout).
export type GroupStandings = {
  group: string;
  standings: StandingsRow[];
};

// Espelha MatchSummaryDto. homeTeam/awayTeam são null enquanto a vaga do mata-mata
// não está definida (bracket pré-gerado). homePenalties/awayPenalties decidem empate.
export type MatchSummary = {
  id: number;
  homeTeam: string | null;
  awayTeam: string | null;
  homeGoals: number | null;
  awayGoals: number | null;
  homePenalties: number | null;
  awayPenalties: number | null;
  status: MatchStatus;
  date: string | null;
};

export type RoundSummary = {
  number: number;
  name: string | null;
  status: string;
  matches: MatchSummary[];
};

export type ChampionshipDetail = {
  id: number;
  name: string;
  slug?: string | null;
  universe: UniverseSummary;
  format: string;
  status: string;
  currentRound: number;
  totalRounds: number;
  teams: TeamSummary[];
  // Tabela única (round_robin). Vazia para os outros formatos.
  standings: StandingsRow[];
  // Tabela por grupo (groups_knockout). Vazia para os outros formatos.
  groups: GroupStandings[];
  rounds: RoundSummary[];
};

// ─── Estatísticas ─────────────────────────────────────────────────────────────
export type PlayerGoalStat = {
  playerId: number;
  name: string;
  team: string;
  goals: number;
};

export type PlayerAssistStat = {
  playerId: number;
  name: string;
  team: string;
  assists: number;
};

export type MatchScore = {
  matchId: number;
  homeTeam: string;
  awayTeam: string;
  homeGoals: number;
  awayGoals: number;
};

export type MatchComeback = {
  matchId: number;
  description: string;
};

export type TeamAverage = {
  teamId: number;
  name: string;
  average: number;
};

export type GoalsConcededPerMatch = {
  best: TeamAverage;
  worst: TeamAverage;
};

export type TeamWins = {
  teamId: number;
  name: string;
  wins: number;
};

export type ChampionshipStatistics = {
  topScorer: PlayerGoalStat;
  mostAssists: PlayerAssistStat;
  biggestWin: MatchScore;
  biggestComeback: MatchComeback;
  goalsPerMatch: number;
  goalsConcededPerMatch: GoalsConcededPerMatch;
  mostWins: TeamWins;
  topScorers: PlayerGoalStat[];
};

// ─── Bracket ──────────────────────────────────────────────────────────────────
export type BracketTeam = {
  id: number;
  name: string;
  goals: number | null;
};

export type BracketMatch = {
  id: number;
  position: number;
  homeTeam: BracketTeam | null;
  awayTeam: BracketTeam | null;
  winnerId: number | null;
  status: string;
  nextMatchId: number | null;
};

export type BracketRound = {
  name: string;
  matches: BracketMatch[];
};

export type Bracket = {
  rounds: BracketRound[];
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
export type DashboardSummary = {
  totalUniverses: number;
  pendingChampionships: number;
  activePlayers: number;
  pendingMatches: number;
};

export type RecentResult = {
  id: number;
  championship: string;
  round: string;
  homeTeam: string;
  awayTeam: string;
  homeGoals: number;
  awayGoals: number;
  date: string;
};

export type TopWinsPlayer = {
  playerId: number;
  name: string;
  wins: number;
};

export type TopGoalsPlayer = {
  playerId: number;
  name: string;
  goals: number;
};

export type TopLossesPlayer = {
  playerId: number;
  name: string;
  losses: number;
};

export type DashboardTopPlayers = {
  mostWins: TopWinsPlayer[];
  mostGoals: TopGoalsPlayer[];
  mostLosses: TopLossesPlayer[];
};

// ─── Players ──────────────────────────────────────────────────────────────────
export type PlayerListItem = {
  id: number;
  name: string;
};

// Espelha CreatePlayerDto. O backend usa rota plana (POST /api/players) e recebe
// o universo pelo corpo (`universeId`), não pela rota.
export type CreatePlayerRequest = {
  name: string;
  universeId: number;
};

export type UpdatePlayerRequest = {
  name: string;
};

// ─── Matches ──────────────────────────────────────────────────────────────────
// Espelha UpdateMatchResultDto (PUT /api/matches/{id}). Sem estatísticas individuais
// (backend só guarda placar final). Pênaltis decidem empate no mata-mata (nuláveis).
export type UpdateMatchResultRequest = {
  homeGoals: number;
  awayGoals: number;
  homePenalties?: number | null;
  awayPenalties?: number | null;
  status: MatchStatus;
};