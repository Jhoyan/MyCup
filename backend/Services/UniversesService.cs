using MyCup.Data;

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

    public async Task CreateUniverseAsync()
    {
        _context.Universes.Add(universe);

        await _context.SaveChangesAsync();
    }
}
