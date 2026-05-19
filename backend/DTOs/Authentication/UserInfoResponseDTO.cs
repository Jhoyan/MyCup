namespace MyCup.DTOs.Authentication
{
    /// <summary>
    /// Informações do usuário (retornadas no login)
    /// NUNCA incluir PasswordHash aqui!
    /// </summary>
    public record UserInfoResponseDTO(
        int Id,
        string Username
    );
}
