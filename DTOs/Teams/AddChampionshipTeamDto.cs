using System.ComponentModel.DataAnnotations;

namespace MyCup.DTOs.Teams
{
    public class AddChampionshipTeamDto
    {
        public int? TeamId { get; set; }

        [MaxLength(120)]
        public string? Name { get; set; }
    }
}
