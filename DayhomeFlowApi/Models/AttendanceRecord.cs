using System.ComponentModel.DataAnnotations;

namespace DayhomeFlowApi.Models;

public class AttendanceRecord
{
    public int Id { get; set; }

    [Required]
    public int UserId { get; set; }

    public User? User { get; set; }

    [Required]
    public int ChildId { get; set; }

    public Child? Child { get; set; }

    public DateTime Date { get; set; }

    public bool WasPresent { get; set; } = true;

    public TimeSpan? DropOffTime { get; set; }

    public TimeSpan? PickUpTime { get; set; }

    [MaxLength(500)]
    public string? Notes { get; set; }
}