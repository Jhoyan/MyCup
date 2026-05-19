using System.ComponentModel.DataAnnotations;

namespace MyCup.DTOs.Authentication
{
    /// <summary>
    /// DTO para usuário trocar a própria senha
    /// </summary>
    public record ChangePasswordRequestDTO(
        [Required(ErrorMessage = "Senha atual é obrigatória")]
        string SenhaAtual,

        [Required(ErrorMessage = "Nova senha é obrigatória")]
        [MinLength(6, ErrorMessage = "Nova senha deve ter no mínimo 6 caracteres")]
        string NovaSenha,

        [Required(ErrorMessage = "Confirmação de senha é obrigatória")]
        string ConfirmaNovaSenha
    );
}
