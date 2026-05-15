namespace MyCup.DTOs.Common
{
    public class ValidationErrorResponseDto
    {
        public string Message { get; set; } = string.Empty;
        public Dictionary<string, string[]> Errors { get; set; } = new();
    }
}
