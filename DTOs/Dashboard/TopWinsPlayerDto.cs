namespace MyCup.DTOs.Dashboard
{
    public class TopWinsPlayerDto
    {
        public int PlayerId { get; set; }
        public string Name { get; set; } = string.Empty;
        public int Wins { get; set; }
    }
}
