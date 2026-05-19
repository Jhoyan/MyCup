using MyCup.Data;
using MyCup.DTOs.Authentication;
using MyCup.Models;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace MyCup.Services.Authentication
{
    public class AuthService
    {
        private readonly AppDbContext _context;
        private readonly ITokenManager _tokenManager;

        public AuthService(AppDbContext context, ITokenManager tokenManager)
        {
            _context = context;
            _tokenManager = tokenManager;
        }

        public async Task<(bool Success, string Message, AuthResponseDTO? Response)> LoginAsync(LoginRequestDTO dto)
        {
            // Buscar usuário pelo email
            var usuario = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == dto.Email);

            // Verificar se usuário existe
            if (usuario == null)
                return (false, "Email ou senha inválidos", null);

            // Verificar se usuário está ativo
            if (!usuario.IsActive)
                return (false, "Usuário inativo. Entre em contato com o suporte.", null);

            // Verificar senha
            if (!usuario.VerifyPassword(dto.Password))
                return (false, "Email ou senha inválidos", null);

            // Gerar token JWT
            var token = _tokenManager.GenerateToken(usuario);
            var refreshToken = _tokenManager.GenerateRefreshToken(usuario);
            var expiresAt = DateTime.UtcNow.AddMinutes(10);

            // Montar resposta
            var response = new AuthResponseDTO
            {
                Token = token,
                RefreshToken = refreshToken,
                ExpiraEm = expiresAt,
                User = new UserInfoResponseDTO(
                    usuario.Id,
                    usuario.Name
                )
            };

            return (true, string.Empty, response);
        }

        public async Task<(bool Success, string Message, AuthResponseDTO? Response)> RegisterAsync(RegisterRequestDTO dto, string userId)
        {
            if (dto.Senha != dto.ConfirmaSenha)
                return (false, "Senhas não condizem", null);

            // Verificar se username já existe
            if (await _context.Users.AnyAsync(u => u.Name == dto.Usuario))
            {
                return (false, "Username já está em uso", null);
            }

            // Verificar se email já existe (se fornecido)
            if (!string.IsNullOrEmpty(dto.Email) && await _context.Users.AnyAsync(u => u.Email == dto.Email))
            {
                return (false, "Email já está em uso", null);
            }

            // Criar novo usuário
            var newUser = new Models.User
            {
                Name = dto.Usuario,
                Email = dto.Email,
                PasswordHash = Models.User.HashPassword(dto.Senha),
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            // Gerar token JWT pro novo usuário
            var token = _tokenManager.GenerateToken(newUser);
            var expiresAt = DateTime.UtcNow.AddMinutes(10);

            // Montar resposta
            var response = new AuthResponseDTO
            {
                Token = token,
                ExpiraEm = expiresAt,
                User = new UserInfoResponseDTO(
                    newUser.Id,
                    newUser.Name
                )
            };

            return (true, string.Empty, response);
        }

        public async Task<(bool Success, string Message)> ChangePasswordAsync(int userId, ChangePasswordRequestDTO dto)
        {
            // Buscar usuário no banco
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return (false, "Usuário não encontrado");
            }

            // Verificar se a senha atual está correta
            if (!user.VerifyPassword(dto.SenhaAtual))
            {
                return (false, "Senha atual incorreta");
            }

            // Verificar se a nova senha condiz com a confirmação de senha
            if (dto.ConfirmaNovaSenha != dto.NovaSenha)
                return (false, "Senhas não condizem");

            // Atualizar senha
            user.PasswordHash = Models.User.HashPassword(dto.NovaSenha);
            await _context.SaveChangesAsync();

            return (true, "Senha alterada com sucesso!");
        }

        public async Task<(bool Success, string Message, UserInfoResponseDTO? User)> GetCurrentUserAsync(int userId)
        {
            // Buscar usuário
            var user = await _context.Users
                .Include(u => u.UserUniverses)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                return (false, "Usuário não encontrado", null);
            }

            // Retornar dados (SEM senha!)
            var response = new UserInfoResponseDTO(
                user.Id,
                user.Name
            );

            return (true, string.Empty, response);
        }
    }
}