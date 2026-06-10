using System.Net;
using System.Text.Json;
using MyCup.Errors;
using Microsoft.EntityFrameworkCore;

namespace MyCup.Middleware
{
    public class ExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionMiddleware> _logger;
        private readonly IHostEnvironment _env;

        public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger, IHostEnvironment env)
        {
            _next = next;
            _logger = logger;
            _env = env;
        }

        public async Task InvokeAsync(HttpContext httpContext)
        {
            try
            {
                await _next(httpContext);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, ex.Message);
                await HandleExceptionAsync(httpContext, ex);
            }
        }

        private async Task HandleExceptionAsync(HttpContext context, Exception ex)
        {
            context.Response.ContentType = "application/json";

            ApiException response;

            switch (ex)
            {
                case NotFoundException notFound:
                    context.Response.StatusCode = (int)HttpStatusCode.NotFound;
                    response = new ApiException(context.Response.StatusCode, notFound.Message);
                    break;

                case ForbiddenException forbidden:
                    context.Response.StatusCode = (int)HttpStatusCode.Forbidden;
                    response = new ApiException(context.Response.StatusCode, forbidden.Message);
                    break;

                case ConflictException conflict:
                    context.Response.StatusCode = (int)HttpStatusCode.Conflict;
                    response = new ApiException(context.Response.StatusCode, conflict.Message);
                    break;

                case BadRequestException badRequest:
                    context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                    response = new ApiException(context.Response.StatusCode, badRequest.Message, badRequest.Details);
                    break;

                case UnauthorizedException unauthorized:
                    context.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
                    response = new ApiException(context.Response.StatusCode, unauthorized.Message);
                    break;

                case UnauthorizedAccessException unauthorizedAccess:
                    context.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
                    response = new ApiException(context.Response.StatusCode, unauthorizedAccess.Message);
                    break;

                case DbUpdateConcurrencyException:
                    context.Response.StatusCode = (int)HttpStatusCode.Conflict;
                    response = new ApiException(context.Response.StatusCode, "Este registro foi modificado por outro usuário. Recarregue e tente novamente.");
                    break;

                default:
                    context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                    response = _env.IsDevelopment()
                        ? new ApiException(context.Response.StatusCode, ex.Message, ex.StackTrace)
                        : new ApiException(context.Response.StatusCode, "Erro interno do servidor.");
                    break;
            }

            var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
            await context.Response.WriteAsync(JsonSerializer.Serialize(response, options));
        }
    }
}
