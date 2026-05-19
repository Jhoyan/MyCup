using MyCup.DTOs.Authentication;
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
            try
            {
                var (success, message, response) = await _authService.LoginAsync(dto);

                if (!success)
                    return Unauthorized(new { message });

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    erro = "Erro ao realizar login",
                    detalhes = ex.Message
                });
            }
        }

        /// <summary>
        /// Criar novo usuário
        /// </summary>
        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<ActionResult<AuthResponseDTO>> Register([FromBody] RegisterRequestDTO dto)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? string.Empty;

                var (success, message, response) = await _authService.RegisterAsync(dto, userId);

                if (!success)
                    return BadRequest(new { message });

                return CreatedAtAction(nameof(Login), response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    erro = "Erro ao criar usuário",
                    detalhes = ex.Message
                });
            }
        }

        /// <summary>
        /// Trocar a própria senha (usuário autenticado)
        /// </summary>
        [HttpPost("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequestDTO dto)
        {
            try
            {
                if (!TryGetUserId(out var userId))
                {
                    return Unauthorized(new { message = "Token inválido" });
                }

                var (success, message) = await _authService.ChangePasswordAsync(userId, dto);

                if (!success)
                {
                    if (message.Contains("não encontrado"))
                        return NotFound(new { message });
                    
                    return BadRequest(new { message });
                }

                return Ok(new { message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    erro = "Erro ao alterar senha",
                    detalhes = ex.Message
                });
            }
        }

        /// <summary>
        /// Retorna dados do usuário logado
        /// </summary>
        [HttpGet("me")]
        [Authorize]
        public async Task<ActionResult<UserInfoResponseDTO>> GetCurrentUser()
        {
            try
            {
                if (!TryGetUserId(out var userId))
                {
                    return Unauthorized(new { message = "Token inválido" });
                }

                var (success, message, user) = await _authService.GetCurrentUserAsync(userId);

                if (!success)
                    return NotFound(new { message });

                return Ok(user);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    erro = "Erro ao buscar usuário",
                    detalhes = ex.Message
                });
            }
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