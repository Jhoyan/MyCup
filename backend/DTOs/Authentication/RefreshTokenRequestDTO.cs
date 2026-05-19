using System.ComponentModel.DataAnnotations;

namespace MyCup.DTOs.Authentication
{
    /// <summary>
    /// DTO para solicitar renovação do token (usando refresh token)
    /// </summary>
    public record RefreshTokenRequestDTO(
        [Required(ErrorMessage = "RefreshToken é obrigatório")]
        string RefreshToken
    );
}
