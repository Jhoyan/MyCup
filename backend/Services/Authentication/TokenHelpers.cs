using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace MyCup.Services.Authentication
{
    /// <summary>
    /// Classe auxiliar para configurações do JWT
    /// (Evita repetir código no Program.cs e TokenManager)
    /// </summary>
    internal static class TokenHelpers
    {
        /// <summary>
        /// Retorna os parâmetros de validação do token
        /// Usado no Program.cs e no ValidateTokenAsync
        /// </summary>
        public static TokenValidationParameters GetTokenValidationParameters(IConfiguration configuration)
        {
            var tokenKey = Encoding.UTF8.GetBytes(
                configuration["Jwt:SecretKey"] ?? string.Empty
            );

            return new TokenValidationParameters
            {
                // Valida se o token não expirou
                ValidateLifetime = true,

                // Tolerância de tempo (útil quando servidores têm horários diferentes)
                // Zero = sem tolerância (para testes locais)
                ClockSkew = TimeSpan.Zero,

                // Valida quem criou o token
                ValidateIssuer = true,
                ValidIssuer = configuration["Jwt:Issuer"],

                // Valida pra quem é o token
                ValidateAudience = true,
                ValidAudience = configuration["Jwt:Audience"],

                // Valida a assinatura do token (evita tokens falsificados)
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(tokenKey)
            };
        }
    }
}