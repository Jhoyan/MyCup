using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyCup.DTOs.Universe;
using MyCup.Services;

namespace MyCup.Controllers
{
    [ApiController]
    [Route("api/universes/{universeId}/members")]
    [Authorize]
    public class UserUniversesController : ControllerBase
    {
        private readonly UserUniversesService _userUniversesService;

        public UserUniversesController(UserUniversesService userUniversesService)
        {
            _userUniversesService = userUniversesService;
        }

        [HttpGet]
        public async Task<ActionResult<List<UniverseMemberDto>>> GetMembers(int universeId)
        {
            var data = await _userUniversesService.GetMembersAsync(universeId);
            return Ok(data);
        }

        [HttpPost]
        public async Task<IActionResult> AddMember(int universeId, [FromBody] AddMemberDto dto)
        {
            await _userUniversesService.AddMemberAsync(universeId, dto);
            return Ok(new { message = "Membro adicionado ao universo" });
        }

        [HttpPut("{userId}")]
        public async Task<IActionResult> UpdateRole(int universeId, int userId, [FromBody] UpdateMemberRoleDto dto)
        {
            await _userUniversesService.UpdateRoleAsync(universeId, userId, dto);
            return Ok(new { message = "Papel do membro atualizado com sucesso" });
        }

        [HttpDelete("{userId}")]
        public async Task<IActionResult> RemoveMember(int universeId, int userId)
        {
            await _userUniversesService.RemoveMemberAsync(universeId, userId);
            return Ok(new { message = "Membro removido do universo" });
        }
    }
}
