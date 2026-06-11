using Microsoft.EntityFrameworkCore;
using MyCup.Data;
using MyCup.DTOs.Universe;
using MyCup.Errors;
using MyCup.Models;

namespace MyCup.Services;

/// <summary>
/// Service responsible for user-universe membership business rules (members and their roles).
/// </summary>
public class UserUniversesService
{
    private static readonly HashSet<string> AllowedRoles = new(StringComparer.OrdinalIgnoreCase)
    {
        "owner",
        "admin",
        "moderator"
    };

    private const string OwnerRole = "owner";

    private readonly AppDbContext _context;

    public UserUniversesService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<UniverseMemberDto>> GetMembersAsync(int universeId)
    {
        await EnsureUniverseExistsAsync(universeId);

        return await _context.UserUniverses
            .Where(uu => uu.UniverseId == universeId)
            .Select(uu => new UniverseMemberDto
            {
                UserId = uu.UserId,
                Name = uu.User.Name,
                Email = uu.User.Email,
                Role = uu.Role
            })
            .OrderBy(m => m.Name)
            .ToListAsync();
    }

    public async Task AddMemberAsync(int universeId, AddMemberDto dto)
    {
        await EnsureUniverseExistsAsync(universeId);

        var role = NormalizeRole(dto.Role);

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
        if (user == null)
            throw new NotFoundException("Usuário não encontrado");

        var alreadyMember = await _context.UserUniverses
            .AnyAsync(uu => uu.UniverseId == universeId && uu.UserId == user.Id);
        if (alreadyMember)
            throw new ConflictException("Este usuário já é membro do universo");

        _context.UserUniverses.Add(new UserUniverse
        {
            UniverseId = universeId,
            UserId = user.Id,
            Role = role
        });
        await _context.SaveChangesAsync();
    }

    public async Task UpdateRoleAsync(int universeId, int userId, UpdateMemberRoleDto dto)
    {
        var role = NormalizeRole(dto.Role);

        var membership = await _context.UserUniverses
            .FirstOrDefaultAsync(uu => uu.UniverseId == universeId && uu.UserId == userId);
        if (membership == null)
            throw new NotFoundException("Membro não encontrado neste universo");

        // A universe must always keep at least one owner.
        if (membership.Role.Equals(OwnerRole, StringComparison.OrdinalIgnoreCase)
            && !role.Equals(OwnerRole, StringComparison.OrdinalIgnoreCase)
            && await IsLastOwnerAsync(universeId, userId))
        {
            throw new ConflictException("O universo precisa ter pelo menos um owner");
        }

        membership.Role = role;
        await _context.SaveChangesAsync();
    }

    public async Task RemoveMemberAsync(int universeId, int userId)
    {
        var membership = await _context.UserUniverses
            .FirstOrDefaultAsync(uu => uu.UniverseId == universeId && uu.UserId == userId);
        if (membership == null)
            throw new NotFoundException("Membro não encontrado neste universo");

        if (membership.Role.Equals(OwnerRole, StringComparison.OrdinalIgnoreCase)
            && await IsLastOwnerAsync(universeId, userId))
        {
            throw new ConflictException("Não é possível remover o último owner do universo");
        }

        _context.UserUniverses.Remove(membership);
        await _context.SaveChangesAsync();
    }

    private async Task<bool> IsLastOwnerAsync(int universeId, int userId)
    {
        var otherOwners = await _context.UserUniverses
            .CountAsync(uu => uu.UniverseId == universeId
                && uu.Role == OwnerRole
                && uu.UserId != userId);
        return otherOwners == 0;
    }

    private async Task EnsureUniverseExistsAsync(int universeId)
    {
        var exists = await _context.Universes.AnyAsync(u => u.Id == universeId);
        if (!exists)
            throw new NotFoundException("Universo não encontrado");
    }

    private static string NormalizeRole(string role)
    {
        if (!AllowedRoles.Contains(role))
            throw new BadRequestException("Papel inválido. Use: owner, admin ou moderator");

        return role.ToLowerInvariant();
    }
}
