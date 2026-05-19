using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using MyCup.Models;
using Microsoft.IdentityModel.Tokens;

namespace MyCup.Services.Authentication
{
    /// <summary>
    /// Implementação do gerenciador de tokens JWT
    /// </summary>
    public class TokenManager : ITokenManager
    {
        private readonly IConfiguration _configuration;

        // INJEÇÃO DE DEPENDÊNCIA
        public TokenManager(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        // GERAR TOKEN NORMAL
        public string GenerateToken(Models.User user)
        {
            // Pegar configurações do appsettings.json
            var jwt = _configuration.GetSection("Jwt");
            var secretKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwt["SecretKey"] ?? string.Empty)
            );

            // Criar Claims (informações dentro do token)
            var claims = new List<Claim>
            {
                // Sub = Subject (usuário principal)
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                
                // Jti = JWT ID (identificador único do token)
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                
                // Name (usado pra exibir "Bem-vindo, joao.silva")
                new Claim(ClaimTypes.Name, user.Name),
            };

            // Tempo de expiração
            var expirationTimeInMinutes = jwt.GetValue<int>("ExpirationTimeInMinutes");

            // Montar o token
            var token = new JwtSecurityToken(
                issuer: jwt.GetValue<string>("Issuer"), // Quem emitiu
                audience: jwt.GetValue<string>("Audience"), // Quem consome
                claims: claims, // Autoridades e poderes
                expires: DateTime.UtcNow.AddMinutes(expirationTimeInMinutes), // Tempo de expiração
                signingCredentials: new SigningCredentials(secretKey, SecurityAlgorithms.HmacSha256) // Assinatura
            );

            // Converter token pra string
            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        // GERAR REFRESH TOKEN (SEM Roles)
        public string GenerateRefreshToken(Models.User user)
        {
            var jwt = _configuration.GetSection("Jwt");
            var secretKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwt["SecretKey"] ?? string.Empty)
            );

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Name),
                new Claim(JwtRegisteredClaimNames.Jti, user.Id.ToString()),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Name),
            };

            // Tempo de expiração (MAIOR que o token normal)
            var refreshExpirationTimeInHours = jwt.GetValue<int>("RefreshExpirationTimeInHours");

            // Montar o refresh token
            var refreshToken = new JwtSecurityToken(
                issuer: jwt.GetValue<string>("Issuer"),
                audience: jwt.GetValue<string>("Audience"),
                claims: claims,
                expires: DateTime.UtcNow.AddHours(refreshExpirationTimeInHours), // Expira em 8 dias
                signingCredentials: new SigningCredentials(secretKey, SecurityAlgorithms.HmacSha256)
            );

            // Converter pra string
            return new JwtSecurityTokenHandler().WriteToken(refreshToken);
        }

        // VALIDAR TOKEN (verifica se é válido)
        public async Task<(bool isValid, string? username)> ValidateTokenAsync(string token)
        {
            // Verificar se token não é vazio
            if (string.IsNullOrWhiteSpace(token))
                return (false, null);

            try
            {
                // Pegar parâmetros de validação
                var tokenParameters = TokenHelpers.GetTokenValidationParameters(_configuration);

                // Validar o token
                var validTokenResult = await new JwtSecurityTokenHandler()
                    .ValidateTokenAsync(token, tokenParameters);

                // Se não for válido, retorna falso
                if (!validTokenResult.IsValid)
                    return (false, null);

                // Extrair username do token
                var username = validTokenResult.Claims
                    .FirstOrDefault(c => c.Key == ClaimTypes.Name)
                    .Value as string;

                return (true, username);
            }
            catch
            {
                // Se der qualquer erro, token é inválido
                return (false, null);
            }
        }
    }
}