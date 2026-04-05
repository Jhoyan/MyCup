using System.ComponentModel.DataAnnotations;

namespace MyCup.Models;

/// <summary>
/// Represents a club or team that can participate in championships, groups, and matches.
/// </summary>
public class Team
{
    /// <summary>
    /// Unique identifier of the team.
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Official display name of the team.
    /// </summary>
    [MaxLength(120)]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Championship association entries that include this team.
    /// </summary>
    public ICollection<ChampionshipTeam> ChampionshipTeams { get; set; } = new List<ChampionshipTeam>();

    /// <summary>
    /// Group association entries that include this team.
    /// </summary>
    public ICollection<GroupTeam> GroupTeams { get; set; } = new List<GroupTeam>();

    /// <summary>
    /// Player enrollment entries where this team was assigned.
    /// </summary>
    public ICollection<PlayerChampionship> PlayerChampionships { get; set; } = new List<PlayerChampionship>();

    /// <summary>
    /// Matches where this team plays as home side.
    /// </summary>
    public ICollection<Match> HomeMatches { get; set; } = new List<Match>();

    /// <summary>
    /// Matches where this team plays as away side.
    /// </summary>
    public ICollection<Match> AwayMatches { get; set; } = new List<Match>();
}
