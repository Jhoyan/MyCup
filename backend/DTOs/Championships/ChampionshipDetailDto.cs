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

        /// <summary>Flat league table — populated for the round_robin format only.</summary>
        public List<StandingsRowDto> Standings { get; set; } = new();

        /// <summary>Per-group standings — populated for the groups_knockout format only.</summary>
        public List<GroupStandingsDto> Groups { get; set; } = new();

        public List<RoundSummaryDto> Rounds { get; set; } = new();
    }
}
