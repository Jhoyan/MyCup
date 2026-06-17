namespace MyCup.Models;

/// <summary>
/// A request, created by a universe admin, asking a platform user to take ownership of (link their account
/// to) a specific player profile. It doubles as the notification shown to the target user: while pending it
/// appears in their list; accepting sets <see cref="Player.UserId"/>, declining hides it.
/// </summary>
public class PlayerLinkRequest
{
    /// <summary>Unique identifier of the request.</summary>
    public int Id { get; set; }

    /// <summary>Foreign key of the player the request wants to link.</summary>
    public int PlayerId { get; set; }

    /// <summary>Foreign key of the user being asked to take ownership of the player.</summary>
    public int TargetUserId { get; set; }

    /// <summary>Foreign key of the admin who created the request (kept for auditing).</summary>
    public int RequestedByUserId { get; set; }

    /// <summary>Current state of the request: pending, accepted or declined.</summary>
    public PlayerLinkRequestStatus Status { get; set; } = PlayerLinkRequestStatus.Pending;

    /// <summary>When the request was created.</summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>When the target user accepted or declined the request; null while pending.</summary>
    public DateTime? RespondedAt { get; set; }

    /// <summary>Navigation reference to the player being linked.</summary>
    public Player Player { get; set; } = null!;

    /// <summary>Navigation reference to the user being asked to take ownership.</summary>
    public User TargetUser { get; set; } = null!;

    /// <summary>Navigation reference to the admin who created the request.</summary>
    public User RequestedByUser { get; set; } = null!;
}

/// <summary>Lifecycle states of a <see cref="PlayerLinkRequest"/>.</summary>
public enum PlayerLinkRequestStatus
{
    Pending = 0,
    Accepted = 1,
    Declined = 2
}
