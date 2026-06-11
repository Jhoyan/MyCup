using MyCup.Models;

namespace MyCup.Services.Fixtures;

/// <summary>
/// Generates the phases/rounds/matches for a championship of a specific format. Implementations build
/// an in-memory entity graph (Phase -> Round -> Match) that the coordinator attaches to the championship
/// and persists. Generation is round-by-round friendly: knockout/groups implementations may create only
/// the first playable rounds and rely on automatic advancement for the rest.
/// </summary>
public interface IFixtureGenerator
{
    /// <summary>Format type this generator handles (matches <see cref="Format.Type"/>).</summary>
    string Format { get; }

    /// <summary>Builds the phase graph for the given team pool and configuration.</summary>
    List<Phase> Generate(List<int> teamIds, FixtureConfig config);
}
