namespace MyCup.DTOs.Championships
{
    public class TeamAverageDto
    {
        public int TeamId { get; set; }
        public string Name { get; set; } = string.Empty;
        public double Average { get; set; }
    }
}
