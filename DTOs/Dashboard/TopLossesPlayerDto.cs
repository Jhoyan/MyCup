namespace MyCup.DTOs.Dashboard
{
    public class TopLossesPlayerDto
    {
        public int PlayerId { get; set; }
        public string Name { get; set; } = string.Empty;
        public int Losses { get; set; }
    }
}
