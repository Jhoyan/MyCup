using Microsoft.EntityFrameworkCore;
using MyCup.Data;
using MyCup.DTOs.Players;
using MyCup.Errors;
using MyCup.Models;
using MyCup.Services.Authorization;

namespace MyCup.Services;

/// <summary>
/// Service responsible for player business rules. Writes require admin in the player's universe.
/// </summary>
public class PlayersService
{
    private readonly AppDbContext _context;
    private readonly UniverseAuthorizer _authorizer;

    public PlayersService(AppDbContext context, UniverseAuthorizer authorizer)
    {
        _context = context;
        _authorizer = authorizer;
    }

    public async Task<int> CreatePlayerAsync(CreatePlayerDto dto)
    {
        var universeExists = await _context.Universes.AnyAsync(u => u.Id == dto.UniverseId);
        if (!universeExists)
            throw new NotFoundException("Universo não encontrado");

        await _authorizer.RequireRoleAsync(dto.UniverseId, UniverseRole.Admin);

        Player player = new()
        {
            Name = dto.Name,
            UniverseId = dto.UniverseId
        };

        _context.Players.Add(player);
        await _context.SaveChangesAsync();

        return player.Id;
    }

    public async Task<List<PlayerListItemDto>> GetByUniverseAsync(int universeId)
    {
        return await _context.Players
            .Where(p => p.UniverseId == universeId && p.IsActive)
            .Select(p => new PlayerListItemDto
            {
                Id = p.Id,
                Name = p.Name
            })
            .ToListAsync();
    }

    public async Task<PlayerListItemDto> GetByIdAsync(int id)
    {
        var player = await _context.Players
            .Where(p => p.Id == id && p.IsActive)
            .Select(p => new PlayerListItemDto
            {
                Id = p.Id,
                Name = p.Name
            })
            .FirstOrDefaultAsync();

        if (player == null)
            throw new NotFoundException("Jogador não encontrado");

        return player;
    }

    public async Task UpdateAsync(int id, UpdatePlayerDto dto)
    {
        var player = await _context.Players.FirstOrDefaultAsync(p => p.Id == id && p.IsActive);

        if (player == null)
            throw new NotFoundException("Jogador não encontrado");

        await _authorizer.RequireRoleAsync(player.UniverseId, UniverseRole.Admin);

        player.Name = dto.Name;
        await _context.SaveChangesAsync();
    }

    /// <summary>
    /// Soft-deletes a player by marking it inactive, preserving its championship history.
    /// </summary>
    public async Task DeleteAsync(int id)
    {
        var player = await _context.Players.FirstOrDefaultAsync(p => p.Id == id && p.IsActive);

        if (player == null)
            throw new NotFoundException("Jogador não encontrado");

        await _authorizer.RequireRoleAsync(player.UniverseId, UniverseRole.Admin);

        player.IsActive = false;
        await _context.SaveChangesAsync();
    }
}
