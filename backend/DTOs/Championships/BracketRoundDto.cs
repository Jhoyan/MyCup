namespace MyCup.DTOs.Championships
{
    public class BracketRoundDto
    {
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// Bracket this round belongs to: null (single bracket), "upper"/"lower"/"grand_final" (double
        /// elimination) or "third_place". Lets the frontend group the rounds.
        /// </summary>
        public string? Bracket { get; set; }

        public List<BracketMatchDto> Matches { get; set; } = new();
    }
}
