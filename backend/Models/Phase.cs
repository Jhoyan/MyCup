using System.ComponentModel.DataAnnotations;

namespace MyCup.Models;

/// <summary>
/// Represents a championship stage, such as group stage, knockout stage, or league stage.
/// </summary>
public class Phase
{
    /// <summary>
    /// Unique identifier of the phase.
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Foreign key identifying the championship that owns this phase.
    /// </summary>
    public int ChampionshipId { get; set; }

    /// <summary>
    /// Type of phase structure (for example: groups, eliminatory, league).
    /// </summary>
    [MaxLength(60)]
    public string Type { get; set; } = string.Empty;

    /// <summary>
    /// Execution order of the phase within the championship timeline.
    /// </summary>
    public int Order { get; set; }

    /// <summary>
    /// Navigation reference to the related championship.
    /// </summary>
    public Championship Championship { get; set; } = null!;

    /// <summary>
    /// Rounds belonging to this phase.
    /// </summary>
    public ICollection<Round> Rounds { get; set; } = new List<Round>();

    /// <summary>
    /// Groups belonging to this phase when group structure is used.
    /// </summary>
    public ICollection<Group> Groups { get; set; } = new List<Group>();
}
