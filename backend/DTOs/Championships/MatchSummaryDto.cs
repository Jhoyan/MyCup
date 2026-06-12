namespace MyCup.DTOs.Championships
{
    public class MatchSummaryDto
    {
        public int Id { get; set; }

        /// <summary>Home team name, or null while the knockout slot is still undecided.</summary>
        public string? HomeTeam { get; set; }

        /// <summary>Away team name, or null while the knockout slot is still undecided.</summary>
        public string? AwayTeam { get; set; }
        public int? HomeGoals { get; set; }
        public int? AwayGoals { get; set; }
        public int? HomePenalties { get; set; }
        public int? AwayPenalties { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime? Date { get; set; }
    }
}
