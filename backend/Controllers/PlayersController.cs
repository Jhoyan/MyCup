using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyCup.DTOs.Players;
using MyCup.Services;

namespace MyCup.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PlayersController : ControllerBase
    {
        private readonly PlayersService _playersService;

        public PlayersController(PlayersService playersService)
        {
            _playersService = playersService;
        }

        [HttpGet]
        public async Task<ActionResult<List<PlayerListItemDto>>> GetByUniverse([FromQuery] int universeId)
        {
            var data = await _playersService.GetByUniverseAsync(universeId);
            return Ok(data);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PlayerListItemDto>> GetById(int id)
        {
            var data = await _playersService.GetByIdAsync(id);
            return Ok(data);
        }

        [HttpPost]
        public async Task<ActionResult> Create([FromBody] CreatePlayerDto dto)
        {
            var id = await _playersService.CreatePlayerAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id }, new { id, message = "Jogador criado com sucesso" });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdatePlayerDto dto)
        {
            await _playersService.UpdateAsync(id, dto);
            return Ok(new { message = "Jogador atualizado com sucesso" });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _playersService.DeleteAsync(id);
            return Ok(new { message = "Jogador excluído com sucesso" });
        }
    }
}
