namespace DayhomeFlowApi.Dtos;

public class AttendanceResponseDto
{
    public int Id { get; set; }
    public int ChildId { get; set; }
    public string ChildName { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public bool WasPresent { get; set; }
    public TimeSpan? DropOffTime { get; set; }
    public TimeSpan? PickUpTime { get; set; }
    public string? Notes { get; set; }
}