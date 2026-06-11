using Microsoft.EntityFrameworkCore;
using MyCup.Data;
using MyCup.DTOs.Dashboard;

namespace MyCup.Services;

/// <summary>
/// Service responsible for the dashboard read models. All data is scoped to the universes the
/// authenticated user belongs to (via UserUniverse). Player metrics are derived from match results:
/// each player controls one team per championship (PlayerChampionship), so a player's goals/wins/losses
/// are those of the team they controlled, summed across the championships in scope.
/// </summary>
public class DashboardService
{
    private const int TopCount = 5;
    private const int RecentCount = 10;

    private readonly AppDbContext _context;

    public DashboardService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<DashboardSummaryDto> GetSummaryAsync(int userId)
    {
        var universeIds = await GetUserUniverseIdsAsync(userId);

        if (universeIds.Count == 0)
            return new DashboardSummaryDto();

        var activePlayers = await _context.Players
            .CountAsync(p => universeIds.Contains(p.UniverseId) && p.IsActive);

        // A championship is "finished" only when it has matches and all of them are finished.
        var championships = await _context.Championships
            .Where(c => universeIds.Contains(c.UniverseId))
            .Select(c => new
            {
                Total = c.Phases.SelectMany(p => p.Rounds).SelectMany(r => r.Matches).Count(),
                Finished = c.Phases.SelectMany(p => p.Rounds).SelectMany(r => r.Matches)
                    .Count(m => m.Status == "finished")
            })
            .ToListAsync();

        var pendingChampionships = championships.Count(c => c.Total == 0 || c.Finished < c.Total);

        var pendingMatches = await _context.Matches
            .CountAsync(m => universeIds.Contains(m.Round.Phase.Championship.UniverseId)
                && m.Status != "finished");

        return new DashboardSummaryDto
        {
            TotalUniverses = universeIds.Count,
            PendingChampionships = pendingChampionships,
            ActivePlayers = activePlayers,
            PendingMatches = pendingMatches
        };
    }

    public async Task<DashboardTopPlayersDto> GetTopPlayersAsync(int userId)
    {
        var universeIds = await GetUserUniverseIdsAsync(userId);

        var result = new DashboardTopPlayersDto();
        if (universeIds.Count == 0)
            return result;

        var matches = await _context.Matches
            .Where(m => m.Status == "finished"
                && universeIds.Contains(m.Round.Phase.Championship.UniverseId))
            .Select(m => new
            {
                ChampionshipId = m.Round.Phase.ChampionshipId,
                m.HomeTeamId,
                m.AwayTeamId,
                m.HomeGoals,
                m.AwayGoals
            })
            .ToListAsync();

        if (matches.Count == 0)
            return result;

        var championshipIds = matches.Select(m => m.ChampionshipId).Distinct().ToList();

        var enrollments = await _context.PlayerChampionships
            .Where(pc => championshipIds.Contains(pc.ChampionshipId)
                && pc.TeamId != null
                && pc.Player.IsActive)
            .Select(pc => new
            {
                pc.ChampionshipId,
                TeamId = pc.TeamId!.Value,
                pc.PlayerId,
                PlayerName = pc.Player.Name
            })
            .ToListAsync();

        // (championship, team) -> player who controls that team in that championship
        var teamToPlayer = enrollments.ToDictionary(
            e => (e.ChampionshipId, e.TeamId),
            e => (e.PlayerId, e.PlayerName));

        var stats = new Dictionary<int, PlayerAggregate>();

        foreach (var match in matches)
        {
            ApplySide(stats, teamToPlayer, match.ChampionshipId, match.HomeTeamId, match.HomeGoals, match.AwayGoals);
            ApplySide(stats, teamToPlayer, match.ChampionshipId, match.AwayTeamId, match.AwayGoals, match.HomeGoals);
        }

        result.MostWins = stats.Values
            .Where(s => s.Wins > 0)
            .OrderByDescending(s => s.Wins)
            .ThenBy(s => s.Name)
            .Take(TopCount)
            .Select(s => new TopWinsPlayerDto { PlayerId = s.PlayerId, Name = s.Name, Wins = s.Wins })
            .ToList();

        result.MostGoals = stats.Values
            .Where(s => s.Goals > 0)
            .OrderByDescending(s => s.Goals)
            .ThenBy(s => s.Name)
            .Take(TopCount)
            .Select(s => new TopGoalsPlayerDto { PlayerId = s.PlayerId, Name = s.Name, Goals = s.Goals })
            .ToList();

        result.MostLosses = stats.Values
            .Where(s => s.Losses > 0)
            .OrderByDescending(s => s.Losses)
            .ThenBy(s => s.Name)
            .Take(TopCount)
            .Select(s => new TopLossesPlayerDto { PlayerId = s.PlayerId, Name = s.Name, Losses = s.Losses })
            .ToList();

        return result;
    }

    public async Task<List<RecentResultDto>> GetRecentResultsAsync(int userId)
    {
        var universeIds = await GetUserUniverseIdsAsync(userId);

        if (universeIds.Count == 0)
            return new List<RecentResultDto>();

        return await _context.Matches
            .Where(m => m.Status == "finished"
                && universeIds.Contains(m.Round.Phase.Championship.UniverseId))
            .OrderByDescending(m => m.Date)
            .Take(RecentCount)
            .Select(m => new RecentResultDto
            {
                Id = m.Id,
                Championship = m.Round.Phase.Championship.Name,
                Round = m.Round.Name ?? ("Rodada " + m.Round.Number),
                HomeTeam = m.HomeTeam.Name,
                AwayTeam = m.AwayTeam.Name,
                HomeGoals = m.HomeGoals,
                AwayGoals = m.AwayGoals,
                Date = m.Date
            })
            .ToListAsync();
    }

    private static void ApplySide(
        Dictionary<int, PlayerAggregate> stats,
        Dictionary<(int, int), (int PlayerId, string PlayerName)> teamToPlayer,
        int championshipId,
        int teamId,
        int goalsFor,
        int goalsAgainst)
    {
        if (!teamToPlayer.TryGetValue((championshipId, teamId), out var player))
            return;

        if (!stats.TryGetValue(player.PlayerId, out var agg))
        {
            agg = new PlayerAggregate { PlayerId = player.PlayerId, Name = player.PlayerName };
            stats[player.PlayerId] = agg;
        }

        agg.Goals += goalsFor;
        if (goalsFor > goalsAgainst)
            agg.Wins++;
        else if (goalsFor < goalsAgainst)
            agg.Losses++;
    }

    private async Task<List<int>> GetUserUniverseIdsAsync(int userId)
    {
        return await _context.UserUniverses
            .Where(uu => uu.UserId == userId)
            .Select(uu => uu.UniverseId)
            .ToListAsync();
    }

    private sealed class PlayerAggregate
    {
        public int PlayerId { get; init; }
        public string Name { get; init; } = string.Empty;
        public int Wins { get; set; }
        public int Losses { get; set; }
        public int Goals { get; set; }
    }
}
