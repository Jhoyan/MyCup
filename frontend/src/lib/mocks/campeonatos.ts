// Mocks para Campeonatos. Estrutura alinhada com DTOs do backend.

import type {
  ChampionshipDetail,
  ChampionshipStatistics,
  Bracket,
  UniverseSummary,
  ChampionshipSummary,
} from "@/lib/types";

// ── Lista de campeonatos (com universo embutido para filtragem) ──────────────
export type CampeonatoListItem = ChampionshipSummary & {
  universe: UniverseSummary;
};

export const mockCampeonatosLista: CampeonatoListItem[] = [
  { id: 1, name: "Campeonato Verão 2025", format: "pontos_corridos",   status: "em_andamento", teams: 8,  currentRound: 4, totalRounds: 10, universe: { id: 1, name: "Pelada do Bairro" } },
  { id: 2, name: "Copa Relâmpago",         format: "mata_mata",          status: "em_andamento", teams: 8,  currentRound: 2, totalRounds: 4,  universe: { id: 2, name: "Liga dos Amigos"  } },
  { id: 3, name: "Torneio de Inverno",     format: "grupos_mata_mata",   status: "agendada",     teams: 12, currentRound: 0, totalRounds: 6,  universe: { id: 1, name: "Pelada do Bairro" } },
  { id: 4, name: "Liga Empresarial",       format: "pontos_corridos",    status: "finalizada",   teams: 6,  currentRound: 8, totalRounds: 8,  universe: { id: 3, name: "Liga do Trabalho" } },
  { id: 5, name: "Copa de Verão 2024",     format: "mata_mata",          status: "finalizada",   teams: 8,  currentRound: 4, totalRounds: 4,  universe: { id: 1, name: "Pelada do Bairro" } },
];

// ── Universos para o select de criação ────────────────────────────────────────
export const mockUniversosOptions: UniverseSummary[] = [
  { id: 1, name: "Pelada do Bairro" },
  { id: 2, name: "Liga dos Amigos"  },
  { id: 3, name: "Liga do Trabalho" },
];

// ── Detalhe do campeonato (pontos corridos) ───────────────────────────────────
export const mockCampeonatoPontosCorridos: ChampionshipDetail = {
  id: 1,
  name: "Campeonato Verão 2025",
  slug: "campeonato-verao-2025",
  universe: { id: 1, name: "Pelada do Bairro" },
  format: "pontos_corridos",
  status: "em_andamento",
  currentRound: 4,
  totalRounds: 10,
  teams: [
    { id: 1, name: "Os Brabos"     },
    { id: 2, name: "Trovão Azul"   },
    { id: 3, name: "Falcões"       },
    { id: 4, name: "Esquadrão FC"  },
    { id: 5, name: "Os Guerreiros" },
    { id: 6, name: "Leões"         },
    { id: 7, name: "Fênix"         },
    { id: 8, name: "Dragões"       },
  ],
  standings: [
    { position: 1, team: "Os Brabos",     played: 7, wins: 5, draws: 1, losses: 1, goalsFor: 14, goalsAgainst: 6,  goalDifference: 8,  points: 16 },
    { position: 2, team: "Trovão Azul",   played: 7, wins: 4, draws: 2, losses: 1, goalsFor: 12, goalsAgainst: 7,  goalDifference: 5,  points: 14 },
    { position: 3, team: "Falcões",       played: 7, wins: 4, draws: 1, losses: 2, goalsFor: 11, goalsAgainst: 9,  goalDifference: 2,  points: 13 },
    { position: 4, team: "Esquadrão FC",  played: 7, wins: 3, draws: 2, losses: 2, goalsFor: 10, goalsAgainst: 10, goalDifference: 0,  points: 11 },
    { position: 5, team: "Os Guerreiros", played: 7, wins: 3, draws: 1, losses: 3, goalsFor: 9,  goalsAgainst: 11, goalDifference: -2, points: 10 },
    { position: 6, team: "Leões",         played: 7, wins: 2, draws: 1, losses: 4, goalsFor: 8,  goalsAgainst: 12, goalDifference: -4, points: 7  },
    { position: 7, team: "Fênix",         played: 7, wins: 1, draws: 2, losses: 4, goalsFor: 6,  goalsAgainst: 13, goalDifference: -7, points: 5  },
    { position: 8, team: "Dragões",       played: 7, wins: 0, draws: 2, losses: 5, goalsFor: 5,  goalsAgainst: 14, goalDifference: -9, points: 2  },
  ],
  rounds: [
    {
      number: 4, name: null, status: "em_andamento",
      matches: [
        { id: 7,  homeTeam: "Os Brabos",     awayTeam: "Falcões",      homeGoals: null, awayGoals: null, status: "agendada", date: "2026-05-14T19:00:00Z" },
        { id: 8,  homeTeam: "Trovão Azul",   awayTeam: "Esquadrão FC", homeGoals: null, awayGoals: null, status: "agendada", date: "2026-05-14T20:30:00Z" },
        { id: 9,  homeTeam: "Os Guerreiros", awayTeam: "Leões",        homeGoals: null, awayGoals: null, status: "agendada", date: "2026-05-15T19:00:00Z" },
        { id: 10, homeTeam: "Fênix",         awayTeam: "Dragões",      homeGoals: null, awayGoals: null, status: "agendada", date: "2026-05-15T20:00:00Z" },
      ],
    },
    {
      number: 3, name: null, status: "finalizada",
      matches: [
        { id: 5, homeTeam: "Os Brabos", awayTeam: "Trovão Azul",  homeGoals: 3, awayGoals: 1, status: "finalizada", date: "2026-05-10T19:00:00Z" },
        { id: 6, homeTeam: "Falcões",   awayTeam: "Esquadrão FC", homeGoals: 2, awayGoals: 2, status: "finalizada", date: "2026-05-10T20:00:00Z" },
      ],
    },
    {
      number: 2, name: null, status: "finalizada",
      matches: [
        { id: 3, homeTeam: "Trovão Azul",  awayTeam: "Falcões",   homeGoals: 1, awayGoals: 0, status: "finalizada", date: "2026-05-09T19:00:00Z" },
        { id: 4, homeTeam: "Esquadrão FC", awayTeam: "Os Brabos", homeGoals: 1, awayGoals: 2, status: "finalizada", date: "2026-05-09T20:00:00Z" },
      ],
    },
    {
      number: 1, name: null, status: "finalizada",
      matches: [
        { id: 1, homeTeam: "Os Brabos",   awayTeam: "Esquadrão FC",  homeGoals: 2, awayGoals: 0, status: "finalizada", date: "2026-05-08T19:00:00Z" },
        { id: 2, homeTeam: "Trovão Azul", awayTeam: "Os Guerreiros", homeGoals: 3, awayGoals: 2, status: "finalizada", date: "2026-05-08T20:00:00Z" },
      ],
    },
  ],
};

// ── Detalhe do campeonato (mata-mata) ─────────────────────────────────────────
export const mockCampeonatoMataMata: ChampionshipDetail = {
  id: 2,
  name: "Copa Relâmpago",
  slug: "copa-relampago",
  universe: { id: 2, name: "Liga dos Amigos" },
  format: "mata_mata",
  status: "em_andamento",
  currentRound: 2,
  totalRounds: 4,
  teams: [
    { id: 1, name: "Os Brabos"   },
    { id: 2, name: "Trovão Azul" },
    { id: 3, name: "Falcões"     },
    { id: 4, name: "Esquadrão FC"},
    { id: 5, name: "Guerreiros"  },
    { id: 6, name: "Leões"       },
    { id: 7, name: "Fênix"       },
    { id: 8, name: "Dragões"     },
  ],
  // Para mata-mata, "classificação" mostra os times com aproveitamento geral
  standings: [
    { position: 1, team: "Os Brabos",   played: 2, wins: 2, draws: 0, losses: 0, goalsFor: 5, goalsAgainst: 1, goalDifference: 4, points: 6 },
    { position: 2, team: "Trovão Azul", played: 1, wins: 1, draws: 0, losses: 0, goalsFor: 2, goalsAgainst: 1, goalDifference: 1, points: 3 },
    { position: 3, team: "Falcões",     played: 1, wins: 1, draws: 0, losses: 0, goalsFor: 4, goalsAgainst: 2, goalDifference: 2, points: 3 },
    { position: 4, team: "Guerreiros",  played: 2, wins: 1, draws: 0, losses: 1, goalsFor: 3, goalsAgainst: 3, goalDifference: 0, points: 3 },
  ],
  rounds: [
    {
      number: 2, name: "Semi", status: "em_andamento",
      matches: [
        { id: 25, homeTeam: "Os Brabos",   awayTeam: "Guerreiros", homeGoals: 2,    awayGoals: 1,    status: "finalizada",  date: "2026-05-10T19:00:00Z" },
        { id: 26, homeTeam: "Trovão Azul", awayTeam: "Falcões",    homeGoals: null, awayGoals: null, status: "em_andamento", date: "2026-05-14T20:00:00Z" },
      ],
    },
    {
      number: 1, name: "Quartas", status: "finalizada",
      matches: [
        { id: 21, homeTeam: "Os Brabos",    awayTeam: "Dragões",   homeGoals: 3, awayGoals: 0, status: "finalizada", date: "2026-05-08T19:00:00Z" },
        { id: 22, homeTeam: "Esquadrão FC", awayTeam: "Guerreiros",homeGoals: 1, awayGoals: 2, status: "finalizada", date: "2026-05-08T20:00:00Z" },
        { id: 23, homeTeam: "Trovão Azul",  awayTeam: "Fênix",     homeGoals: 2, awayGoals: 1, status: "finalizada", date: "2026-05-09T19:00:00Z" },
        { id: 24, homeTeam: "Falcões",      awayTeam: "Leões",     homeGoals: 4, awayGoals: 2, status: "finalizada", date: "2026-05-09T20:00:00Z" },
      ],
    },
  ],
};

// ── Lookup por id ─────────────────────────────────────────────────────────────
export function getMockCampeonatoDetail(id: string | number): ChampionshipDetail {
  const numId = Number(id);
  if (numId === 2) return mockCampeonatoMataMata;
  return mockCampeonatoPontosCorridos;
}

// Alias para retrocompat com imports antigos
export const mockCampeonatoDetail = mockCampeonatoPontosCorridos;

// ── Estatísticas estilo Arena17 ───────────────────────────────────────────────
export const mockCampeonatoStatistics: ChampionshipStatistics = {
  topScorer:   { playerId: 3, name: "Marcos Oliveira", team: "Falcões",     goals: 15 },
  mostAssists: { playerId: 2, name: "João Pedro",     team: "Trovão Azul", assists: 9 },
  biggestWin:  { matchId: 5, homeTeam: "Os Brabos", awayTeam: "Dragões", homeGoals: 7, awayGoals: 0 },
  biggestComeback: { matchId: 12, description: "Falcões 3×2 Leões (estavam perdendo de 0×2)" },
  goalsPerMatch: 2.4,
  goalsConcededPerMatch: {
    best:  { teamId: 1, name: "Os Brabos", average: 0.86 },
    worst: { teamId: 8, name: "Dragões",   average: 2.0  },
  },
  mostWins: { teamId: 1, name: "Os Brabos", wins: 5 },
  topScorers: [
    { playerId: 3, name: "Marcos Oliveira", team: "Falcões",       goals: 15 },
    { playerId: 1, name: "Carlos Silva",    team: "Os Brabos",     goals: 12 },
    { playerId: 6, name: "Lucas Mendes",    team: "Trovão Azul",   goals: 10 },
    { playerId: 4, name: "Felipe Santos",   team: "Esquadrão FC",  goals: 8  },
    { playerId: 2, name: "João Pedro",      team: "Os Guerreiros", goals: 7  },
  ],
};

// ── Bracket (mata-mata) ───────────────────────────────────────────────────────
export const mockCampeonatoBracket: Bracket = {
  rounds: [
    {
      name: "Quartas",
      matches: [
        { id: 21, position: 1, homeTeam: { id: 1, name: "Os Brabos",     goals: 3 }, awayTeam: { id: 8, name: "Dragões",   goals: 0 }, winnerId: 1, status: "finalizada", nextMatchId: 25 },
        { id: 22, position: 2, homeTeam: { id: 4, name: "Esquadrão FC",  goals: 1 }, awayTeam: { id: 5, name: "Guerreiros", goals: 2 }, winnerId: 5, status: "finalizada", nextMatchId: 25 },
        { id: 23, position: 3, homeTeam: { id: 2, name: "Trovão Azul",   goals: 2 }, awayTeam: { id: 7, name: "Fênix",     goals: 1 }, winnerId: 2, status: "finalizada", nextMatchId: 26 },
        { id: 24, position: 4, homeTeam: { id: 3, name: "Falcões",       goals: 4 }, awayTeam: { id: 6, name: "Leões",     goals: 2 }, winnerId: 3, status: "finalizada", nextMatchId: 26 },
      ],
    },
    {
      name: "Semi",
      matches: [
        { id: 25, position: 1, homeTeam: { id: 1, name: "Os Brabos",   goals: 2 }, awayTeam: { id: 5, name: "Guerreiros", goals: 1 }, winnerId: 1, status: "finalizada",  nextMatchId: 27 },
        { id: 26, position: 2, homeTeam: { id: 2, name: "Trovão Azul", goals: null }, awayTeam: { id: 3, name: "Falcões", goals: null }, winnerId: null, status: "em_andamento", nextMatchId: 27 },
      ],
    },
    {
      name: "Final",
      matches: [
        { id: 27, position: 1, homeTeam: { id: 1, name: "Os Brabos", goals: null }, awayTeam: null, winnerId: null, status: "agendada", nextMatchId: null },
      ],
    },
  ],
};
