namespace MyCup.DTOs.Championships
{
    public class GoalsConcededPerMatchDto
    {
        public TeamAverageDto Best { get; set; } = new();
        public TeamAverageDto Worst { get; set; } = new();
    }
}
