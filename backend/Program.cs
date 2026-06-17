using Microsoft.EntityFrameworkCore;
using MyCup.Data;
using MyCup.Services;
using MyCup.Services.Fixtures;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using MyCup.Services.Authentication;
using MyCup.Services.Authorization;
using MyCup.Middleware;
using Microsoft.AspNetCore.Mvc;
using MyCup.DTOs.Common;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' was not found.");

builder.Services.AddAuthentication(options =>
{
    // Define JWT como esquema padrão
options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    // TokenHelpers pra no repetir código
options.TokenValidationParameters = TokenHelpers.GetTokenValidationParameters(builder.Configuration);
});

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:3000", "https://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<UniverseAuthorizer>();
builder.Services.AddScoped<ITokenManager, TokenManager>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<UniversesService>();
builder.Services.AddScoped<PlayersService>();
builder.Services.AddScoped<PlayerLinkRequestsService>();
builder.Services.AddScoped<TeamsService>();
builder.Services.AddScoped<ChampionshipsService>();
builder.Services.AddScoped<MatchesService>();
builder.Services.AddScoped<UserUniversesService>();
builder.Services.AddScoped<DashboardService>();
builder.Services.AddScoped<FixturesService>();
builder.Services.AddScoped<IFixtureGenerator, RoundRobinFixtureGenerator>();
builder.Services.AddScoped<IFixtureGenerator, KnockoutFixtureGenerator>();
builder.Services.AddScoped<IFixtureGenerator, GroupsKnockoutFixtureGenerator>();

builder.Services.AddControllers();

// Padroniza a resposta de erros de validação do ModelState em ValidationErrorResponseDto
// (mantém o campo "message" consistente com o middleware de exceções — ver INT-003).
builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.InvalidModelStateResponseFactory = context =>
    {
        var errors = context.ModelState
            .Where(entry => entry.Value is not null && entry.Value.Errors.Count > 0)
            .ToDictionary(
                entry => entry.Key,
                entry => entry.Value!.Errors.Select(e => e.ErrorMessage).ToArray());

        var response = new ValidationErrorResponseDto
        {
            Message = "Erro de validação",
            Errors = errors
        };

        return new BadRequestObjectResult(response);
    };
});

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(
    options =>
    {
        // CONFIGURAR SWAGGER PRA ACEITAR TOKEN JWT
        options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
        {
            Name = "Authorization",
            Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
            Scheme = "Bearer",
            BearerFormat = "JWT",
            In = Microsoft.OpenApi.Models.ParameterLocation.Header,
            Description = "Insira o token JWT no formato: Bearer {seu_token}"
        });

        options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
        {
            {
                new Microsoft.OpenApi.Models.OpenApiSecurityScheme
                {
                    Reference = new Microsoft.OpenApi.Models.OpenApiReference
                    {
                        Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                        Id = "Bearer"
                    }
                },
                Array.Empty<string>()
            }
        });
    }
);

var app = builder.Build();

// Global exception handling middleware (must run first to catch all exceptions).
app.UseMiddleware<ExceptionMiddleware>();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
