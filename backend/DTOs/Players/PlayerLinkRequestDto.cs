namespace MyCup.DTOs.Players
{
    /// <summary>
    /// A pending player-link request as shown to the target user (their notification feed).
    /// </summary>
    public class PlayerLinkRequestDto
    {
        public int Id { get; set; }
        public int PlayerId { get; set; }
        public string PlayerName { get; set; } = string.Empty;
        public int UniverseId { get; set; }
        public string UniverseName { get; set; } = string.Empty;
        public string RequestedByName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}
