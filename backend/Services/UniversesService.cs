using Microsoft.EntityFrameworkCore;
using MyCup.Data;
using MyCup.DTOs.Championships;
using MyCup.DTOs.Universe;
using MyCup.Errors;
using MyCup.Models;
using MyCup.Services.Authorization;

namespace MyCup.Services;

/// <summary>
/// Service responsible for universe business rules.
/// </summary>
public class UniversesService
{
    private readonly AppDbContext _context;
    private readonly UniverseAuthorizer _authorizer;

    public UniversesService(AppDbContext context, UniverseAuthorizer authorizer)
    {
        _context = context;
        _authorizer = authorizer;
    }

    /// <summary>
    /// Creates a universe. Any authenticated user may create one and becomes its owner.
    /// </summary>
    public async Task<int> CreateUniverseAsync(CreateUniverseDto dto)
    {
        var userId = _authorizer.CurrentUserId();

        Universe universe = new()
        {
            Name = dto.Name,
            Description = dto.Description
        };

        _context.Universes.Add(universe);
        await _context.SaveChangesAsync();

        _context.UserUniverses.Add(new UserUniverse
        {
            UniverseId = universe.Id,
            UserId = userId,
            Role = "owner"
        });
        await _context.SaveChangesAsync();

        return universe.Id;
    }

    public async Task<List<UniverseListItemDto>> GetAllAsync()
    {
        return await _context.Universes
            .Select(u => new UniverseListItemDto
            {
                Id = u.Id,
                Name = u.Name,
                Players = u.Players.Count,
                Championships = u.Championships.Count,
                ActiveChampionships = 0
            })
            .ToListAsync();
    }

    public async Task<UniverseDetailDto> GetByIdAsync(int id)
    {
        var universe = await _context.Universes
            .Include(u => u.Players)
                .ThenInclude(p => p.PlayerChampionships)
            .Include(u => u.Championships)
                .ThenInclude(c => c.Format)
            .Include(u => u.Championships)
                .ThenInclude(c => c.ChampionshipTeams)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (universe == null)
            throw new NotFoundException("Universo não encontrado");

        var dto = new UniverseDetailDto
        {
            Id = universe.Id,
            Name = universe.Name,
            Description = universe.Description,
            Players = universe.Players.Select(p => new UniversePlayerStatsDto
            {
                Id = p.Id,
                Name = p.Name,
                Championships = p.PlayerChampionships.Count
            }).ToList(),
            Championships = universe.Championships.Select(c => new ChampionshipSummaryDto
            {
                Id = c.Id,
                Name = c.Name,
                Format = c.Format.Type,
                Status = string.Empty,
                Teams = c.ChampionshipTeams.Count,
                CurrentRound = 0,
                TotalRounds = 0
            }).ToList()
        };

        return dto;
    }

    public async Task UpdateAsync(int id, UpdateUniverseDto dto)
    {
        var universe = await _context.Universes.FindAsync(id);

        if (universe == null)
            throw new NotFoundException("Universo não encontrado");

        await _authorizer.RequireRoleAsync(id, UniverseRole.Admin);

        universe.Name = dto.Name;
        universe.Description = dto.Description;

        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var universe = await _context.Universes.FindAsync(id);

        if (universe == null)
            throw new NotFoundException("Universo não encontrado");

        await _authorizer.RequireRoleAsync(id, UniverseRole.Owner);

        _context.Universes.Remove(universe);
        await _context.SaveChangesAsync();
    }
}
