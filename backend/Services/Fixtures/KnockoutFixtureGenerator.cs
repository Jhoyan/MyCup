using MyCup.Models;

namespace MyCup.Services.Fixtures;

/// <summary>
/// Generates a knockout bracket, single (default) or double elimination (<c>elimination = double</c>).
/// The whole bracket (every round and match) is created up front; later matches start with empty team
/// slots linked to the matches that feed them, and the fixtures coordinator fills those slots as results
/// are recorded (see <see cref="FixturesService"/> and docs/be-008-fixtures.md).
/// </summary>
public class KnockoutFixtureGenerator : IFixtureGenerator
{
    public string Format => "knockout";

    public List<Phase> Generate(List<int> teamIds, FixtureConfig config)
    {
        var isDouble = string.Equals(config.Elimination, "double", StringComparison.OrdinalIgnoreCase);

        var rounds = isDouble
            ? KnockoutEngine.BuildDoubleEliminationBracket(teamIds)
            : KnockoutEngine.BuildBracket(teamIds, config.ThirdPlace);

        var phase = new Phase { Type = "knockout", Order = 1 };
        foreach (var round in rounds)
            phase.Rounds.Add(round);
        return new List<Phase> { phase };
    }
}
