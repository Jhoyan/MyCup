using System.ComponentModel.DataAnnotations;

namespace MyCup.Models;

/// <summary>
/// Represents an isolated environment where championships, players, and permissions are organized.
/// </summary>
public class Universe
{
    /// <summary>
    /// Unique identifier of the universe.
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Name used to identify the universe.
    /// </summary>
    [MaxLength(120)]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Optional description providing additional details about the universe.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Membership entries that define which users can access this universe.
    /// </summary>
    public ICollection<UserUniverse> UserUniverses { get; set; } = new List<UserUniverse>();

    /// <summary>
    /// Players that participate in this universe.
    /// </summary>
    public ICollection<Player> Players { get; set; } = new List<Player>();

    /// <summary>
    /// Championships organized under this universe.
    /// </summary>
    public ICollection<Championship> Championships { get; set; } = new List<Championship>();
}
