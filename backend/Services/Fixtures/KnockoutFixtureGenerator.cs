using MyCup.Errors;
using MyCup.Models;

namespace MyCup.Services.Fixtures;

/// <summary>
/// Generates a single/double elimination bracket. Not implemented yet — see docs/be-008-fixtures.md.
/// </summary>
public class KnockoutFixtureGenerator : IFixtureGenerator
{
    public string Format => "knockout";

    public List<Phase> Generate(List<int> teamIds, FixtureConfig config)
    {
        throw new BadRequestException("A geração do formato eliminatório ainda não está disponível");
    }
}
