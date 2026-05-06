using System.ComponentModel.DataAnnotations;

namespace MyCup.DTOs.Teams
{
    public class CreateTeamDto
    {
        [Required]
        [MaxLength(120)]
        public string Name { get; set; } = string.Empty;
    }
}
