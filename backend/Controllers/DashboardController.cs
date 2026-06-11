using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyCup.DTOs.Dashboard;
using MyCup.Errors;
using MyCup.Services;

namespace MyCup.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly DashboardService _dashboardService;

        public DashboardController(DashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        [HttpGet("summary")]
        public async Task<ActionResult<DashboardSummaryDto>> GetSummary()
        {
            var data = await _dashboardService.GetSummaryAsync(GetUserId());
            return Ok(data);
        }

        [HttpGet("top-players")]
        public async Task<ActionResult<DashboardTopPlayersDto>> GetTopPlayers()
        {
            var data = await _dashboardService.GetTopPlayersAsync(GetUserId());
            return Ok(data);
        }

        [HttpGet("recent-results")]
        public async Task<ActionResult<List<RecentResultDto>>> GetRecentResults()
        {
            var data = await _dashboardService.GetRecentResultsAsync(GetUserId());
            return Ok(data);
        }

        private int GetUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;

            if (string.IsNullOrWhiteSpace(claim) || !int.TryParse(claim, out var userId))
                throw new UnauthorizedException("Token inválido");

            return userId;
        }
    }
}
