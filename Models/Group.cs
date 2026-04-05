using System.ComponentModel.DataAnnotations;

namespace MyCup.Models;

/// <summary>
/// Represents a group inside a phase where teams are allocated for group-stage competition.
/// </summary>
public class Group
{
    /// <summary>
    /// Unique identifier of the group.
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Foreign key identifying the phase that owns this group.
    /// </summary>
    public int PhaseId { get; set; }

    /// <summary>
    /// Display name of the group (for example: Group A).
    /// </summary>
    [MaxLength(60)]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Navigation reference to the related phase.
    /// </summary>
    public Phase Phase { get; set; } = null!;

    /// <summary>
    /// Team allocation entries associated with this group.
    /// </summary>
    public ICollection<GroupTeam> GroupTeams { get; set; } = new List<GroupTeam>();
}
