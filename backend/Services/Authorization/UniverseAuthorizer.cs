using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using MyCup.Data;
using MyCup.Errors;

namespace MyCup.Services.Authorization;

/// <summary>
/// Ranked roles a user can hold in a universe. The (UserId, UniverseId) key on UserUniverse guarantees a
/// single role per user per universe; higher values outrank lower ones.
/// </summary>
public enum UniverseRole
{
    Moderator = 1,
    Admin = 2,
    Owner = 3
}

/// <summary>
/// Resolves the authenticated user (from the JWT) and enforces their role within a universe. Write
/// operations call <see cref="RequireRoleAsync"/> with the minimum role they need; reads are public.
/// </summary>
public class UniverseAuthorizer
{
    private readonly AppDbContext _context;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public UniverseAuthorizer(AppDbContext context, IHttpContextAccessor httpContextAccessor)
    {
        _context = context;
        _httpContextAccessor = httpContextAccessor;
    }

    /// <summary>The authenticated user's id (JWT sub / NameIdentifier). Throws when there is no valid token.</summary>
    public int CurrentUserId()
    {
        var principal = _httpContextAccessor.HttpContext?.User;
        var claim = principal?.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? principal?.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;

        if (string.IsNullOrWhiteSpace(claim) || !int.TryParse(claim, out var userId))
            throw new UnauthorizedException("Token inválido");

        return userId;
    }

    /// <summary>The current user's role in the universe, or null when they are not a member.</summary>
    public async Task<UniverseRole?> GetRoleAsync(int universeId, int userId)
    {
        var role = await _context.UserUniverses
            .Where(uu => uu.UniverseId == universeId && uu.UserId == userId)
            .Select(uu => uu.Role)
            .FirstOrDefaultAsync();

        return ParseRole(role);
    }

    /// <summary>
    /// Ensures the current user has at least <paramref name="minimum"/> in the universe and returns their
    /// actual role. Throws 403 when they are not a member or their role is too low.
    /// </summary>
    public async Task<UniverseRole> RequireRoleAsync(int universeId, UniverseRole minimum)
    {
        var role = await GetRoleAsync(universeId, CurrentUserId());

        if (role is not UniverseRole actual)
            throw new ForbiddenException("Você não é membro deste universo");
        if (actual < minimum)
            throw new ForbiddenException("Você não tem permissão para esta ação neste universo");

        return actual;
    }

    public static UniverseRole? ParseRole(string? role) => role?.ToLowerInvariant() switch
    {
        "owner" => UniverseRole.Owner,
        "admin" => UniverseRole.Admin,
        "moderator" => UniverseRole.Moderator,
        _ => null
    };
}
