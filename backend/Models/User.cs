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
    public string PasswordHash { get; set; } = string.Empty;

    /// <summary>
    /// Memberships that define the universes this user can administer and their role.
    /// </summary>
    public ICollection<UserUniverse> UserUniverses { get; set; } = new List<UserUniverse>();

    /// <summary>
    /// Player profiles optionally linked to this user account.
    /// </summary>
    public ICollection<Player> Players { get; set; } = new List<Player>();

    /// <summary>
    /// Indicates whether the user account is active. Inactive accounts cannot log in or manage universes.
    /// </summary>
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Timestamps for auditing purposes. CreatedAt is set when the user is created, UpdatedAt should be updated on any change.
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Generate Hash using BCrypt with a work factor of 12.
    /// This provides a good balance between security and performance for most applications.
    /// </summary>
    public static string HashPassword(string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(password, workFactor: 12);
    }

    /// <summary>
    /// Verifies if the provided password matches the stored hash.
    /// </summary>
    /// <param name="password">The password to verify.</param>
    /// <returns>True if the password is correct, false otherwise.</returns>
    public bool VerifyPassword(string password)
    {
        return BCrypt.Net.BCrypt.Verify(password, PasswordHash);
    }
}
