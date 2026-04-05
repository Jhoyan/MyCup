namespace MyCup.Models;

/// <summary>
/// Represents the association between a championship and a team allowed to participate in it.
/// </summary>
public class ChampionshipTeam
{
    /// <summary>
    /// Foreign key identifying the championship.
    /// </summary>
    public int ChampionshipId { get; set; }

    /// <summary>
    /// Foreign key identifying the team.
    /// </summary>
    public int TeamId { get; set; }

    /// <summary>
    /// Navigation reference to the related championship.
    /// </summary>
    public Championship Championship { get; set; } = null!;

    /// <summary>
    /// Navigation reference to the related team.
    /// </summary>
    public Team Team { get; set; } = null!;
}
