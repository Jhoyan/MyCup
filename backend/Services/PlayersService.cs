using Microsoft.EntityFrameworkCore;
using MyCup.Data;
using MyCup.DTOs.Players;
using MyCup.Errors;
using MyCup.Models;

namespace MyCup.Services;

/// <summary>
/// Service responsible for player business rules.
/// </summary>
public class PlayersService
{
    private readonly AppDbContext _context;

    public PlayersService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<int> CreatePlayerAsync(CreatePlayerDto dto)
    {
        var universeExists = await _context.Universes.AnyAsync(u => u.Id == dto.UniverseId);
        if (!universeExists)
            throw new NotFoundException("Universo não encontrado");

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

        player.IsActive = false;
        await _context.SaveChangesAsync();
    }
}
