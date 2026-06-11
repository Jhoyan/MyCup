using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyCup.DTOs.Championships;
using MyCup.DTOs.Matches;
using MyCup.Services;

namespace MyCup.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class MatchesController : ControllerBase
    {
        private readonly MatchesService _matchesService;

        public MatchesController(MatchesService matchesService)
        {
            _matchesService = matchesService;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<MatchSummaryDto>> GetById(int id)
        {
            var data = await _matchesService.GetByIdAsync(id);
            return Ok(data);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateResult(int id, [FromBody] UpdateMatchResultDto dto)
        {
            await _matchesService.UpdateResultAsync(id, dto);
            return Ok(new { message = "Resultado da partida atualizado com sucesso" });
        }
    }
}
