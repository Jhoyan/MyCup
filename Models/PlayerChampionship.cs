namespace MyCup.Models;

/// <summary>
/// Represents a player's enrollment in a championship, including the team assigned for that specific championship.
/// </summary>
public class PlayerChampionship
{
    /// <summary>
    /// Unique identifier of the enrollment record.
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Foreign key identifying the player enrolled in the championship.
    /// </summary>
    public int PlayerId { get; set; }

    /// <summary>
    /// Foreign key identifying the championship where the player is enrolled.
    /// </summary>
    public int ChampionshipId { get; set; }

    /// <summary>
    /// Foreign key identifying the team assigned to the player in this championship.
    /// </summary>
    public int TeamId { get; set; }

    /// <summary>
    /// Navigation reference to the related player.
    /// </summary>
    public Player Player { get; set; } = null!;

    /// <summary>
    /// Navigation reference to the related championship.
    /// </summary>
    public Championship Championship { get; set; } = null!;

    /// <summary>
    /// Navigation reference to the assigned team.
    /// </summary>
    public Team Team { get; set; } = null!;
}
