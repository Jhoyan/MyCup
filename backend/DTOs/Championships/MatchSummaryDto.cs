namespace MyCup.DTOs.Championships
{
    public class MatchSummaryDto
    {
        public int Id { get; set; }
        public string HomeTeam { get; set; } = string.Empty;
        public string AwayTeam { get; set; } = string.Empty;
        public int? HomeGoals { get; set; }
        public int? AwayGoals { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime? Date { get; set; }
    }
}
