using System.ComponentModel.DataAnnotations;

namespace MyCup.Models;

/// <summary>
/// Represents a fixture between two teams within a specific round.
/// </summary>
public class Match
{
    /// <summary>
    /// Unique identifier of the match.
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Foreign key identifying the round where the match is scheduled.
    /// </summary>
    public int RoundId { get; set; }

    /// <summary>
    /// Foreign key identifying the home team.
    /// </summary>
    public int HomeTeamId { get; set; }

    /// <summary>
    /// Foreign key identifying the away team.
    /// </summary>
    public int AwayTeamId { get; set; }

    /// <summary>
    /// Number of goals scored by the home team.
    /// </summary>
    public int HomeGoals { get; set; }

    /// <summary>
    /// Number of goals scored by the away team.
    /// </summary>
    public int AwayGoals { get; set; }

    /// <summary>
    /// Penalty shootout goals scored by the home team, when a drawn knockout tie was decided on penalties.
    /// Null when there was no shootout.
    /// </summary>
    public int? HomePenalties { get; set; }

    /// <summary>
    /// Penalty shootout goals scored by the away team, when a drawn knockout tie was decided on penalties.
    /// Null when there was no shootout.
    /// </summary>
    public int? AwayPenalties { get; set; }

    /// <summary>
    /// Optional foreign key to the group this match belongs to, for group-stage matches in the
    /// groups_knockout format. Null for league and knockout matches.
    /// </summary>
    public int? GroupId { get; set; }

    /// <summary>
    /// Current status of the match (for example: scheduled, live, finished).
    /// </summary>
    [MaxLength(40)]
    public string Status { get; set; } = string.Empty;

    /// <summary>
    /// Date and time when the match is planned or played.
    /// </summary>
    public DateTime Date { get; set; }

    /// <summary>
    /// Navigation reference to the group this match belongs to, when it is a group-stage match.
    /// </summary>
    public Group? Group { get; set; }

    /// <summary>
    /// Navigation reference to the related round.
    /// </summary>
    public Round Round { get; set; } = null!;

    /// <summary>
    /// Navigation reference to the home team.
    /// </summary>
    public Team HomeTeam { get; set; } = null!;

    /// <summary>
    /// Navigation reference to the away team.
    /// </summary>
    public Team AwayTeam { get; set; } = null!;

}
