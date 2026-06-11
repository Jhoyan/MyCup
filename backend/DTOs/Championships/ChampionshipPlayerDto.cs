namespace MyCup.DTOs.Championships
{
    /// <summary>
    /// Represents a player enrolled in a championship and the team assigned to them.
    /// </summary>
    public class ChampionshipPlayerDto
    {
        public int PlayerId { get; set; }
        public string PlayerName { get; set; } = string.Empty;
        public int? TeamId { get; set; }
        public string? TeamName { get; set; }
    }
}
