using MyCup.Data;
using MyCup.DTOs.Authentication;
using MyCup.Errors;
using MyCup.Models;
using Microsoft.EntityFrameworkCore;

namespace MyCup.Services.Authentication
{
    public class AuthService
    {
        private readonly AppDbContext _context;
        private readonly ITokenManager _tokenManager;
        private readonly IConfiguration _configuration;

        public AuthService(AppDbContext context, ITokenManager tokenManager, IConfiguration configuration)
        {
            _context = context;
            _tokenManager = tokenManager;
            _configuration = configuration;
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

            // Emitir tokens e registrar a sessão (refresh token persistido).
            return await IssueSessionAsync(usuario);
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

            // Já deixa o novo usuário logado: emite tokens e registra a sessão.
            return await IssueSessionAsync(newUser);
        }

        /// <summary>
        /// Renova a sessão a partir de um refresh token. Valida assinatura/validade (com a secret do
        /// refresh) e confirma que o token está armazenado para aquele usuário; o refresh token usado é
        /// invalidado (rotação) e um novo par token+refresh é emitido.
        /// </summary>
        public async Task<AuthResponseDTO> RefreshAsync(string refreshToken)
        {
            var userId = await _tokenManager.ValidateRefreshTokenAsync(refreshToken);
            if (userId is not int id)
                throw new UnauthorizedException("Refresh token inválido ou expirado");

            var stored = await _context.RefreshTokens
                .FirstOrDefaultAsync(rt => rt.Token == refreshToken && rt.UserId == id);
            if (stored == null)
                throw new UnauthorizedException("Refresh token não reconhecido");

            // Defesa extra: descarta um token expirado que ainda esteja na tabela.
            if (stored.ExpiresAt < DateTime.UtcNow)
            {
                _context.RefreshTokens.Remove(stored);
                await _context.SaveChangesAsync();
                throw new UnauthorizedException("Refresh token expirado");
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == id && u.IsActive);
            if (user == null)
                throw new UnauthorizedException("Usuário inválido");

            // Rotação: invalida o refresh token usado e emite uma nova sessão.
            _context.RefreshTokens.Remove(stored);
            return await IssueSessionAsync(user);
        }

        /// <summary>
        /// Gera o token de acesso e um refresh token, persiste o refresh token (uma sessão) e monta a
        /// resposta. Chamado por login, registro e refresh.
        /// </summary>
        private async Task<AuthResponseDTO> IssueSessionAsync(Models.User user)
        {
            var token = _tokenManager.GenerateToken(user);
            var refresh = _tokenManager.GenerateRefreshToken(user);

            _context.RefreshTokens.Add(new RefreshToken
            {
                UserId = user.Id,
                Token = refresh.Token,
                ExpiresAt = refresh.ExpiresAt,
                CreatedAt = DateTime.UtcNow
            });
            await _context.SaveChangesAsync();

            var expirationMinutes = _configuration.GetValue<int>("Jwt:ExpirationTimeInMinutes");

            return new AuthResponseDTO
            {
                Token = token,
                RefreshToken = refresh.Token,
                ExpiraEm = DateTime.UtcNow.AddMinutes(expirationMinutes),
                User = new UserInfoResponseDTO(user.Id, user.Name)
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