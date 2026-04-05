using System.ComponentModel.DataAnnotations;

namespace MyCup.Models;

/// <summary>
/// Represents a championship structure type, such as league, knockout, or group plus knockout.
/// </summary>
public class Format
{
    /// <summary>
    /// Unique identifier of the format.
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Technical code describing the format type.
    /// </summary>
    [MaxLength(60)]
    public string Type { get; set; } = string.Empty;

    /// <summary>
    /// Championships configured with this format.
    /// </summary>
    public ICollection<Championship> Championships { get; set; } = new List<Championship>();
}
