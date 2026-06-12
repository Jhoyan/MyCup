using System.ComponentModel.DataAnnotations;

namespace MyCup.Models;

/// <summary>
/// A refresh token issued to a user. It is stored so the refresh endpoint can confirm the token is one
/// the server actually handed out, and rotate it (each row is one active session — a user may keep
/// several at once for multi-session). Deleting the row invalidates that session immediately.
/// </summary>
public class RefreshToken
{
    /// <summary>Unique identifier of the stored refresh token.</summary>
    public int Id { get; set; }

    /// <summary>Foreign key identifying the user this refresh token belongs to.</summary>
    public int UserId { get; set; }

    /// <summary>The refresh JWT string. Looked up on refresh; absence means the token is rejected.</summary>
    [MaxLength(512)]
    public string Token { get; set; } = string.Empty;

    /// <summary>When this refresh token expires (mirrors the JWT's expiration).</summary>
    public DateTime ExpiresAt { get; set; }

    /// <summary>When this refresh token was issued.</summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>Navigation reference to the owning user.</summary>
    public User User { get; set; } = null!;
}
