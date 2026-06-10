using MyCup.Data;
using MyCup.DTOs.Authentication;
using MyCup.Errors;
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

        public async Task<AuthResponseDTO> LoginAsync(LoginRequestDTO dto)
        {
            // Buscar usuário pelo email
            var usuario = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == dto.Email);

            // Verificar se usuário existe
            if (usuario == null)
                throw new UnauthorizedException("Email ou senha inválidos");

            // Verificar se usuário está ativo
            if (!usuario.IsActive)
                throw new ForbiddenException("Usuário inativo. Entre em contato com o suporte.");

            // Verificar senha
            if (!usuario.VerifyPassword(dto.Password))
                throw new UnauthorizedException("Email ou senha inválidos");

            // Gerar token JWT
            var token = _tokenManager.GenerateToken(usuario);
            var refreshToken = _tokenManager.GenerateRefreshToken(usuario);
            var expiresAt = DateTime.UtcNow.AddMinutes(10);

            // Montar resposta
            return new AuthResponseDTO
            {
                Token = token,
                RefreshToken = refreshToken,
                ExpiraEm = expiresAt,
                User = new UserInfoResponseDTO(
                    usuario.Id,
                    usuario.Name
                )
            };
        }

        public async Task<AuthResponseDTO> RegisterAsync(RegisterRequestDTO dto, string userId)
        {
            if (dto.Senha != dto.ConfirmaSenha)
                throw new BadRequestException("Senhas não condizem");

            // Verificar se username já existe
            if (await _context.Users.AnyAsync(u => u.Name == dto.Usuario))
                throw new ConflictException("Username já está em uso");

            // Verificar se email já existe (se fornecido)
            if (!string.IsNullOrEmpty(dto.Email) && await _context.Users.AnyAsync(u => u.Email == dto.Email))
                throw new ConflictException("Email já está em uso");

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
            return new AuthResponseDTO
            {
                Token = token,
                ExpiraEm = expiresAt,
                User = new UserInfoResponseDTO(
                    newUser.Id,
                    newUser.Name
                )
            };
        }

        public async Task ChangePasswordAsync(int userId, ChangePasswordRequestDTO dto)
        {
            // Buscar usuário no banco
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                throw new NotFoundException("Usuário não encontrado");

            // Verificar se a senha atual está correta
            if (!user.VerifyPassword(dto.SenhaAtual))
                throw new BadRequestException("Senha atual incorreta");

            // Verificar se a nova senha condiz com a confirmação de senha
            if (dto.ConfirmaNovaSenha != dto.NovaSenha)
                throw new BadRequestException("Senhas não condizem");

            // Atualizar senha
            user.PasswordHash = Models.User.HashPassword(dto.NovaSenha);
            await _context.SaveChangesAsync();
        }

        public async Task<UserInfoResponseDTO> GetCurrentUserAsync(int userId)
        {
            // Buscar usuário
            var user = await _context.Users
                .Include(u => u.UserUniverses)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                throw new NotFoundException("Usuário não encontrado");

            // Retornar dados (SEM senha!)
            return new UserInfoResponseDTO(
                user.Id,
                user.Name
            );
        }
    }
}