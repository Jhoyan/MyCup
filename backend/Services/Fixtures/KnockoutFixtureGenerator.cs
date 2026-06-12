using MyCup.Models;

namespace MyCup.Services.Fixtures;

/// <summary>
/// Generates a single-elimination knockout bracket. The whole bracket (every round and match) is created
/// up front; later matches start with empty team slots linked to the matches that feed them, and the
/// fixtures coordinator fills those slots as results are recorded (see <see cref="FixturesService"/> and
/// docs/be-008-fixtures.md). Double elimination is not implemented yet.
/// </summary>
public class KnockoutFixtureGenerator : IFixtureGenerator
{
    public string Format => "knockout";

    public List<Phase> Generate(List<int> teamIds, FixtureConfig config)
    {
        var phase = new Phase { Type = "knockout", Order = 1 };
        foreach (var round in KnockoutEngine.BuildBracket(teamIds, config.ThirdPlace))
            phase.Rounds.Add(round);
        return new List<Phase> { phase };
    }
}
