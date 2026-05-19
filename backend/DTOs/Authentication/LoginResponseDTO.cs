namespace MyCup.DTOs.Authentication
{
    /// <summary>
    /// DTO de resposta após login/register bem-sucedido
    /// Agora retorna Token + RefreshToken
    /// </summary>
    public record LoginResponseDTO(
        string Token,
        string RefreshToken
    );
}
