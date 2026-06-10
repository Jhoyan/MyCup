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
            var data = await _universesService.GetAllAsync();
            return Ok(data);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<UniverseDetailDto>> GetById(int id)
        {
            var data = await _universesService.GetByIdAsync(id);
            return Ok(data);
        }

        [HttpPost]
        public async Task<ActionResult> Create([FromBody] CreateUniverseDto dto)
        {
            var id = await _universesService.CreateUniverseAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id }, new { id, message = "Universo criado com sucesso" });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateUniverseDto dto)
        {
            await _universesService.UpdateAsync(id, dto);
            return Ok(new { message = "Universo atualizado com sucesso" });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _universesService.DeleteAsync(id);
            return Ok(new { message = "Universo excluído com sucesso" });
        }
    }
}
