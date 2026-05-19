namespace MyCup.DTOs.Authentication
{
    /// <summary>
    /// DTO de resposta após login/register bem-sucedido
    /// </summary>
    public class AuthResponseDTO
    {
        /// <summary>
        /// Token JWT para usar nas próximas requisições
        /// </summary>
        public string Token { get; set; } = string.Empty;

        /// <summary>
        /// Refresh Token que será armazenado pelo client
        /// </summary>
        public string RefreshToken { get; set; } = string.Empty;

        /// <summary>
        /// Quando o token expira (ex: 5m depois)
        /// </summary>
        public DateTime ExpiraEm { get; set; }

        /// <summary>
        /// Dados do usuário (SEM a senha!)
        /// </summary>
        public UserInfoResponseDTO User { get; set; } = null!;
    }
}