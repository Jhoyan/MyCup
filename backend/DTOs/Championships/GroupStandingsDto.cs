namespace MyCup.DTOs.Championships
{
    /// <summary>
    /// Standings of a single group in the groups_knockout format. The overall flat
    /// <see cref="ChampionshipDetailDto.Standings"/> is not used for this format.
    /// </summary>
    public class GroupStandingsDto
    {
        public string Group { get; set; } = string.Empty;
        public List<StandingsRowDto> Standings { get; set; } = new();
    }
}
