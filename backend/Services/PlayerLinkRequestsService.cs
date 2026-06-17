using Microsoft.EntityFrameworkCore;
using MyCup.Data;
using MyCup.DTOs.Players;
using MyCup.Errors;
using MyCup.Models;
using MyCup.Services.Authorization;

namespace MyCup.Services;

/// <summary>
/// Handles player-link requests: an admin asks a user (by email) to take ownership of a player; the target
/// user accepts (which sets <see cref="Player.UserId"/>) or declines. A user controls at most one player per
/// universe, so all of a person's player profiles across universes are tied together by the same UserId.
/// </summary>
public class PlayerLinkRequestsService
{
    private readonly AppDbContext _context;
    private readonly UniverseAuthorizer _authorizer;

    public PlayerLinkRequestsService(AppDbContext context, UniverseAuthorizer authorizer)
    {
        _context = context;
        _authorizer = authorizer;
    }

    /// <summary>
    /// Creates a pending request asking the user identified by <paramref name="dto"/>.Email to take ownership
    /// of the given player. Requires admin in the player's universe.
    /// </summary>
    public async Task<int> CreateAsync(int playerId, CreatePlayerLinkRequestDto dto)
    {
        var player = await _context.Players.FirstOrDefaultAsync(p => p.Id == playerId && p.IsActive);
        if (player == null)
            throw new NotFoundException("Jogador não encontrado");

        await _authorizer.RequireRoleAsync(player.UniverseId, UniverseRole.Admin);

        if (player.UserId != null)
            throw new ConflictException("Este jogador já está vinculado a um usuário");

        var targetUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
        if (targetUser == null)
            throw new NotFoundException("Usuário não encontrado");

        await EnsureUserHasNoPlayerInUniverseAsync(targetUser.Id, player.UniverseId);

        var hasPending = await _context.PlayerLinkRequests
            .AnyAsync(r => r.PlayerId == playerId && r.Status == PlayerLinkRequestStatus.Pending);
        if (hasPending)
            throw new ConflictException("Já existe uma solicitação pendente para este jogador");

        var request = new PlayerLinkRequest
        {
            PlayerId = playerId,
            TargetUserId = targetUser.Id,
            RequestedByUserId = _authorizer.CurrentUserId()
        };

        _context.PlayerLinkRequests.Add(request);
        await _context.SaveChangesAsync();

        return request.Id;
    }

    /// <summary>Pending requests addressed to the current user (their notification feed).</summary>
    public async Task<List<PlayerLinkRequestDto>> GetMyPendingAsync()
    {
        var userId = _authorizer.CurrentUserId();

        return await _context.PlayerLinkRequests
            .Where(r => r.TargetUserId == userId && r.Status == PlayerLinkRequestStatus.Pending)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new PlayerLinkRequestDto
            {
                Id = r.Id,
                PlayerId = r.PlayerId,
                PlayerName = r.Player.Name,
                UniverseId = r.Player.UniverseId,
                UniverseName = r.Player.Universe.Name,
                RequestedByName = r.RequestedByUser.Name,
                CreatedAt = r.CreatedAt
            })
            .ToListAsync();
    }

    /// <summary>
    /// Accepts a pending request: links the player to the current user. Only the target user may accept.
    /// </summary>
    public async Task AcceptAsync(int requestId)
    {
        var request = await LoadOwnPendingRequestAsync(requestId);

        var player = await _context.Players.FirstOrDefaultAsync(p => p.Id == request.PlayerId && p.IsActive);
        if (player == null)
            throw new NotFoundException("Jogador não encontrado");
        if (player.UserId != null)
            throw new ConflictException("Este jogador já está vinculado a um usuário");

        await EnsureUserHasNoPlayerInUniverseAsync(request.TargetUserId, player.UniverseId);

        player.UserId = request.TargetUserId;
        request.Status = PlayerLinkRequestStatus.Accepted;
        request.RespondedAt = DateTime.UtcNow;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            // Backstop for the partial unique index on (UniverseId, UserId): a concurrent accept linked the
            // user to another player in this universe first.
            throw new ConflictException("Este usuário já controla um jogador neste universo");
        }
    }

    /// <summary>Declines a pending request, removing it from the user's feed. Only the target user may decline.</summary>
    public async Task DeclineAsync(int requestId)
    {
        var request = await LoadOwnPendingRequestAsync(requestId);

        request.Status = PlayerLinkRequestStatus.Declined;
        request.RespondedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
    }

    /// <summary>Loads a pending request that belongs to the current user, or throws 404/403.</summary>
    private async Task<PlayerLinkRequest> LoadOwnPendingRequestAsync(int requestId)
    {
        var request = await _context.PlayerLinkRequests.FirstOrDefaultAsync(r => r.Id == requestId);
        if (request == null || request.Status != PlayerLinkRequestStatus.Pending)
            throw new NotFoundException("Solicitação não encontrada");

        if (request.TargetUserId != _authorizer.CurrentUserId())
            throw new ForbiddenException("Esta solicitação não é destinada a você");

        return request;
    }

    private async Task EnsureUserHasNoPlayerInUniverseAsync(int userId, int universeId)
    {
        var alreadyControls = await _context.Players
            .AnyAsync(p => p.UniverseId == universeId && p.UserId == userId && p.IsActive);
        if (alreadyControls)
            throw new ConflictException("Este usuário já controla um jogador neste universo");
    }
}
