using System.ComponentModel.DataAnnotations;

namespace MyCup.DTOs.Matches
{
    public class UpdateMatchResultDto
    {
        [Range(0, int.MaxValue)]
        public int HomeGoals { get; set; }

        [Range(0, int.MaxValue)]
        public int AwayGoals { get; set; }

        /// <summary>
        /// Penalty shootout goals for the home team, used to decide a drawn knockout tie. Null when there
        /// was no shootout.
        /// </summary>
        [Range(0, int.MaxValue)]
        public int? HomePenalties { get; set; }

        /// <summary>
        /// Penalty shootout goals for the away team, used to decide a drawn knockout tie. Null when there
        /// was no shootout.
        /// </summary>
        [Range(0, int.MaxValue)]
        public int? AwayPenalties { get; set; }

        [Required]
        public string Status { get; set; } = string.Empty;
    }
}
