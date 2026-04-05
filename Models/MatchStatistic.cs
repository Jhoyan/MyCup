using System.ComponentModel.DataAnnotations;

namespace MyCup.Models;

/// <summary>
/// Represents an individual player's performance metrics in a specific match.
/// </summary>
public class MatchStatistic
{
    /// <summary>
    /// Unique identifier of the statistic record.
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Foreign key identifying the match where the statistics were produced.
    /// </summary>
    public int MatchId { get; set; }

    /// <summary>
    /// Foreign key identifying the player whose performance is recorded.
    /// </summary>
    public int PlayerId { get; set; }

    /// <summary>
    /// Number of goals scored by the player in the match.
    /// </summary>
    public int Goals { get; set; }

    /// <summary>
    /// Number of assists provided by the player in the match.
    /// </summary>
    public int Assists { get; set; }

    /// <summary>
    /// Result perspective for the player in this match (win, loss, draw).
    /// </summary>
    [MaxLength(20)]
    public string Result { get; set; } = string.Empty;

    /// <summary>
    /// Navigation reference to the related match.
    /// </summary>
    public Match Match { get; set; } = null!;

    /// <summary>
    /// Navigation reference to the related player.
    /// </summary>
    public Player Player { get; set; } = null!;
}
