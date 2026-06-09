using Microsoft.EntityFrameworkCore;
using MyCup.Data;
using MyCup.DTOs.Championships;
using MyCup.DTOs.Universe;
using MyCup.Models;

namespace MyCup.Services;

/// <summary>
/// Service responsible for universe business rules.
/// </summary>
public class UniversesService
{
    private readonly AppDbContext _context;

    public UniversesService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<(bool success, string message, int id)> CreateUniverseAsync(CreateUniverseDto dto)
    {
        Universe universe = new()
        {
            Name = dto.Name,
            Description = dto.Description
        };

        _context.Universes.Add(universe);
        await _context.SaveChangesAsync();

        return (true, "Universo criado com sucesso", universe.Id);
    }

    public async Task<(bool success, string message, List<UniverseListItemDto> data)> GetAllAsync()
    {
        var universes = await _context.Universes
            .Select(u => new UniverseListItemDto
            {
                Id = u.Id,
                Name = u.Name,
                Players = u.Players.Count,
                Championships = u.Championships.Count,
                ActiveChampionships = 0
            })
            .ToListAsync();

        return (true, string.Empty, universes);
    }

    public async Task<(bool success, string message, UniverseDetailDto? data)> GetByIdAsync(int id)
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
            return (false, "Universo não encontrado", null);

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

        return (true, string.Empty, dto);
    }

    public async Task<(bool success, string message)> UpdateAsync(int id, UpdateUniverseDto dto)
    {
        var universe = await _context.Universes.FindAsync(id);

        if (universe == null)
            return (false, "Universo não encontrado");

        universe.Name = dto.Name;
        universe.Description = dto.Description;

        await _context.SaveChangesAsync();
        return (true, "Universo atualizado com sucesso");
    }

    public async Task<(bool success, string message)> DeleteAsync(int id)
    {
        var universe = await _context.Universes.FindAsync(id);

        if (universe == null)
            return (false, "Universo não encontrado");

        _context.Universes.Remove(universe);
        await _context.SaveChangesAsync();
        return (true, "Universo excluído com sucesso");
    }
}
