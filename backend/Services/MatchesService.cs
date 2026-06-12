using Microsoft.EntityFrameworkCore;
using MyCup.Data;
using MyCup.DTOs.Championships;
using MyCup.DTOs.Matches;
using MyCup.Errors;

namespace MyCup.Services;

/// <summary>
/// Service responsible for match business rules. Matches are created by the fixture engine (BE-008);
/// here they are read and have their result/status updated.
/// </summary>
public class MatchesService
{
    private static readonly HashSet<string> AllowedStatuses = new(StringComparer.OrdinalIgnoreCase)
    {
        "scheduled",
        "ongoing",
        "finished"
    };

    private readonly AppDbContext _context;
    private readonly FixturesService _fixturesService;

    public MatchesService(AppDbContext context, FixturesService fixturesService)
    {
        _context = context;
        _fixturesService = fixturesService;
    }

    public async Task<MatchSummaryDto> GetByIdAsync(int id)
    {
        var match = await _context.Matches
            .Where(m => m.Id == id)
            .Select(m => new MatchSummaryDto
            {
                Id = m.Id,
                HomeTeam = m.HomeTeam != null ? m.HomeTeam.Name : null,
                AwayTeam = m.AwayTeam != null ? m.AwayTeam.Name : null,
                HomeGoals = m.Status == "scheduled" ? (int?)null : m.HomeGoals,
                AwayGoals = m.Status == "scheduled" ? (int?)null : m.AwayGoals,
                HomePenalties = m.HomePenalties,
                AwayPenalties = m.AwayPenalties,
                Status = m.Status,
                Date = m.Date
            })
            .FirstOrDefaultAsync();

        if (match == null)
            throw new NotFoundException("Partida não encontrada");

        return match;
    }

    /// <summary>
    /// Updates the score and status of a match. Standings and championship progress are derived from
    /// finished matches at query time, so no extra recalculation is needed here.
    /// </summary>
    public async Task UpdateResultAsync(int id, UpdateMatchResultDto dto)
    {
        if (!AllowedStatuses.Contains(dto.Status))
            throw new BadRequestException("Status inválido. Use: scheduled, ongoing ou finished");

        var match = await _context.Matches.FindAsync(id);

        if (match == null)
            throw new NotFoundException("Partida não encontrada");

        var status = dto.Status.ToLowerInvariant();

        // A knockout slot can be empty until its feeder match resolves; it can't be played meanwhile.
        if (status != "scheduled" && (match.HomeTeamId == null || match.AwayTeamId == null))
            throw new BadRequestException("Os times desta partida ainda não foram definidos");

        // A scheduled match has no score yet.
        match.HomeGoals = status == "scheduled" ? 0 : dto.HomeGoals;
        match.AwayGoals = status == "scheduled" ? 0 : dto.AwayGoals;

        // Penalties only make sense for a finished, drawn knockout tie; clear them otherwise.
        var drawn = status == "finished" && dto.HomeGoals == dto.AwayGoals;
        match.HomePenalties = drawn ? dto.HomePenalties : null;
        match.AwayPenalties = drawn ? dto.AwayPenalties : null;

        match.Status = status;

        await _context.SaveChangesAsync();

        // Keep a generated bracket consistent: fill/clear the slots of any match fed by this result
        // (knockout winner/loser, or group qualifiers once the group is decided).
        await _fixturesService.PropagateResultAsync(id);
    }
}
