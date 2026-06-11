using System.ComponentModel.DataAnnotations;

namespace MyCup.DTOs.Championships
{
    /// <summary>
    /// Enrolls a player in a championship. When <see cref="TeamId"/> is provided the assignment is
    /// manual; otherwise the player is enrolled without a team and can be assigned later via the draw.
    /// </summary>
    public class EnrollPlayerDto
    {
        [Required]
        public int PlayerId { get; set; }

        public int? TeamId { get; set; }
    }
}
