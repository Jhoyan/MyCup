using MyCup.DTOs.Championships;

namespace MyCup.DTOs.Universe
{
    public class UniverseDetailDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public List<UniversePlayerStatsDto> Players { get; set; } = new();
        public List<ChampionshipSummaryDto> Championships { get; set; } = new();
    }
}
