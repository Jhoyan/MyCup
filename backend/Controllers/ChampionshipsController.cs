using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyCup.DTOs.Championships;
using MyCup.DTOs.Common;
using MyCup.DTOs.Teams;
using MyCup.Services;

namespace MyCup.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ChampionshipsController : ControllerBase
    {
        private readonly ChampionshipsService _championshipsService;

        public ChampionshipsController(ChampionshipsService championshipsService)
        {
            _championshipsService = championshipsService;
        }

        // ----- Championship CRUD -----

        [HttpGet]
        public async Task<ActionResult<List<ChampionshipSummaryDto>>> GetByUniverse([FromQuery] int universeId)
        {
            var data = await _championshipsService.GetByUniverseAsync(universeId);
            return Ok(data);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ChampionshipDetailDto>> GetById(int id)
        {
            var data = await _championshipsService.GetByIdAsync(id);
            return Ok(data);
        }

        [HttpPost]
        public async Task<ActionResult> Create([FromBody] CreateChampionshipDto dto)
        {
            var id = await _championshipsService.CreateChampionshipAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id }, new { id, message = "Campeonato criado com sucesso" });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateChampionshipDto dto)
        {
            await _championshipsService.UpdateAsync(id, dto);
            return Ok(new { message = "Campeonato atualizado com sucesso" });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _championshipsService.DeleteAsync(id);
            return Ok(new { message = "Campeonato excluído com sucesso" });
        }

        // ----- Team pool -----

        [HttpGet("{id}/teams")]
        public async Task<ActionResult<List<TeamSummaryDto>>> GetTeams(int id)
        {
            var data = await _championshipsService.GetTeamsAsync(id);
            return Ok(data);
        }

        [HttpPost("{id}/teams")]
        public async Task<IActionResult> AddTeam(int id, [FromBody] AddChampionshipTeamDto dto)
        {
            await _championshipsService.AddTeamAsync(id, dto);
            return Ok(new { message = "Time adicionado ao campeonato" });
        }

        [HttpDelete("{id}/teams/{teamId}")]
        public async Task<IActionResult> RemoveTeam(int id, int teamId)
        {
            await _championshipsService.RemoveTeamAsync(id, teamId);
            return Ok(new { message = "Time removido do campeonato" });
        }

        // ----- Rules -----

        [HttpGet("{id}/rules")]
        public async Task<ActionResult<List<ChampionshipRuleDto>>> GetRules(int id)
        {
            var data = await _championshipsService.GetRulesAsync(id);
            return Ok(data);
        }

        [HttpPut("{id}/rules")]
        public async Task<IActionResult> SetRule(int id, [FromBody] ChampionshipRuleDto dto)
        {
            await _championshipsService.SetRuleAsync(id, dto);
            return Ok(new { message = "Regra salva com sucesso" });
        }

        [HttpDelete("{id}/rules/{key}")]
        public async Task<IActionResult> RemoveRule(int id, string key)
        {
            await _championshipsService.RemoveRuleAsync(id, key);
            return Ok(new { message = "Regra removida com sucesso" });
        }

        // ----- Players / draw -----

        [HttpGet("{id}/players")]
        public async Task<ActionResult<List<ChampionshipPlayerDto>>> GetPlayers(int id)
        {
            var data = await _championshipsService.GetPlayersAsync(id);
            return Ok(data);
        }

        [HttpPost("{id}/players")]
        public async Task<IActionResult> EnrollPlayer(int id, [FromBody] EnrollPlayerDto dto)
        {
            await _championshipsService.EnrollPlayerAsync(id, dto);
            return Ok(new { message = "Jogador inscrito no campeonato" });
        }

        [HttpPut("{id}/players/{playerId}")]
        public async Task<IActionResult> AssignTeam(int id, int playerId, [FromBody] AssignPlayerTeamDto dto)
        {
            await _championshipsService.AssignTeamAsync(id, playerId, dto);
            return Ok(new { message = "Time atribuído ao jogador" });
        }

        [HttpPost("{id}/players/draw")]
        public async Task<ActionResult<List<ChampionshipPlayerDto>>> Draw(int id)
        {
            var data = await _championshipsService.DrawTeamsAsync(id);
            return Ok(data);
        }

        [HttpDelete("{id}/players/{playerId}")]
        public async Task<IActionResult> RemovePlayer(int id, int playerId)
        {
            await _championshipsService.RemovePlayerAsync(id, playerId);
            return Ok(new { message = "Jogador removido do campeonato" });
        }
    }
}
