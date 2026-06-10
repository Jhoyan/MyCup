namespace MyCup.Errors
{
    public class ApiException
    {
        public int StatusCode { get; set; }
        public string Message { get; set; }
        public object? Details { get; set; }

        public ApiException(int statusCode, string message, object? details = null)
        {
            StatusCode = statusCode;
            Message = message;
            Details = details;
        }
    }
}
