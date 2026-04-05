namespace MyCup.Models;

/// <summary>
/// Represents the many-to-many association between groups and teams.
/// </summary>
public class GroupTeam
{
    /// <summary>
    /// Foreign key identifying the group.
    /// </summary>
    public int GroupId { get; set; }

    /// <summary>
    /// Foreign key identifying the team assigned to the group.
    /// </summary>
    public int TeamId { get; set; }

    /// <summary>
    /// Navigation reference to the related group.
    /// </summary>
    public Group Group { get; set; } = null!;

    /// <summary>
    /// Navigation reference to the related team.
    /// </summary>
    public Team Team { get; set; } = null!;
}
