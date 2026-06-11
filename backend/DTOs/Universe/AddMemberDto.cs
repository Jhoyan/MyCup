using System.ComponentModel.DataAnnotations;

namespace MyCup.DTOs.Universe
{
    /// <summary>
    /// Adds an existing user (resolved by email) as a member of a universe with the given role.
    /// </summary>
    public class AddMemberDto
    {
        [Required]
        [EmailAddress]
        [MaxLength(180)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MaxLength(40)]
        public string Role { get; set; } = string.Empty;
    }
}
