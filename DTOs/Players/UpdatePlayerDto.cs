using System.ComponentModel.DataAnnotations;

namespace MyCup.DTOs.Players
{
    public class UpdatePlayerDto
    {
        [Required]
        [MaxLength(120)]
        public string Name { get; set; } = string.Empty;
    }
}
