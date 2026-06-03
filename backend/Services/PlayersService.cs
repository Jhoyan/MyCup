using Microsoft.EntityFrameworkCore;
using MyCup.Data;
using MyCup.DTOs.Players;
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

    public async Task<(bool success, string message, int id)> CreatePlayerAsync(CreatePlayerDto dto)
    {
        var universeExists = await _context.Universes.AnyAsync(u => u.Id == dto.UniverseId);
        if (!universeExists)
            return (false, "Universo não encontrado", 0);

        Player player = new()
        {
            Name = dto.Name,
            UniverseId = dto.UniverseId
        };

        _context.Players.Add(player);
        await _context.SaveChangesAsync();

        return (true, "Jogador criado com sucesso", player.Id);
    }

    public async Task<(bool success, string message, List<PlayerListItemDto> data)> GetByUniverseAsync(int universeId)
    {
        var players = await _context.Players
            .Where(p => p.UniverseId == universeId)
            .Select(p => new PlayerListItemDto
            {
                Id = p.Id,
                Name = p.Name
            })
            .ToListAsync();

        return (true, string.Empty, players);
    }

    public async Task<(bool success, string message, PlayerListItemDto? data)> GetByIdAsync(int id)
    {
        var player = await _context.Players
            .Where(p => p.Id == id)
            .Select(p => new PlayerListItemDto
            {
                Id = p.Id,
                Name = p.Name
            })
            .FirstOrDefaultAsync();

        if (player == null)
            return (false, "Jogador não encontrado", null);

        return (true, string.Empty, player);
    }

    public async Task<(bool success, string message)> UpdateAsync(int id, UpdatePlayerDto dto)
    {
        var player = await _context.Players.FindAsync(id);

        if (player == null)
            return (false, "Jogador não encontrado");

        player.Name = dto.Name;
        await _context.SaveChangesAsync();

        return (true, "Jogador atualizado com sucesso");
    }

    public async Task<(bool success, string message)> DeleteAsync(int id)
    {
        var player = await _context.Players.FindAsync(id);

        if (player == null)
            return (false, "Jogador não encontrado");

        _context.Players.Remove(player);
        await _context.SaveChangesAsync();

        return (true, "Jogador excluído com sucesso");
    }
}
