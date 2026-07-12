namespace DayhomeFlowApi.Dtos;

public class ChildResponseDto
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? ParentName { get; set; }
    public string? ParentEmail { get; set; }
    public string? ParentPhone { get; set; }
    public decimal DailyRate { get; set; }
    public bool IsActive { get; set; }
}