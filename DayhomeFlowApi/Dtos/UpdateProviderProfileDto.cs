using System.ComponentModel.DataAnnotations;

namespace DayhomeFlowApi.Dtos;

public class UpdateProviderProfileDto
{
    [Required]
    [MaxLength(150)]
    public string BusinessName { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string ProviderName { get; set; } = string.Empty;

    [MaxLength(150)]
    [EmailAddress]
    public string? Email { get; set; }

    [MaxLength(25)]
    public string? Phone { get; set; }
}