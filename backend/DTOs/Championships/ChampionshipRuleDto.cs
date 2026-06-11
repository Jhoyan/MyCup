using System.ComponentModel.DataAnnotations;

namespace MyCup.DTOs.Championships
{
    /// <summary>
    /// A configurable key-value rule of a championship (e.g. away_goal = true, win_points = 3).
    /// </summary>
    public class ChampionshipRuleDto
    {
        [Required]
        [MaxLength(80)]
        public string Key { get; set; } = string.Empty;

        [Required]
        [MaxLength(120)]
        public string Value { get; set; } = string.Empty;
    }
}
