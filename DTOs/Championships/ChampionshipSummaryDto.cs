namespace MyCup.DTOs.Championships
{
    public class ChampionshipSummaryDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Format { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public int Teams { get; set; }
        public int CurrentRound { get; set; }
        public int TotalRounds { get; set; }
    }
}
