using System.ComponentModel.DataAnnotations;

namespace MyCup.DTOs.Championships
{
    /// <summary>
    /// Manually assigns (or reassigns) a team to a player already enrolled in a championship.
    /// </summary>
    public class AssignPlayerTeamDto
    {
        [Required]
        public int TeamId { get; set; }
    }
}
