using System.ComponentModel.DataAnnotations;

namespace MyCup.DTOs.Authentication
{
    /// <summary>
    /// DTO para criar novo usuário
    /// </summary>
    public record RegisterRequestDTO(
        [Required(ErrorMessage = "Username é obrigatório")]
        [MaxLength(50, ErrorMessage = "Username não pode ter mais de 50 caracteres")]
        [RegularExpression(@"^[a-zA-Z0-9._-]+$", ErrorMessage = "Username só pode conter letras, números, ponto, hífen e underscore")]
        string Usuario,

        [EmailAddress(ErrorMessage = "Email inválido")]
        string? Email,

        [Required(ErrorMessage = "Senha é obrigatória")]
        [MinLength(6, ErrorMessage = "Senha deve ter no mínimo 6 caracteres")]
        string Senha,

        [Required(ErrorMessage = "Confirmação de senha é obrigatória")]
        string ConfirmaSenha
    );
}