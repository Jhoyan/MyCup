using MyCup.Errors;
using MyCup.Models;

namespace MyCup.Services.Fixtures;

/// <summary>
/// Generates a round-robin (league) schedule using the circle method. Supports an optional return leg
/// (double round) and a bye when the number of teams is odd.
/// </summary>
public class RoundRobinFixtureGenerator : IFixtureGenerator
{
    public string Format => "round_robin";

    public List<Phase> Generate(List<int> teamIds, FixtureConfig config)
    {
        if (teamIds.Count < 2)
            throw new BadRequestException("São necessários pelo menos 2 times para gerar o campeonato");

        var phase = new Phase { Type = "round_robin", Order = 1 };

        foreach (var round in BuildRounds(teamIds, config.DoubleRound))
            phase.Rounds.Add(round);

        return new List<Phase> { phase };
    }

    private static List<Round> BuildRounds(List<int> teamIds, bool doubleRound)
    {
        var rounds = new List<Round>();
        var matchdays = BuildMatchdays(teamIds, doubleRound);
        for (int i = 0; i < matchdays.Count; i++)
        {
            var round = new Round { Number = i + 1 };
            foreach (var match in matchdays[i])
                round.Matches.Add(match);
            rounds.Add(round);
        }
        return rounds;
    }

    /// <summary>
    /// Builds the round-robin schedule as a list of matchdays (each a list of matches) using the circle
    /// method, with an optional return leg. Reused by the groups_knockout generator to schedule each group.
    /// </summary>
    public static List<List<Match>> BuildMatchdays(List<int> teamIds, bool doubleRound)
    {
        // Circle method: a null entry represents the bye when the team count is odd.
        var slots = new List<int?>(teamIds.Select(t => (int?)t));
        if (slots.Count % 2 != 0)
            slots.Add(null);

        int n = slots.Count;
        int roundsPerLeg = n - 1;
        int half = n / 2;

        var matchdays = new List<List<Match>>();

        for (int r = 0; r < roundsPerLeg; r++)
        {
            var matchday = new List<Match>();

            for (int i = 0; i < half; i++)
            {
                var first = slots[i];
                var second = slots[n - 1 - i];
                if (first is null || second is null)
                    continue; // bye

                // Alternate venues each round so home/away stays balanced.
                var (home, away) = r % 2 == 0
                    ? (first.Value, second.Value)
                    : (second.Value, first.Value);

                matchday.Add(NewMatch(home, away));
            }

            matchdays.Add(matchday);
            Rotate(slots);
        }

        if (doubleRound)
        {
            var secondLeg = matchdays
                .Select(day => day.Select(m => NewMatch(m.AwayTeamId!.Value, m.HomeTeamId!.Value)).ToList())
                .ToList();
            matchdays.AddRange(secondLeg);
        }

        return matchdays;
    }

    /// <summary>Rotates all slots clockwise while keeping the first slot fixed (circle method).</summary>
    private static void Rotate(List<int?> slots)
    {
        int n = slots.Count;
        if (n <= 2)
            return;

        var last = slots[n - 1];
        for (int i = n - 1; i > 1; i--)
            slots[i] = slots[i - 1];
        slots[1] = last;
    }

    private static Match NewMatch(int homeTeamId, int awayTeamId) => new()
    {
        HomeTeamId = homeTeamId,
        AwayTeamId = awayTeamId,
        Status = "scheduled",
        Date = DateTime.UtcNow
    };
}
