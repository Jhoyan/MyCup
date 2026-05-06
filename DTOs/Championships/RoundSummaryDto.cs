namespace MyCup.DTOs.Championships
{
    public class RoundSummaryDto
    {
        public int Number { get; set; }
        public string? Name { get; set; }
        public string Status { get; set; } = string.Empty;
        public List<MatchSummaryDto> Matches { get; set; } = new();
    }
}
