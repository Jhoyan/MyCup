namespace MyCup.DTOs.Dashboard
{
    public class RecentResultDto
    {
        public int Id { get; set; }
        public string Championship { get; set; } = string.Empty;
        public string Round { get; set; } = string.Empty;
        public string HomeTeam { get; set; } = string.Empty;
        public string AwayTeam { get; set; } = string.Empty;
        public int HomeGoals { get; set; }
        public int AwayGoals { get; set; }
        public DateTime Date { get; set; }
    }
}
