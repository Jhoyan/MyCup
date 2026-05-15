// Mocks para Universos. Estrutura idêntica aos DTOs do backend.

import type { UniverseListItem, UniverseDetail } from "@/lib/types";

export const mockUniversos: UniverseListItem[] = [
  { id: 1, name: "Pelada do Bairro", players: 18, championships: 4, activeChampionships: 2 },
  { id: 2, name: "Liga dos Amigos",  players: 12, championships: 2, activeChampionships: 1 },
  { id: 3, name: "Liga do Trabalho", players: 24, championships: 3, activeChampionships: 0 },
];

export const mockUniversoDetail: UniverseDetail = {
  id: 1,
  name: "Pelada do Bairro",
  description: "Liga semanal entre amigos do bairro. Pelada toda quarta-feira às 19h no campo do clube.",
  players: [
    { id: 1, name: "Carlos Silva",     championships: 4, goals: 12, assists: 5, wins: 18, draws: 4, losses: 6,  matches: 28 },
    { id: 2, name: "João Pedro",       championships: 4, goals: 8,  assists: 9, wins: 14, draws: 6, losses: 8,  matches: 28 },
    { id: 3, name: "Marcos Oliveira",  championships: 3, goals: 15, assists: 3, wins: 12, draws: 3, losses: 6,  matches: 21 },
    { id: 4, name: "Felipe Santos",    championships: 4, goals: 6,  assists: 7, wins: 13, draws: 8, losses: 7,  matches: 28 },
    { id: 5, name: "André Costa",      championships: 2, goals: 3,  assists: 2, wins: 5,  draws: 2, losses: 7,  matches: 14 },
    { id: 6, name: "Lucas Mendes",     championships: 4, goals: 10, assists: 6, wins: 16, draws: 5, losses: 7,  matches: 28 },
  ],
  championships: [
    { id: 1, name: "Campeonato Verão 2025",  format: "pontos_corridos",   status: "em_andamento", teams: 8,  currentRound: 4, totalRounds: 10 },
    { id: 2, name: "Torneio de Inverno",     format: "grupos_mata_mata",  status: "agendada",     teams: 12, currentRound: 0, totalRounds: 6  },
    { id: 3, name: "Copa de Verão 2024",     format: "mata_mata",         status: "finalizada",   teams: 8,  currentRound: 4, totalRounds: 4  },
    { id: 4, name: "Liga Bairro 2024",       format: "pontos_corridos",   status: "finalizada",   teams: 6,  currentRound: 5, totalRounds: 5  },
  ],
};
