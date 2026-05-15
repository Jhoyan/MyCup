// Mocks para a tela de Dashboard. Estrutura idêntica aos DTOs do backend.
// Quando os endpoints estiverem prontos, substitui cada export por uma chamada
// `api.get<...>("/api/dashboard/...")`.

import type {
  DashboardSummary,
  RecentResult,
  ChampionshipSummary,
  DashboardTopPlayers,
} from "@/lib/types";

export const mockDashboardSummary: DashboardSummary = {
  totalUniverses: 3,
  pendingChampionships: 5,
  activePlayers: 24,
  pendingMatches: 7,
};

export const mockRecentResults: RecentResult[] = [
  { id: 1,  championship: "Campeonato Verão 2025", round: "Rodada 3", homeTeam: "Os Brabos",     awayTeam: "Trovão Azul",  homeGoals: 3, awayGoals: 1, date: "2026-05-12T19:00:00Z" },
  { id: 2,  championship: "Campeonato Verão 2025", round: "Rodada 3", homeTeam: "Falcões",       awayTeam: "Esquadrão FC", homeGoals: 2, awayGoals: 2, date: "2026-05-12T20:00:00Z" },
  { id: 3,  championship: "Copa Relâmpago",        round: "Oitavas",  homeTeam: "Trovão Azul",   awayTeam: "Falcões",      homeGoals: 1, awayGoals: 0, date: "2026-05-11T19:00:00Z" },
  { id: 4,  championship: "Copa Relâmpago",        round: "Oitavas",  homeTeam: "Os Guerreiros", awayTeam: "Leões",        homeGoals: 4, awayGoals: 2, date: "2026-05-11T20:00:00Z" },
  { id: 5,  championship: "Campeonato Verão 2025", round: "Rodada 2", homeTeam: "Esquadrão FC",  awayTeam: "Os Brabos",    homeGoals: 1, awayGoals: 2, date: "2026-05-10T19:00:00Z" },
  { id: 6,  championship: "Campeonato Verão 2025", round: "Rodada 2", homeTeam: "Trovão Azul",   awayTeam: "Falcões",      homeGoals: 3, awayGoals: 0, date: "2026-05-10T20:00:00Z" },
  { id: 7,  championship: "Liga Empresarial",      round: "Rodada 1", homeTeam: "Dragões",       awayTeam: "Fênix",        homeGoals: 2, awayGoals: 1, date: "2026-05-09T19:00:00Z" },
  { id: 8,  championship: "Campeonato Verão 2025", round: "Rodada 1", homeTeam: "Os Brabos",     awayTeam: "Falcões",      homeGoals: 4, awayGoals: 0, date: "2026-05-09T20:00:00Z" },
];

export const mockRecentChampionships: ChampionshipSummary[] = [
  { id: 1, name: "Campeonato Verão 2025", format: "pontos_corridos",   status: "em_andamento", teams: 8,  currentRound: 4, totalRounds: 10 },
  { id: 2, name: "Copa Relâmpago",         format: "mata_mata",          status: "em_andamento", teams: 8,  currentRound: 2, totalRounds: 4  },
  { id: 3, name: "Torneio de Inverno",     format: "grupos_mata_mata",   status: "agendada",     teams: 12, currentRound: 0, totalRounds: 6  },
  { id: 4, name: "Liga Empresarial",       format: "pontos_corridos",    status: "finalizada",   teams: 6,  currentRound: 8, totalRounds: 8  },
];

export const mockTopPlayers: DashboardTopPlayers = {
  mostWins: [
    { playerId: 1, name: "Carlos Silva",    wins: 12 },
    { playerId: 6, name: "Lucas Mendes",    wins: 10 },
    { playerId: 2, name: "João Pedro",      wins: 9  },
    { playerId: 4, name: "Felipe Santos",   wins: 8  },
    { playerId: 7, name: "Bruno Almeida",   wins: 7  },
  ],
  mostGoals: [
    { playerId: 3, name: "Marcos Oliveira", goals: 18 },
    { playerId: 1, name: "Carlos Silva",    goals: 15 },
    { playerId: 6, name: "Lucas Mendes",    goals: 12 },
    { playerId: 4, name: "Felipe Santos",   goals: 10 },
    { playerId: 2, name: "João Pedro",      goals: 8  },
  ],
  mostLosses: [
    { playerId: 8, name: "André Costa",     losses: 9 },
    { playerId: 9, name: "Rafael Souza",    losses: 8 },
    { playerId: 10, name: "Pedro Henrique", losses: 7 },
    { playerId: 11, name: "Tiago Borges",   losses: 6 },
    { playerId: 12, name: "Diego Martins",  losses: 5 },
  ],
};
