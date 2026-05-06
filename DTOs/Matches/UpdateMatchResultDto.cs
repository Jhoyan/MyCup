using System.ComponentModel.DataAnnotations;
using MyCup.Models;
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

        public List<MatchStatisticInputDto> Statistics { get; set; } = new();
        public int MatchId { get; set; }
        public string Result { get; set; } = string.Empty;
        public MatchStatistic matchStatistic { get; set; } = new MatchStatistic();
    }
}
