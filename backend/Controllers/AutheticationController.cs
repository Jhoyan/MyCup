using MyCup.DTOs.Authentication;
using MyCup.Errors;
using MyCup.Services.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace MyCup.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;

        public AuthController(AuthService authService)
        {
            _authService = authService;
        }

        /// <summary>
        /// Endpoint de login (Username + Password)
        /// </summary>
        /// <returns>Token JWT + dados do usuário</returns>
        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<ActionResult<AuthResponseDTO>> Login([FromBody] LoginRequestDTO dto)
        {
            var response = await _authService.LoginAsync(dto);
            return Ok(response);
        }

        /// <summary>
        /// Criar novo usuário
        /// </summary>
        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<ActionResult<AuthResponseDTO>> Register([FromBody] RegisterRequestDTO dto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? string.Empty;

            var response = await _authService.RegisterAsync(dto, userId);
            return CreatedAtAction(nameof(Login), response);
        }

        /// <summary>
        /// Renova o token de acesso a partir de um refresh token válido (rotação: o refresh token
        /// enviado é invalidado e um novo par é retornado).
        /// </summary>
        [HttpPost("refresh")]
        [AllowAnonymous]
        public async Task<ActionResult<AuthResponseDTO>> Refresh([FromBody] RefreshTokenRequestDTO dto)
        {
            var response = await _authService.RefreshAsync(dto.RefreshToken);
            return Ok(response);
        }

        /// <summary>
        /// Trocar a própria senha (usuário autenticado)
        /// </summary>
        [HttpPost("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequestDTO dto)
        {
            if (!TryGetUserId(out var userId))
                throw new UnauthorizedException("Token inválido");

            await _authService.ChangePasswordAsync(userId, dto);
            return Ok(new { message = "Senha alterada com sucesso!" });
        }

        /// <summary>
        /// Retorna dados do usuário logado
        /// </summary>
        [HttpGet("me")]
        [Authorize]
        public async Task<ActionResult<UserInfoResponseDTO>> GetCurrentUser()
        {
            if (!TryGetUserId(out var userId))
                throw new UnauthorizedException("Token inválido");

            var user = await _authService.GetCurrentUserAsync(userId);
            return Ok(user);
        }

        private bool TryGetUserId(out int userId)
        {
            userId = 0;

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;

            return !string.IsNullOrWhiteSpace(userIdClaim)
                && int.TryParse(userIdClaim, out userId);
        }
    }
}