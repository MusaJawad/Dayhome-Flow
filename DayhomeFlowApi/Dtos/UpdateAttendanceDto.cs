using System.ComponentModel.DataAnnotations;

namespace DayhomeFlowApi.Dtos;

public class UpdateAttendanceDto
{
    [Required]
    public DateTime Date { get; set; }

    public bool WasPresent { get; set; } = true;

    public TimeSpan? DropOffTime { get; set; }

    public TimeSpan? PickUpTime { get; set; }

    [MaxLength(500)]
    public string? Notes { get; set; }
}