namespace MyCup.DTOs.Championships
{
    public class PlayerAssistStatDto
    {
        public int PlayerId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Team { get; set; } = string.Empty;
        public int Assists { get; set; }
    }
}
