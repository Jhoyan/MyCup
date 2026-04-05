using System.ComponentModel.DataAnnotations;

namespace MyCup.Models;

/// <summary>
/// Represents a system account that can manage universes and optionally own player profiles.
/// </summary>
public class User
{
    /// <summary>
    /// Unique identifier of the user.
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Full display name of the user.
    /// </summary>
    [MaxLength(120)]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Unique email used for authentication and communication.
    /// </summary>
    [MaxLength(180)]
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Password hash or secret used to authenticate the user.
    /// </summary>
    [MaxLength(255)]
    public string Password { get; set; } = string.Empty;

    /// <summary>
    /// Memberships that define the universes this user can administer and their role.
    /// </summary>
    public ICollection<UserUniverse> UserUniverses { get; set; } = new List<UserUniverse>();

    /// <summary>
    /// Player profiles optionally linked to this user account.
    /// </summary>
    public ICollection<Player> Players { get; set; } = new List<Player>();
}
