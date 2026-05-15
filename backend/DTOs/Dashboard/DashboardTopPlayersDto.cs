namespace MyCup.DTOs.Dashboard
{
    public class DashboardTopPlayersDto
    {
        public List<TopWinsPlayerDto> MostWins { get; set; } = new();
        public List<TopGoalsPlayerDto> MostGoals { get; set; } = new();
        public List<TopLossesPlayerDto> MostLosses { get; set; } = new();
    }
}
