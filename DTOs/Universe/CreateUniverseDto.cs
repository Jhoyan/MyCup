using System.ComponentModel.DataAnnotations;

namespace MyCup.DTOs.Universe
{
    public class CreateUniverseDto
    {
        [Required]
        [MaxLength(120)]
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }
    }
}
