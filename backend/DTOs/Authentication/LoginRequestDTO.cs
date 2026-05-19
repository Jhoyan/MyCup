using System.ComponentModel.DataAnnotations;

namespace MyCup.DTOs.Authentication
{
    /// <summary>
    /// DTO para receber dados de login
    /// </summary>
    public record LoginRequestDTO(
        [Required(ErrorMessage = "Email é obrigatório")] string Email,
        [Required(ErrorMessage = "Senha é obrigatória")] string Password
    );
}