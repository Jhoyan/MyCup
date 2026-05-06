namespace MyCup.DTOs.Championships
{
    public class BracketMatchDto
    {
        public int Id { get; set; }
        public int Position { get; set; }
        public BracketTeamDto? HomeTeam { get; set; }
        public BracketTeamDto? AwayTeam { get; set; }
        public int? WinnerId { get; set; }
        public string Status { get; set; } = string.Empty;
        public int? NextMatchId { get; set; }
    }
}
