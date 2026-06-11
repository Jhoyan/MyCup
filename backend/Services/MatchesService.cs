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

    public MatchesService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<MatchSummaryDto> GetByIdAsync(int id)
    {
        var match = await _context.Matches
            .Where(m => m.Id == id)
            .Select(m => new MatchSummaryDto
            {
                Id = m.Id,
                HomeTeam = m.HomeTeam.Name,
                AwayTeam = m.AwayTeam.Name,
                HomeGoals = m.Status == "scheduled" ? (int?)null : m.HomeGoals,
                AwayGoals = m.Status == "scheduled" ? (int?)null : m.AwayGoals,
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

        // A scheduled match has no score yet.
        match.HomeGoals = status == "scheduled" ? 0 : dto.HomeGoals;
        match.AwayGoals = status == "scheduled" ? 0 : dto.AwayGoals;
        match.Status = status;

        await _context.SaveChangesAsync();
    }
}
