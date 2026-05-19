using MyCup.Models;

namespace MyCup.Services.Authentication
{
    /// <summary>
    /// Interface responsável por gerenciar tokens JWT
    /// </summary>
    public interface ITokenManager
    {
        /// <summary>
        /// Gera um token JWT para o usuário
        /// </summary>
        string GenerateToken(Models.User user);

        /// <summary>
        /// Gera um refresh token para renovar o token principal
        /// (Refresh Token tem duração maior e não contém Roles)
        /// </summary>
        string GenerateRefreshToken(Models.User user);

        /// <summary>
        /// Valida se um token (ou refresh token) é válido
        /// Retorna: (isValid, username)
        /// </summary>
        Task<(bool isValid, string? username)> ValidateTokenAsync(string token);
    }
}