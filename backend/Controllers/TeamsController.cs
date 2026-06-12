using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyCup.DTOs.Common;
using MyCup.DTOs.Teams;
using MyCup.Services;

namespace MyCup.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TeamsController : ControllerBase
    {
        private readonly TeamsService _teamsService;

        public TeamsController(TeamsService teamsService)
        {
            _teamsService = teamsService;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<List<TeamSummaryDto>>> GetByUniverse([FromQuery] int universeId)
        {
            var data = await _teamsService.GetByUniverseAsync(universeId);
            return Ok(data);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<TeamSummaryDto>> GetById(int id)
        {
            var data = await _teamsService.GetByIdAsync(id);
            return Ok(data);
        }

        [HttpPost]
        public async Task<ActionResult> Create([FromBody] CreateTeamDto dto)
        {
            var id = await _teamsService.CreateTeamAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id }, new { id, message = "Time criado com sucesso" });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateTeamDto dto)
        {
            await _teamsService.UpdateAsync(id, dto);
            return Ok(new { message = "Time atualizado com sucesso" });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _teamsService.DeleteAsync(id);
            return Ok(new { message = "Time excluído com sucesso" });
        }
    }
}
