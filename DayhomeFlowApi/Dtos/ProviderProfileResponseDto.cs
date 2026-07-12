namespace DayhomeFlowApi.Dtos;

public class ProviderProfileResponseDto
{
    public int Id { get; set; }
    public string BusinessName { get; set; } = string.Empty;
    public string ProviderName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Phone { get; set; }
}