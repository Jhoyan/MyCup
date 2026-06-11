---
name: backend-architecture-patterns
description: MyCup backend conventions — service+controller structure, exceptions, DI, error handling
metadata:
  type: project
---

MyCup backend is .NET 8 + EF Core + PostgreSQL (Npgsql) + JWT. Conventions observed in existing code (UniversesService, PlayersService, their controllers):

- One `XService` class per aggregate in `backend/Services/`, constructor-injected `AppDbContext`, async methods returning DTOs or ids.
- Controllers in `backend/Controllers/`, `[ApiController]`, `[Route("api/[controller]")]`, `[Authorize]`, thin — delegate to service, return `Ok(...)` / `CreatedAtAction(...)` with `{ message }` payloads in Portuguese.
- Errors via custom exceptions in `backend/Errors/` (NotFoundException, ConflictException, BadRequestException, etc.) thrown from services; `ExceptionMiddleware` (registered first in Program.cs) maps them to HTTP responses. Do NOT catch in controllers.
- Register each service in `Program.cs` with `builder.Services.AddScoped<XService>()`.
- DTOs live under `backend/DTOs/<Area>/`. Many are already created (Championships, Teams, Matches, Dashboard) — reuse them.
- Entity↔table mapping, keys, FKs configured in `AppDbContext.OnModelCreating` (snake_case table names).

See business rules in [[backend-business-rules]].
