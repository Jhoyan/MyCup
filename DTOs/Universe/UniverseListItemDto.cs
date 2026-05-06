namespace MyCup.DTOs.Universe
{
    public class UniverseListItemDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int Players { get; set; }
        public int Championships { get; set; }
        public int ActiveChampionships { get; set; }
    }
}
