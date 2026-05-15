using System.ComponentModel.DataAnnotations;

namespace MyCup.Models;

/// <summary>
/// Represents a tournament organized inside a universe, with format, phases, teams, players, and rules.
/// </summary>
public class Championship
{
    /// <summary>
    /// Unique identifier of the championship.
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Foreign key identifying the universe that owns this championship.
    /// </summary>
    public int UniverseId { get; set; }

    /// <summary>
    /// Foreign key identifying the competition format used by this championship.
    /// </summary>
    public int FormatId { get; set; }

    /// <summary>
    /// Name used to identify the championship.
    /// </summary>
    [MaxLength(120)]
    public string Name { get; set; } = string.Empty;

    public string? Slug { get; set; } = string.Empty;
    public string Distribution { get; set; } = string.Empty;

    /// <summary>
    /// Navigation reference to the parent universe.
    /// </summary>
    public Universe Universe { get; set; } = null!;

    /// <summary>
    /// Navigation reference to the selected format.
    /// </summary>
    public Format Format { get; set; } = null!;

    /// <summary>
    /// Phases that define the structure of the championship lifecycle.
    /// </summary>
    public ICollection<Phase> Phases { get; set; } = new List<Phase>();

    /// <summary>
    /// Player enrollment entries for this championship.
    /// </summary>
    public ICollection<PlayerChampionship> PlayerChampionships { get; set; } = new List<PlayerChampionship>();

    /// <summary>
    /// Team enrollment entries for this championship.
    /// </summary>
    public ICollection<ChampionshipTeam> ChampionshipTeams { get; set; } = new List<ChampionshipTeam>();

    /// <summary>
    /// Configurable key-value rules applied to this championship.
    /// </summary>
    public ICollection<ChampionshipRule> ChampionshipRules { get; set; } = new List<ChampionshipRule>();
}
