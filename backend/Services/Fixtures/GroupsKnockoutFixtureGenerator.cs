using MyCup.Errors;
using MyCup.Models;

namespace MyCup.Services.Fixtures;

/// <summary>
/// Generates a group stage followed by a knockout phase. Groups are drawn at random and each plays a
/// round robin (single or double round); the top teams of each group advance to a knockout bracket whose
/// first round is seeded from group standings via <see cref="Match.HomeSourceGroup"/>/
/// <see cref="Match.AwaySourceGroup"/>. The whole structure is created up front; the fixtures coordinator
/// fills the knockout slots once each group finishes (see <see cref="FixturesService"/>).
///
/// MVP scope: equal-sized groups whose count is a power of two (1, 2, 4, 8, …) and the <c>cross_adjacent</c>
/// seeding (1A×2B, 1B×2A, 1C×2D, …) with two qualifiers per group. A single group is a league whose top
/// <c>qualifiers_per_group</c> (any power of two: 2 → final, 4 → semis, 8 → quartas, …) enter a standard
/// best-vs-worst seeded bracket — i.e. round robin + knockout without a dedicated format. See
/// docs/be-008-fixtures.md.
/// </summary>
public class GroupsKnockoutFixtureGenerator : IFixtureGenerator
{
    public string Format => "groups_knockout";

    public List<Phase> Generate(List<int> teamIds, FixtureConfig config)
    {
        int n = teamIds.Count;

        if (config.GroupsCount is not int groupsCount)
            throw new BadRequestException("Informe a quantidade de grupos (groups_count)");
        if (groupsCount < 1)
            throw new BadRequestException("É necessário pelo menos 1 grupo");
        if ((groupsCount & (groupsCount - 1)) != 0)
            throw new BadRequestException("A quantidade de grupos deve ser uma potência de 2 (2, 4, 8, ...)");

        int groupSize = config.GroupSize ?? (n % groupsCount == 0
            ? n / groupsCount
            : throw new BadRequestException($"Não é possível dividir {n} times igualmente em {groupsCount} grupos"));
        if (groupSize < 2)
            throw new BadRequestException("Cada grupo precisa de pelo menos 2 times");
        if (groupsCount * groupSize != n)
            throw new BadRequestException($"A quantidade de times ({n}) não corresponde a {groupsCount} grupos de {groupSize}");

        int qualifiers = config.QualifiersPerGroup;
        if (qualifiers < 2)
            throw new BadRequestException("Cada grupo precisa classificar pelo menos 2 times");
        if (qualifiers > groupSize)
            throw new BadRequestException("O número de classificados não pode ser maior que o tamanho do grupo");

        if (groupsCount == 1)
        {
            // Single group: the qualifiers go straight into a seeded bracket, so their count must be a
            // power of two (2 → final, 4 → semis, 8 → quartas, …). Seeding is intrinsically best-vs-worst.
            if ((qualifiers & (qualifiers - 1)) != 0)
                throw new BadRequestException("Com 1 grupo, a quantidade de classificados deve ser uma potência de 2 (2, 4, 8, ...)");
        }
        else
        {
            // Multiple groups still ship the MVP scope only (two qualifiers, cross_adjacent seeding).
            if (qualifiers != 2)
                throw new BadRequestException("Com mais de 1 grupo, a classificação por grupo (qualifiers_per_group) deve ser 2");
            if (!string.Equals(config.BracketSeeding, "cross_adjacent", StringComparison.OrdinalIgnoreCase))
                throw new BadRequestException("Por enquanto, apenas o chaveamento 'cross_adjacent' é suportado");
        }

        var draw = KnockoutEngine.Shuffle(teamIds);

        // ----- Group stage -----
        var groupsPhase = new Phase { Type = "groups", Order = 1 };
        var groups = new List<Group>();
        var groupTeamIds = new List<List<int>>();

        for (int g = 0; g < groupsCount; g++)
        {
            var group = new Group { Name = $"Grupo {(char)('A' + g)}" };
            var ids = draw.Skip(g * groupSize).Take(groupSize).ToList();
            foreach (var teamId in ids)
                group.GroupTeams.Add(new GroupTeam { TeamId = teamId });
            groups.Add(group);
            groupTeamIds.Add(ids);
            groupsPhase.Groups.Add(group);
        }

        // Each group's round robin, merged matchday by matchday into shared rounds (all groups play
        // matchday 1 together, etc.). Every group has the same size, so they share matchday counts.
        var matchdaysPerGroup = groupTeamIds
            .Select(ids => RoundRobinFixtureGenerator.BuildMatchdays(ids, config.DoubleRound))
            .ToList();
        int matchdayCount = matchdaysPerGroup.Max(md => md.Count);

        for (int day = 0; day < matchdayCount; day++)
        {
            var round = new Round { Number = day + 1, Name = $"Rodada {day + 1}" };
            for (int g = 0; g < groupsCount; g++)
            {
                if (day >= matchdaysPerGroup[g].Count)
                    continue;
                foreach (var match in matchdaysPerGroup[g][day])
                {
                    match.Group = groups[g];
                    round.Matches.Add(match);
                }
            }
            groupsPhase.Rounds.Add(round);
        }

        // ----- Knockout phase (cross_adjacent) -----
        var knockoutPhase = new Phase { Type = "knockout", Order = 2 };
        int firstRoundNumber = matchdayCount + 1;
        var firstRound = new Round { Number = firstRoundNumber, Name = KnockoutEngine.NameForTeams(groupsCount * qualifiers) };

        if (groupsCount == 1)
        {
            // Single group: the top `qualifiers` enter a standard seeded bracket (1st vs last, 2nd vs
            // second-to-last, …) so the two best only meet at the end. With 2 qualifiers this is just a final.
            var seedOrder = KnockoutEngine.SeedOrder(qualifiers);
            for (int i = 0; i < seedOrder.Count; i += 2)
                firstRound.Matches.Add(GroupSeedMatch(groups[0], seedOrder[i], groups[0], seedOrder[i + 1]));
        }
        else
        {
            // Pair adjacent groups: winner of one faces the runner-up of the other and vice versa.
            for (int g = 0; g < groupsCount; g += 2)
            {
                var first = groups[g];
                var second = groups[g + 1];
                firstRound.Matches.Add(GroupSeedMatch(first, 1, second, 2));
                firstRound.Matches.Add(GroupSeedMatch(second, 1, first, 2));
            }
        }
        knockoutPhase.Rounds.Add(firstRound);

        foreach (var round in KnockoutEngine.BuildAdvancementFromMatches(firstRound.Matches.ToList(), firstRoundNumber + 1, config.ThirdPlace))
            knockoutPhase.Rounds.Add(round);

        return new List<Phase> { groupsPhase, knockoutPhase };
    }

    private static Match GroupSeedMatch(Group homeGroup, int homeRank, Group awayGroup, int awayRank) => new()
    {
        Status = "scheduled",
        Date = DateTime.UtcNow,
        HomeSourceGroup = homeGroup,
        HomeSourceGroupRank = homeRank,
        AwaySourceGroup = awayGroup,
        AwaySourceGroupRank = awayRank
    };
}
