using System.ComponentModel.DataAnnotations;

namespace MyCup.DTOs.Universe
{
    /// <summary>
    /// Updates the role of an existing universe member.
    /// </summary>
    public class UpdateMemberRoleDto
    {
        [Required]
        [MaxLength(40)]
        public string Role { get; set; } = string.Empty;
    }
}
