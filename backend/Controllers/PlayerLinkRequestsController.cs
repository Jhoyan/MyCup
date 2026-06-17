using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyCup.DTOs.Players;
using MyCup.Services;

namespace MyCup.Controllers
{
    [ApiController]
    [Route("api")]
    [Authorize]
    public class PlayerLinkRequestsController : ControllerBase
    {
        private readonly PlayerLinkRequestsService _service;

        public PlayerLinkRequestsController(PlayerLinkRequestsService service)
        {
            _service = service;
        }

        [HttpPost("players/{playerId}/link-requests")]
        public async Task<IActionResult> Create(int playerId, [FromBody] CreatePlayerLinkRequestDto dto)
        {
            var id = await _service.CreateAsync(playerId, dto);
            return Ok(new { id, message = "Solicitação enviada ao usuário" });
        }

        [HttpGet("players/link-requests")]
        public async Task<ActionResult<List<PlayerLinkRequestDto>>> GetMine()
        {
            var data = await _service.GetMyPendingAsync();
            return Ok(data);
        }

        [HttpPost("players/link-requests/{id}/accept")]
        public async Task<IActionResult> Accept(int id)
        {
            await _service.AcceptAsync(id);
            return Ok(new { message = "Jogador vinculado à sua conta" });
        }

        [HttpPost("players/link-requests/{id}/decline")]
        public async Task<IActionResult> Decline(int id)
        {
            await _service.DeclineAsync(id);
            return Ok(new { message = "Solicitação recusada" });
        }
    }
}
