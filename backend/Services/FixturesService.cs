using Microsoft.EntityFrameworkCore;
using MyCup.Data;
using MyCup.DTOs.Championships;
using MyCup.Errors;
using MyCup.Models;
using MyCup.Services.Fixtures;

namespace MyCup.Services;

/// <summary>
/// Coordinates fixture generation: validates pre-conditions, picks the right generator for the
/// championship's format, (re)builds the phase graph, and persists the configuration that was used.
/// </summary>
public class FixturesService
{
    private readonly AppDbContext _context;
    private readonly Dictionary<string, IFixtureGenerator> _generators;

    public FixturesService(AppDbContext context, IEnumerable<IFixtureGenerator> generators)
    {
        _context = context;
        _generators = generators.ToDictionary(g => g.Format, StringComparer.OrdinalIgnoreCase);
    }

    public async Task GenerateAsync(int championshipId, GenerateChampionshipDto dto)
    {
        var championship = await _context.Championships
            .Include(c => c.Format)
            .Include(c => c.ChampionshipTeams)
            .Include(c => c.Phases)
                .ThenInclude(p => p.Rounds)
                    .ThenInclude(r => r.Matches)
            .FirstOrDefaultAsync(c => c.Id == championshipId);

        if (championship == null)
            throw new NotFoundException("Campeonato não encontrado");

        if (!_generators.TryGetValue(championship.Format.Type, out var generator))
            throw new BadRequestException($"Geração não suportada para o formato '{championship.Format.Type}'");

        // Regeneration is only allowed while nothing has been played yet.
        var existingMatches = championship.Phases
            .SelectMany(p => p.Rounds)
            .SelectMany(r => r.Matches)
            .ToList();

        if (existingMatches.Any(m => m.Status != "scheduled"))
            throw new ConflictException("Não é possível gerar: já há partidas em andamento ou finalizadas");

        if (championship.Phases.Count > 0)
            _context.Phases.RemoveRange(championship.Phases);

        var teamIds = championship.ChampionshipTeams.Select(ct => ct.TeamId).ToList();
        var config = new FixtureConfig(
            dto.DoubleRound,
            dto.ThirdPlace,
            dto.Elimination,
            dto.BracketSeeding,
            dto.GroupsCount,
            dto.GroupSize,
            dto.QualifiersPerGroup);

        var phases = generator.Generate(teamIds, config);
        foreach (var phase in phases)
            championship.Phases.Add(phase);

        await PersistConfigAsync(championshipId, championship.Format.Type, dto);

        await _context.SaveChangesAsync();
    }

    /// <summary>
    /// Upserts the configuration actually used into ChampionshipRule, recording only the keys relevant
    /// to the championship's format.
    /// </summary>
    private async Task PersistConfigAsync(int championshipId, string format, GenerateChampionshipDto dto)
    {
        var values = new Dictionary<string, string>();

        if (format is "round_robin" or "groups_knockout")
            values["double_round"] = dto.DoubleRound.ToString().ToLowerInvariant();

        if (format is "knockout" or "groups_knockout")
        {
            values["third_place"] = dto.ThirdPlace.ToString().ToLowerInvariant();
            values["elimination"] = dto.Elimination;
        }

        if (format == "groups_knockout")
        {
            values["bracket_seeding"] = dto.BracketSeeding;
            values["qualifiers_per_group"] = dto.QualifiersPerGroup.ToString();
            if (dto.GroupsCount.HasValue)
                values["groups_count"] = dto.GroupsCount.Value.ToString();
            if (dto.GroupSize.HasValue)
                values["group_size"] = dto.GroupSize.Value.ToString();
        }

        if (values.Count == 0)
            return;

        var existing = await _context.ChampionshipRules
            .Where(r => r.ChampionshipId == championshipId && values.Keys.Contains(r.Key))
            .ToListAsync();

        foreach (var (key, value) in values)
        {
            var rule = existing.FirstOrDefault(r => r.Key == key);
            if (rule == null)
                _context.ChampionshipRules.Add(new ChampionshipRule { ChampionshipId = championshipId, Key = key, Value = value });
            else
                rule.Value = value;
        }
    }
}
