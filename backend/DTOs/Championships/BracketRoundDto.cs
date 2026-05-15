namespace MyCup.DTOs.Championships
{
    public class BracketRoundDto
    {
        public string Name { get; set; } = string.Empty;
        public List<BracketMatchDto> Matches { get; set; } = new();
    }
}
