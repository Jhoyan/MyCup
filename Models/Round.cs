using System.ComponentModel.DataAnnotations;

namespace MyCup.Models;

/// <summary>
/// Represents a numbered or named match week inside a championship phase.
/// </summary>
public class Round
{
    /// <summary>
    /// Unique identifier of the round.
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Foreign key identifying the phase that owns this round.
    /// </summary>
    public int PhaseId { get; set; }

    /// <summary>
    /// Sequential number of the round.
    /// </summary>
    public int Number { get; set; }

    /// <summary>
    /// Optional descriptive name of the round (for example: Quarterfinal).
    /// </summary>
    [MaxLength(80)]
    public string? Name { get; set; }

    /// <summary>
    /// Navigation reference to the related phase.
    /// </summary>
    public Phase Phase { get; set; } = null!;

    /// <summary>
    /// Matches scheduled in this round.
    /// </summary>
    public ICollection<Match> Matches { get; set; } = new List<Match>();
}
