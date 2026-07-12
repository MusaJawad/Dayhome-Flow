namespace DayhomeFlowApi.Dtos;

public class AuthResponseDto
{
    public string Token { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? BusinessName { get; set; }
    public string? ProviderName { get; set; }
}