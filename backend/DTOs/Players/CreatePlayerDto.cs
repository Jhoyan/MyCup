using System.ComponentModel.DataAnnotations;

namespace MyCup.DTOs.Players
{
    public class CreatePlayerDto
    {
        [Required]
        [MaxLength(120)]
        public string Name { get; set; } = string.Empty;
        [Required]
        public int UniverseId { get; set; }
    }
}
