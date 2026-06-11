using Microsoft.EntityFrameworkCore;
using MyCup.Data;
using MyCup.DTOs.Common;
using MyCup.DTOs.Teams;
using MyCup.Errors;
using MyCup.Models;

namespace MyCup.Services;

/// <summary>
/// Service responsible for team business rules. Teams are scoped to a universe.
/// </summary>
public class TeamsService
{
    private readonly AppDbContext _context;

    public TeamsService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<int> CreateTeamAsync(CreateTeamDto dto)
    {
        var universeExists = await _context.Universes.AnyAsync(u => u.Id == dto.UniverseId);
        if (!universeExists)
            throw new NotFoundException("Universo não encontrado");

        var nameTaken = await _context.Teams
            .AnyAsync(t => t.UniverseId == dto.UniverseId && t.Name == dto.Name);
        if (nameTaken)
            throw new ConflictException("Já existe um time com esse nome neste universo");

        Team team = new()
        {
            Name = dto.Name,
            UniverseId = dto.UniverseId
        };

        _context.Teams.Add(team);
        await _context.SaveChangesAsync();

        return team.Id;
    }

    public async Task<List<TeamSummaryDto>> GetByUniverseAsync(int universeId)
    {
        return await _context.Teams
            .Where(t => t.UniverseId == universeId)
            .OrderBy(t => t.Name)
            .Select(t => new TeamSummaryDto
            {
                Id = t.Id,
                Name = t.Name
            })
            .ToListAsync();
    }

    public async Task<TeamSummaryDto> GetByIdAsync(int id)
    {
        var team = await _context.Teams
            .Where(t => t.Id == id)
            .Select(t => new TeamSummaryDto
            {
                Id = t.Id,
                Name = t.Name
            })
            .FirstOrDefaultAsync();

        if (team == null)
            throw new NotFoundException("Time não encontrado");

        return team;
    }

    public async Task UpdateAsync(int id, UpdateTeamDto dto)
    {
        var team = await _context.Teams.FindAsync(id);

        if (team == null)
            throw new NotFoundException("Time não encontrado");

        var nameTaken = await _context.Teams
            .AnyAsync(t => t.UniverseId == team.UniverseId && t.Name == dto.Name && t.Id != id);
        if (nameTaken)
            throw new ConflictException("Já existe um time com esse nome neste universo");

        team.Name = dto.Name;
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var team = await _context.Teams.FindAsync(id);

        if (team == null)
            throw new NotFoundException("Time não encontrado");

        var inUse =
            await _context.ChampionshipTeams.AnyAsync(ct => ct.TeamId == id) ||
            await _context.GroupTeams.AnyAsync(gt => gt.TeamId == id) ||
            await _context.Matches.AnyAsync(m => m.HomeTeamId == id || m.AwayTeamId == id) ||
            await _context.PlayerChampionships.AnyAsync(pc => pc.TeamId == id);

        if (inUse)
            throw new ConflictException("Não é possível excluir um time que está em uso em campeonatos, grupos ou partidas");

        _context.Teams.Remove(team);
        await _context.SaveChangesAsync();
    }
}
