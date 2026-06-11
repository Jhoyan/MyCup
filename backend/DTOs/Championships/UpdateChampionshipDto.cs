using System.ComponentModel.DataAnnotations;

namespace MyCup.DTOs.Championships
{
    public class UpdateChampionshipDto
    {
        [Required]
        [MaxLength(120)]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string Distribution { get; set; } = string.Empty;
    }
}
