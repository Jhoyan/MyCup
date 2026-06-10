namespace MyCup.Errors
{
    public class BadRequestException : Exception
    {
        public object? Details { get; }

        public BadRequestException(string message, object? details = null) : base(message)
        {
            Details = details;
        }
    }
}
