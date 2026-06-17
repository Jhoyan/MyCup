using System.ComponentModel.DataAnnotations;

namespace MyCup.DTOs.Players
{
    /// <summary>
    /// Payload an admin sends to ask a user (resolved by email) to take ownership of a player.
    /// </summary>
    public class CreatePlayerLinkRequestDto
    {
        [Required(ErrorMessage = "O e-mail é obrigatório")]
        [EmailAddress(ErrorMessage = "Informe um e-mail válido")]
        [MaxLength(180)]
        public string Email { get; set; } = string.Empty;
    }
}
