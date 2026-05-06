using MyCup.DTOs.Common;

namespace MyCup.DTOs.Championships
{
    public class ChampionshipDetailDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Slug { get; set; }
        public UniverseSummaryDto Universe { get; set; } = new();
        public string Format { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public int CurrentRound { get; set; }
        public int TotalRounds { get; set; }
        public List<TeamSummaryDto> Teams { get; set; } = new();
        public List<StandingsRowDto> Standings { get; set; } = new();
        public List<RoundSummaryDto> Rounds { get; set; } = new();
    }
}
