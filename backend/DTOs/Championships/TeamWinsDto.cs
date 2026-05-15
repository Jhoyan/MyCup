namespace MyCup.DTOs.Championships
{
    public class TeamWinsDto
    {
        public int TeamId { get; set; }
        public string Name { get; set; } = string.Empty;
        public int Wins { get; set; }
    }
}
