using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyCup.DTOs.Universe;
using MyCup.Services;

namespace MyCup.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UniversesController : ControllerBase
    {
        private readonly UniversesService _universesService;

        public UniversesController(UniversesService universesService)
        {
            _universesService = universesService;
        }

        [HttpGet]
        public async Task<ActionResult<List<UniverseListItemDto>>> GetAll()
        {
            try
            {
                var (_, _, data) = await _universesService.GetAllAsync();
                return Ok(data);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { erro = "Erro ao listar universos", detalhes = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<UniverseDetailDto>> GetById(int id)
        {
            try
            {
                var (success, message, data) = await _universesService.GetByIdAsync(id);

                if (!success)
                    return NotFound(new { message });

                return Ok(data);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { erro = "Erro ao buscar universo", detalhes = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult> Create([FromBody] CreateUniverseDto dto)
        {
            try
            {
                var (success, message, id) = await _universesService.CreateUniverseAsync(dto);

                if (!success)
                    return BadRequest(new { message });

                return CreatedAtAction(nameof(GetById), new { id }, new { id, message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { erro = "Erro ao criar universo", detalhes = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateUniverseDto dto)
        {
            try
            {
                var (success, message) = await _universesService.UpdateAsync(id, dto);

                if (!success)
                    return NotFound(new { message });

                return Ok(new { message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { erro = "Erro ao atualizar universo", detalhes = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var (success, message) = await _universesService.DeleteAsync(id);

                if (!success)
                    return NotFound(new { message });

                return Ok(new { message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { erro = "Erro ao excluir universo", detalhes = ex.Message });
            }
        }
    }
}
