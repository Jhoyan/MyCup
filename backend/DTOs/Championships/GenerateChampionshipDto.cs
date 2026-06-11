namespace MyCup.DTOs.Championships
{
    /// <summary>
    /// Parameters for generating a championship's fixtures. All fields are optional and fall back to
    /// sensible defaults; only the fields relevant to the championship's format are used. The values
    /// actually applied are persisted as ChampionshipRule key-values.
    /// </summary>
    public class GenerateChampionshipDto
    {
        /// <summary>Round robin / group stage played home and away (double round).</summary>
        public bool DoubleRound { get; set; } = false;

        /// <summary>Knockout formats play a third-place match.</summary>
        public bool ThirdPlace { get; set; } = false;

        /// <summary>Knockout elimination mode: "single" or "double".</summary>
        public string Elimination { get; set; } = "single";

        /// <summary>Groups_knockout bracket seeding: "cross_adjacent" or "seeded_best_vs_worst".</summary>
        public string BracketSeeding { get; set; } = "cross_adjacent";

        /// <summary>Number of groups (groups_knockout only).</summary>
        public int? GroupsCount { get; set; }

        /// <summary>Teams per group (groups_knockout only).</summary>
        public int? GroupSize { get; set; }

        /// <summary>Teams that advance from each group (groups_knockout only).</summary>
        public int QualifiersPerGroup { get; set; } = 2;
    }
}
