using MyCup.Errors;
using MyCup.Models;

namespace MyCup.Services.Fixtures;

/// <summary>
/// Generates a group stage followed by a knockout phase. Not implemented yet — see docs/be-008-fixtures.md.
/// </summary>
public class GroupsKnockoutFixtureGenerator : IFixtureGenerator
{
    public string Format => "groups_knockout";

    public List<Phase> Generate(List<int> teamIds, FixtureConfig config)
    {
        throw new BadRequestException("A geração do formato grupos + mata-mata ainda não está disponível");
    }
}
