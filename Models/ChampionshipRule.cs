using System.ComponentModel.DataAnnotations;

namespace MyCup.Models;

/// <summary>
/// Represents a configurable key-value rule applied to a championship.
/// </summary>
public class ChampionshipRule
{
    /// <summary>
    /// Unique identifier of the rule record.
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Foreign key identifying the championship that owns this rule.
    /// </summary>
    public int ChampionshipId { get; set; }

    /// <summary>
    /// Rule key used to identify the setting (for example: away_goal, points_victory).
    /// </summary>
    [MaxLength(80)]
    public string Key { get; set; } = string.Empty;

    /// <summary>
    /// Rule value stored as text for flexible configuration.
    /// </summary>
    [MaxLength(120)]
    public string Value { get; set; } = string.Empty;

    /// <summary>
    /// Navigation reference to the related championship.
    /// </summary>
    public Championship Championship { get; set; } = null!;
}
