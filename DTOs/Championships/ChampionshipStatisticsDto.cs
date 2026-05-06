namespace MyCup.DTOs.Championships
{
    public class ChampionshipStatisticsDto
    {
        public PlayerGoalStatDto TopScorer { get; set; } = new();
        public PlayerAssistStatDto MostAssists { get; set; } = new();
        public MatchScoreDto BiggestWin { get; set; } = new();
        public MatchComebackDto BiggestComeback { get; set; } = new();
        public double GoalsPerMatch { get; set; }
        public GoalsConcededPerMatchDto GoalsConcededPerMatch { get; set; } = new();
        public TeamWinsDto MostWins { get; set; } = new();
        public List<PlayerGoalStatDto> TopScorers { get; set; } = new();
    }
}
