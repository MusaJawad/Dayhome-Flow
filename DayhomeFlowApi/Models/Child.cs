using System.ComponentModel.DataAnnotations;

namespace DayhomeFlowApi.Models;

public class Child
{
    public int Id { get; set; }

    [Required]
    public int UserId { get; set; }

    public User? User { get; set; }

    [Required]
    [MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string LastName { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? ParentName { get; set; }

    [MaxLength(150)]
    public string? ParentEmail { get; set; }

    [MaxLength(25)]
    public string? ParentPhone { get; set; }

    public decimal DailyRate { get; set; }

    public bool IsActive { get; set; } = true;

    public List<AttendanceRecord> AttendanceRecords { get; set; } = new();
}