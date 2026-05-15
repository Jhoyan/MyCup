using System.ComponentModel.DataAnnotations;

namespace MyCup.DTOs.Championships
{
    public class CreateChampionshipDto
    {
        [Required]
        [MaxLength(120)]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string Format { get; set; } = string.Empty;

        [Required]
        public string Distribution { get; set; } = string.Empty;

        [Required]
        public int UniverseId { get; set; }

        [Required]
        public int FormatId { get; set; }
    }
}
