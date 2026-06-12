using Microsoft.EntityFrameworkCore;
using MyCup.Data;
using MyCup.DTOs.Universe;
using MyCup.Errors;
using MyCup.Models;
using MyCup.Services.Authorization;

namespace MyCup.Services;

/// <summary>
/// Service responsible for user-universe membership business rules (members and their roles). Managing
/// members requires admin; only an owner may grant, change or remove the owner role.
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
    private readonly UniverseAuthorizer _authorizer;

    public UserUniversesService(AppDbContext context, UniverseAuthorizer authorizer)
    {
        _context = context;
        _authorizer = authorizer;
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

        var callerRole = await _authorizer.RequireRoleAsync(universeId, UniverseRole.Admin);

        var role = NormalizeRole(dto.Role);

        // Only an owner can grant the owner role.
        if (role == OwnerRole && callerRole < UniverseRole.Owner)
            throw new ForbiddenException("Apenas o owner pode conceder o cargo de owner");

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
        var callerRole = await _authorizer.RequireRoleAsync(universeId, UniverseRole.Admin);

        var role = NormalizeRole(dto.Role);

        var membership = await _context.UserUniverses
            .FirstOrDefaultAsync(uu => uu.UniverseId == universeId && uu.UserId == userId);
        if (membership == null)
            throw new NotFoundException("Membro não encontrado neste universo");

        // Only an owner can change a member to/from the owner role.
        var touchesOwner = role == OwnerRole || membership.Role.Equals(OwnerRole, StringComparison.OrdinalIgnoreCase);
        if (touchesOwner && callerRole < UniverseRole.Owner)
            throw new ForbiddenException("Apenas o owner pode gerenciar o cargo de owner");

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
        var callerRole = await _authorizer.RequireRoleAsync(universeId, UniverseRole.Admin);

        var membership = await _context.UserUniverses
            .FirstOrDefaultAsync(uu => uu.UniverseId == universeId && uu.UserId == userId);
        if (membership == null)
            throw new NotFoundException("Membro não encontrado neste universo");

        // Only an owner can remove another owner.
        if (membership.Role.Equals(OwnerRole, StringComparison.OrdinalIgnoreCase) && callerRole < UniverseRole.Owner)
            throw new ForbiddenException("Apenas o owner pode remover um owner");

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
