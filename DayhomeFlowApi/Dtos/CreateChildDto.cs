using System.ComponentModel.DataAnnotations;

namespace DayhomeFlowApi.Dtos;

public class CreateChildDto
{
    [Required]
    [MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string LastName { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? ParentName { get; set; }

    [MaxLength(150)]
    [EmailAddress]
    public string? ParentEmail { get; set; }

    [MaxLength(25)]
    public string? ParentPhone { get; set; }

    [Range(0, 1000)]
    public decimal DailyRate { get; set; }
}