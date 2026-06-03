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
            try
            {
                var (_, _, data) = await _playersService.GetByUniverseAsync(universeId);
                return Ok(data);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { erro = "Erro ao listar jogadores", detalhes = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PlayerListItemDto>> GetById(int id)
        {
            try
            {
                var (success, message, data) = await _playersService.GetByIdAsync(id);

                if (!success)
                    return NotFound(new { message });

                return Ok(data);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { erro = "Erro ao buscar jogador", detalhes = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult> Create([FromBody] CreatePlayerDto dto)
        {
            try
            {
                var (success, message, id) = await _playersService.CreatePlayerAsync(dto);

                if (!success)
                    return BadRequest(new { message });

                return CreatedAtAction(nameof(GetById), new { id }, new { id, message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { erro = "Erro ao criar jogador", detalhes = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdatePlayerDto dto)
        {
            try
            {
                var (success, message) = await _playersService.UpdateAsync(id, dto);

                if (!success)
                    return NotFound(new { message });

                return Ok(new { message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { erro = "Erro ao atualizar jogador", detalhes = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var (success, message) = await _playersService.DeleteAsync(id);

                if (!success)
                    return NotFound(new { message });

                return Ok(new { message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { erro = "Erro ao excluir jogador", detalhes = ex.Message });
            }
        }
    }
}
