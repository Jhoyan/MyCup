using Microsoft.EntityFrameworkCore;
using MyCup.Data;
using MyCup.DTOs.Championships;
using MyCup.Errors;
using MyCup.Models;
using MyCup.Services.Authorization;
using MyCup.Services.Fixtures;

namespace MyCup.Services;

/// <summary>
/// Coordinates fixture generation: validates pre-conditions, picks the right generator for the
/// championship's format, (re)builds the phase graph, and persists the configuration that was used.
/// </summary>
public class FixturesService
{
    private readonly AppDbContext _context;
    private readonly UniverseAuthorizer _authorizer;
    private readonly Dictionary<string, IFixtureGenerator> _generators;

    public FixturesService(AppDbContext context, UniverseAuthorizer authorizer, IEnumerable<IFixtureGenerator> generators)
    {
        _context = context;
        _authorizer = authorizer;
        _generators = generators.ToDictionary(g => g.Format, StringComparer.OrdinalIgnoreCase);
    }

    public async Task GenerateAsync(int championshipId, GenerateChampionshipDto dto)
    {
        var championship = await _context.Championships
            .Include(c => c.Format)
            .Include(c => c.ChampionshipTeams)
            .Include(c => c.Phases)
                .ThenInclude(p => p.Rounds)
                    .ThenInclude(r => r.Matches)
            .FirstOrDefaultAsync(c => c.Id == championshipId);

        if (championship == null)
            throw new NotFoundException("Campeonato não encontrado");

        await _authorizer.RequireRoleAsync(championship.UniverseId, UniverseRole.Admin);

        if (!_generators.TryGetValue(championship.Format.Type, out var generator))
            throw new BadRequestException($"Geração não suportada para o formato '{championship.Format.Type}'");

        // Regeneration is only allowed while nothing has been played yet.
        var existingMatches = championship.Phases
            .SelectMany(p => p.Rounds)
            .SelectMany(r => r.Matches)
            .ToList();

        if (existingMatches.Any(m => m.Status != "scheduled"))
            throw new ConflictException("Não é possível gerar: já há partidas em andamento ou finalizadas");

        if (championship.Phases.Count > 0)
            _context.Phases.RemoveRange(championship.Phases);

        var teamIds = championship.ChampionshipTeams.Select(ct => ct.TeamId).ToList();
        var config = new FixtureConfig(
            dto.DoubleRound,
            dto.ThirdPlace,
            dto.Elimination,
            dto.BracketSeeding,
            dto.GroupsCount,
            dto.GroupSize,
            dto.QualifiersPerGroup);

        var phases = generator.Generate(teamIds, config);
        foreach (var phase in phases)
            championship.Phases.Add(phase);

        await PersistConfigAsync(championshipId, championship.Format.Type, dto);

        await _context.SaveChangesAsync();
    }

    /// <summary>
    /// Called after a match result is saved, to keep a generated bracket consistent. For a knockout match
    /// it fills (or clears, on a reverted result) the slots of any match fed by its winner/loser; for a
    /// group-stage match it fills the knockout slots seeded from that group once the group is decided.
    /// Does nothing for a plain league match. Dependents that already have a result are left untouched.
    /// </summary>
    public async Task PropagateResultAsync(int matchId)
    {
        var match = await _context.Matches
            .Include(m => m.Round)
                .ThenInclude(r => r.Phase)
            .FirstOrDefaultAsync(m => m.Id == matchId);

        if (match == null)
            return;

        if (match.Round.Phase.Type == "knockout")
            await PropagateKnockoutSlotsAsync(match);
        else if (match.Round.Phase.Type == "groups" && match.GroupId is int groupId)
            await PropagateGroupQualifiersAsync(groupId, match.Round.Phase.ChampionshipId);
    }

    /// <summary>
    /// Fills (or clears) the team slots of any match fed by this knockout match's winner/loser so the
    /// bracket stays consistent and downstream matches become playable once both their feeders are decided.
    /// </summary>
    private async Task PropagateKnockoutSlotsAsync(Match match)
    {
        var dependents = await _context.Matches
            .Where(m => m.HomeSourceMatchId == match.Id || m.AwaySourceMatchId == match.Id)
            .ToListAsync();

        if (dependents.Count == 0)
            return;

        // A finished match feeds a winner/loser forward; otherwise the slots it fed must be cleared.
        int? winner = null, loser = null;
        if (match.Status == "finished")
            (winner, loser) = KnockoutEngine.ResolveWinner(match);

        foreach (var dependent in dependents)
        {
            // Never overwrite a dependent that has already been played.
            if (dependent.Status != "scheduled")
                continue;

            if (dependent.HomeSourceMatchId == match.Id)
                dependent.HomeTeamId = SlotTeam(dependent.HomeSourceOutcome, winner, loser);
            if (dependent.AwaySourceMatchId == match.Id)
                dependent.AwayTeamId = SlotTeam(dependent.AwaySourceOutcome, winner, loser);
        }

        await _context.SaveChangesAsync();
    }

    /// <summary>
    /// Once every match of a group is finished, ranks the group and fills the knockout slots seeded from
    /// it (by 1-based position). While the group is still incomplete those slots are cleared, so reverting
    /// a group result keeps the bracket consistent.
    /// </summary>
    private async Task PropagateGroupQualifiersAsync(int groupId, int championshipId)
    {
        var dependents = await _context.Matches
            .Where(m => m.HomeSourceGroupId == groupId || m.AwaySourceGroupId == groupId)
            .ToListAsync();

        if (dependents.Count == 0)
            return;

        var groupMatches = await _context.Matches
            .Where(m => m.GroupId == groupId)
            .ToListAsync();

        List<int>? ranking = null;
        if (groupMatches.All(m => m.Status == "finished"))
        {
            var teamIds = await _context.GroupTeams
                .Where(gt => gt.GroupId == groupId)
                .Select(gt => gt.TeamId)
                .ToListAsync();
            var (winPoints, drawPoints) = await GetPointsRulesAsync(championshipId);
            ranking = RankGroup(teamIds, groupMatches, winPoints, drawPoints);
        }

        foreach (var dependent in dependents)
        {
            if (dependent.Status != "scheduled")
                continue;

            if (dependent.HomeSourceGroupId == groupId)
                dependent.HomeTeamId = SlotTeamFromGroup(ranking, dependent.HomeSourceGroupRank);
            if (dependent.AwaySourceGroupId == groupId)
                dependent.AwayTeamId = SlotTeamFromGroup(ranking, dependent.AwaySourceGroupRank);
        }

        await _context.SaveChangesAsync();
    }

    /// <summary>
    /// The team that should occupy a slot fed by a source match: the winner or loser per the slot's
    /// configured outcome, or null when the source is no longer decided (so the slot is emptied).
    /// </summary>
    private static int? SlotTeam(string? outcome, int? winner, int? loser)
    {
        if (winner == null)
            return null;
        return outcome == KnockoutEngine.Loser ? loser : winner;
    }

    /// <summary>The team at the given 1-based group position, or null while the group is undecided.</summary>
    private static int? SlotTeamFromGroup(List<int>? ranking, int? rank)
    {
        if (ranking == null || rank is not int position || position < 1 || position > ranking.Count)
            return null;
        return ranking[position - 1];
    }

    /// <summary>Reads the championship's win/draw point rules, defaulting to 3 and 1.</summary>
    private async Task<(int WinPoints, int DrawPoints)> GetPointsRulesAsync(int championshipId)
    {
        var rules = await _context.ChampionshipRules
            .Where(r => r.ChampionshipId == championshipId && (r.Key == "win_points" || r.Key == "draw_points"))
            .ToListAsync();

        int win = ParseRule(rules, "win_points", 3);
        int draw = ParseRule(rules, "draw_points", 1);
        return (win, draw);

        static int ParseRule(List<ChampionshipRule> rules, string key, int fallback)
        {
            var rule = rules.FirstOrDefault(r => r.Key == key);
            return rule != null && int.TryParse(rule.Value, out var value) ? value : fallback;
        }
    }

    /// <summary>
    /// Ranks the teams of a group from its finished matches. Order: points, goal difference, goals for,
    /// wins, then team id as a deterministic final tiebreak.
    /// </summary>
    private static List<int> RankGroup(List<int> teamIds, List<Match> matches, int winPoints, int drawPoints)
    {
        var rows = teamIds.ToDictionary(id => id, id => new GroupRow { TeamId = id });

        foreach (var match in matches.Where(m => m.Status == "finished"))
        {
            if (match.HomeTeamId is not int home || match.AwayTeamId is not int away)
                continue;
            if (!rows.TryGetValue(home, out var homeRow) || !rows.TryGetValue(away, out var awayRow))
                continue;

            homeRow.GoalsFor += match.HomeGoals;
            homeRow.GoalsAgainst += match.AwayGoals;
            awayRow.GoalsFor += match.AwayGoals;
            awayRow.GoalsAgainst += match.HomeGoals;

            if (match.HomeGoals > match.AwayGoals) { homeRow.Points += winPoints; homeRow.Wins++; }
            else if (match.AwayGoals > match.HomeGoals) { awayRow.Points += winPoints; awayRow.Wins++; }
            else { homeRow.Points += drawPoints; awayRow.Points += drawPoints; }
        }

        return rows.Values
            .OrderByDescending(r => r.Points)
            .ThenByDescending(r => r.GoalsFor - r.GoalsAgainst)
            .ThenByDescending(r => r.GoalsFor)
            .ThenByDescending(r => r.Wins)
            .ThenBy(r => r.TeamId)
            .Select(r => r.TeamId)
            .ToList();
    }

    private sealed class GroupRow
    {
        public int TeamId { get; init; }
        public int Points { get; set; }
        public int GoalsFor { get; set; }
        public int GoalsAgainst { get; set; }
        public int Wins { get; set; }
    }

    /// <summary>
    /// Upserts the configuration actually used into ChampionshipRule, recording only the keys relevant
    /// to the championship's format.
    /// </summary>
    private async Task PersistConfigAsync(int championshipId, string format, GenerateChampionshipDto dto)
    {
        var values = new Dictionary<string, string>();

        if (format is "round_robin" or "groups_knockout")
            values["double_round"] = dto.DoubleRound.ToString().ToLowerInvariant();

        if (format is "knockout" or "groups_knockout")
        {
            values["third_place"] = dto.ThirdPlace.ToString().ToLowerInvariant();
            values["elimination"] = dto.Elimination;
        }

        if (format == "groups_knockout")
        {
            values["bracket_seeding"] = dto.BracketSeeding;
            values["qualifiers_per_group"] = dto.QualifiersPerGroup.ToString();
            if (dto.GroupsCount.HasValue)
                values["groups_count"] = dto.GroupsCount.Value.ToString();
            if (dto.GroupSize.HasValue)
                values["group_size"] = dto.GroupSize.Value.ToString();
        }

        if (values.Count == 0)
            return;

        var existing = await _context.ChampionshipRules
            .Where(r => r.ChampionshipId == championshipId && values.Keys.Contains(r.Key))
            .ToListAsync();

        foreach (var (key, value) in values)
        {
            var rule = existing.FirstOrDefault(r => r.Key == key);
            if (rule == null)
                _context.ChampionshipRules.Add(new ChampionshipRule { ChampionshipId = championshipId, Key = key, Value = value });
            else
                rule.Value = value;
        }
    }
}
