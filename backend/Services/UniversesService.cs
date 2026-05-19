using MyCup.Data;
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

    public async Task CreateUniverseAsync(CreateUniverseDto dto)
    {
        Universe universe = new()
        {
            Name = dto.Name,
            Description = dto.Description
        };

        _context.Universes.Add(universe);

        await _context.SaveChangesAsync();
    }
}
