namespace MyCup.DTOs.Universe
{
    /// <summary>
    /// A user that is a member of a universe, with the role they hold there.
    /// </summary>
    public class UniverseMemberDto
    {
        public int UserId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
    }
}
