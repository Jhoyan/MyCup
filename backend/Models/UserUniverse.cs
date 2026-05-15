using System.ComponentModel.DataAnnotations;

namespace MyCup.Models;

/// <summary>
/// Represents the association between a user and a universe, including the user's role in that universe.
/// </summary>
public class UserUniverse
{
    /// <summary>
    /// Foreign key that identifies the user in the relationship.
    /// </summary>
    public int UserId { get; set; }

    /// <summary>
    /// Foreign key that identifies the universe in the relationship.
    /// </summary>
    public int UniverseId { get; set; }

    /// <summary>
    /// Role granted to the user inside the universe (for example: owner, admin, moderator).
    /// </summary>
    [MaxLength(40)]
    public string Role { get; set; } = string.Empty;

    /// <summary>
    /// Navigation reference to the related user.
    /// </summary>
    public User User { get; set; } = null!;

    /// <summary>
    /// Navigation reference to the related universe.
    /// </summary>
    public Universe Universe { get; set; } = null!;
}
