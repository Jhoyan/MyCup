namespace MyCup.DTOs.Championships
{
    public class TopScorerDto
    {
        public int PlayerId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Team { get; set; } = string.Empty;
        public int Goals { get; set; }
        public int Assists { get; set; }
    }
}
