using MyCup.Models;

namespace MyCup.Services.Authentication
{
    /// <summary>A generated refresh token together with the moment it expires.</summary>
    public record RefreshTokenResult(string Token, DateTime ExpiresAt);

    /// <summary>
    /// Interface responsável por gerenciar tokens JWT
    /// </summary>
    public interface ITokenManager
    {
        /// <summary>
        /// Gera um token JWT de acesso para o usuário (curta duração).
        /// </summary>
        string GenerateToken(Models.User user);

        /// <summary>
        /// Gera um refresh token (longa duração, assinado com uma secret própria) e retorna também a sua
        /// expiração, para que possa ser persistido.
        /// </summary>
        RefreshTokenResult GenerateRefreshToken(Models.User user);

        /// <summary>
        /// Valida assinatura e validade de um token de acesso. Retorna: (isValid, username).
        /// </summary>
        Task<(bool isValid, string? username)> ValidateTokenAsync(string token);

        /// <summary>
        /// Valida assinatura e validade de um refresh token (usando a secret do refresh) e retorna o id do
        /// usuário, ou null quando o token é inválido/expirado.
        /// </summary>
        Task<int?> ValidateRefreshTokenAsync(string refreshToken);
    }
}
