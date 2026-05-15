using System.ComponentModel.DataAnnotations;

namespace MyCup.DTOs.Matches
{
    public class MatchStatisticInputDto
    {
        [Required]
        public int PlayerId { get; set; }

        [Range(0, int.MaxValue)]
        public int Goals { get; set; }

        [Range(0, int.MaxValue)]
        public int Assists { get; set; }
    }
}
