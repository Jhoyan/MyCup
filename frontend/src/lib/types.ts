// Tipos alinhados com os DTOs do backend (MyCup-Backend).
// ASP.NET Core serializa em camelCase por padrão, então as chaves
// aqui batem com o JSON real retornado pela API.

// ─── Auth ─────────────────────────────────────────────────────────────────────
export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
};

export type AuthResponse = {
  token: string;
  userId: number;
  name: string;
  email: string;
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

// ─── Campeonatos ──────────────────────────────────────────────────────────────
export type ChampionshipFormat = "pontos_corridos" | "mata_mata" | "grupos_mata_mata";
export type ChampionshipDistribution = "manual" | "sorteio" | "escolha";
export type ChampionshipStatus = "agendada" | "em_andamento" | "finalizada";
export type MatchStatus = "agendada" | "em_andamento" | "finalizada";

export type ChampionshipSummary = {
  id: number;
  name: string;
  format: string;
  status: string;
  teams: number;
  currentRound: number;
  totalRounds: number;
};

export type CreateChampionshipRequest = {
  name: string;
  format: ChampionshipFormat;
  distribution: ChampionshipDistribution;
  universeId: number;
};

export type TeamSummary = {
  id: number;
  name: string;
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

export type MatchSummary = {
  id: number;
  homeTeam: string;
  awayTeam: string;
  homeGoals: number | null;
  awayGoals: number | null;
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
  standings: StandingsRow[];
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

export type CreatePlayerRequest = {
  name: string;
};

export type UpdatePlayerRequest = {
  name: string;
};

// ─── Matches ──────────────────────────────────────────────────────────────────
export type MatchStatisticInput = {
  playerId: number;
  goals: number;
  assists: number;
};

export type UpdateMatchResultRequest = {
  homeGoals: number;
  awayGoals: number;
  status: MatchStatus;
  statistics: MatchStatisticInput[];
};