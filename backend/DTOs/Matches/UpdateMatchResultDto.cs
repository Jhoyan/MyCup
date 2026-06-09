using System.ComponentModel.DataAnnotations;

namespace MyCup.DTOs.Matches
{
    public class UpdateMatchResultDto
    {
        [Range(0, int.MaxValue)]
        public int HomeGoals { get; set; }

        [Range(0, int.MaxValue)]
        public int AwayGoals { get; set; }

        [Required]
        public string Status { get; set; } = string.Empty;
    }
}
