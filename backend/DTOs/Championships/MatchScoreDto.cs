namespace MyCup.DTOs.Championships
{
    public class MatchScoreDto
    {
        public int MatchId { get; set; }
        public string HomeTeam { get; set; } = string.Empty;
        public string AwayTeam { get; set; } = string.Empty;
        public int HomeGoals { get; set; }
        public int AwayGoals { get; set; }
    }
}
