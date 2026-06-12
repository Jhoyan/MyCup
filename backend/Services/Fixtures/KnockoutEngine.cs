using MyCup.Errors;
using MyCup.Models;

namespace MyCup.Services.Fixtures;

/// <summary>
/// Single-elimination bracket helpers. <see cref="BuildBracket"/> produces the WHOLE bracket up front:
/// every round and match exists from the start, with later matches linked to the matches that feed them
/// (<see cref="Match.HomeSourceMatch"/>/<see cref="Match.AwaySourceMatch"/>) and their team slots left
/// empty until those results come in. This lets the admin record results in any order — a match becomes
/// playable as soon as its own two feeders are decided, without waiting for the rest of the round.
/// The fixtures coordinator fills the slots; see <see cref="FixturesService"/> and docs/be-008-fixtures.md.
/// </summary>
public static class KnockoutEngine
{
    public const string Winner = "winner";
    public const string Loser = "loser";

    /// <summary>
    /// Builds the full single-elimination bracket from the team pool. Teams are drawn at random; when the
    /// pool is not a power of two, the surplus teams receive a bye and are seeded straight into round two.
    /// When <paramref name="thirdPlace"/> is set and both semifinals are real matches, a third-place match
    /// (fed by the two semifinal losers) is appended.
    /// </summary>
    public static List<Round> BuildBracket(List<int> teamIds, bool thirdPlace)
    {
        if (teamIds.Count < 2)
            throw new BadRequestException("São necessários pelo menos 2 times para gerar o campeonato");

        var draw = Shuffle(teamIds);
        int bracketSize = NextPowerOfTwo(draw.Count);
        int byes = bracketSize - draw.Count;
        var byeTeams = draw.Take(byes).ToList();
        var playIn = draw.Skip(byes).ToList();

        var rounds = new List<Round>();

        // Round 1: the play-in matches (teams known). Byed teams sit this round out.
        var firstRound = new Round { Number = 1, Name = NameForTeams(bracketSize) };
        var winners = new List<Advancer>();
        for (int i = 0; i < playIn.Count; i += 2)
        {
            var match = NewMatch(playIn[i], playIn[i + 1]);
            firstRound.Matches.Add(match);
            winners.Add(new WinnerAdvancer(match));
        }
        rounds.Add(firstRound);

        // Feed into round two: byes interleaved with round-one winners so a bye meets a winner, not a bye.
        var current = Interleave(
            byeTeams.Select(t => (Advancer)new TeamAdvancer(t)).ToList(),
            winners);

        int number = 2;
        while (current.Count > 1)
        {
            var round = new Round { Number = number, Name = NameForTeams(current.Count) };
            var next = new List<Advancer>();
            for (int i = 0; i < current.Count; i += 2)
            {
                var match = new Match { Status = "scheduled", Date = DateTime.UtcNow };
                ApplySlot(match, current[i], home: true);
                ApplySlot(match, current[i + 1], home: false);
                round.Matches.Add(match);
                next.Add(new WinnerAdvancer(match));
            }
            rounds.Add(round);
            current = next;
            number++;
        }

        // The last round always holds exactly one match: the final.
        var finalRound = rounds[^1];
        var finalMatch = finalRound.Matches.First();

        if (thirdPlace && finalMatch.HomeSourceMatch != null && finalMatch.AwaySourceMatch != null)
        {
            var thirdPlaceRound = new Round
            {
                Number = finalRound.Number,
                Name = "Disputa de 3º lugar",
                Bracket = "third_place"
            };
            var match = new Match
            {
                Status = "scheduled",
                Date = DateTime.UtcNow,
                HomeSourceMatch = finalMatch.HomeSourceMatch,
                HomeSourceOutcome = Loser,
                AwaySourceMatch = finalMatch.AwaySourceMatch,
                AwaySourceOutcome = Loser
            };
            thirdPlaceRound.Matches.Add(match);
            rounds.Add(thirdPlaceRound);
        }

        return rounds;
    }

    /// <summary>
    /// Resolves a finished knockout match into its (winner, loser). A draw is broken by the penalty
    /// shootout; an unresolved or still-tied shootout is rejected so the result can be completed.
    /// </summary>
    public static (int WinnerTeamId, int LoserTeamId) ResolveWinner(Match match)
    {
        if (match.HomeTeamId is not int home || match.AwayTeamId is not int away)
            throw new BadRequestException("Os times desta partida ainda não foram definidos");

        if (match.HomeGoals > match.AwayGoals)
            return (home, away);
        if (match.AwayGoals > match.HomeGoals)
            return (away, home);

        if (match.HomePenalties is null || match.AwayPenalties is null)
            throw new BadRequestException("Partida eliminatória empatada precisa do resultado dos pênaltis para avançar");
        if (match.HomePenalties > match.AwayPenalties)
            return (home, away);
        if (match.AwayPenalties > match.HomePenalties)
            return (away, home);

        throw new BadRequestException("Os pênaltis também terminaram empatados; informe um vencedor");
    }

    /// <summary>Creates a scheduled knockout match between two known teams.</summary>
    public static Match NewMatch(int homeTeamId, int awayTeamId) => new()
    {
        HomeTeamId = homeTeamId,
        AwayTeamId = awayTeamId,
        Status = "scheduled",
        Date = DateTime.UtcNow
    };

    /// <summary>Friendly stage name for a round, based on how many teams contest it.</summary>
    public static string NameForTeams(int teams) => teams switch
    {
        2 => "Final",
        4 => "Semifinal",
        8 => "Quartas de final",
        16 => "Oitavas de final",
        _ => $"Fase de {teams}"
    };

    /// <summary>Fisher-Yates shuffle for the random draw.</summary>
    public static List<int> Shuffle(IEnumerable<int> source)
    {
        var list = source.ToList();
        for (int i = list.Count - 1; i > 0; i--)
        {
            int j = Random.Shared.Next(i + 1);
            (list[i], list[j]) = (list[j], list[i]);
        }
        return list;
    }

    private static void ApplySlot(Match match, Advancer advancer, bool home)
    {
        switch (advancer)
        {
            case TeamAdvancer team:
                if (home) match.HomeTeamId = team.TeamId;
                else match.AwayTeamId = team.TeamId;
                break;
            case WinnerAdvancer winner:
                if (home) { match.HomeSourceMatch = winner.Source; match.HomeSourceOutcome = Winner; }
                else { match.AwaySourceMatch = winner.Source; match.AwaySourceOutcome = Winner; }
                break;
        }
    }

    /// <summary>Alternates byes and winners (bye, winner, bye, winner, …) so byes do not only meet byes.</summary>
    private static List<Advancer> Interleave(List<Advancer> byes, List<Advancer> winners)
    {
        var result = new List<Advancer>();
        int i = 0, j = 0;
        while (i < byes.Count || j < winners.Count)
        {
            if (i < byes.Count) result.Add(byes[i++]);
            if (j < winners.Count) result.Add(winners[j++]);
        }
        return result;
    }

    private static int NextPowerOfTwo(int n)
    {
        int power = 1;
        while (power < n)
            power <<= 1;
        return power;
    }

    /// <summary>A team entering the next round: either already known (a bye) or the winner of a match.</summary>
    private abstract record Advancer;
    private sealed record TeamAdvancer(int TeamId) : Advancer;
    private sealed record WinnerAdvancer(Match Source) : Advancer;
}
