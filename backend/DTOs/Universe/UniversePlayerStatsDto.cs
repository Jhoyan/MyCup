namespace MyCup.DTOs.Universe
{
    public class UniversePlayerStatsDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int Championships { get; set; }
        public int Goals { get; set; }
        public int Assists { get; set; }
        public int Wins { get; set; }
        public int Draws { get; set; }
        public int Losses { get; set; }
        public int Matches { get; set; }
    }
}
