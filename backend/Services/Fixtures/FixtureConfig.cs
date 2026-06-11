namespace MyCup.Services.Fixtures;

/// <summary>
/// Parsed, format-agnostic configuration consumed by the fixture generators.
/// </summary>
public record FixtureConfig(
    bool DoubleRound,
    bool ThirdPlace,
    string Elimination,
    string BracketSeeding,
    int? GroupsCount,
    int? GroupSize,
    int QualifiersPerGroup);
