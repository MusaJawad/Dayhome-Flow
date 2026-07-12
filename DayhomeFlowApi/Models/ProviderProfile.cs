using System.ComponentModel.DataAnnotations;

namespace DayhomeFlowApi.Models;

public class ProviderProfile
{
    public int Id { get; set; }

    [Required]
    public int UserId { get; set; }

    public User? User { get; set; }

    [Required]
    [MaxLength(150)]
    public string BusinessName { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string ProviderName { get; set; } = string.Empty;

    [MaxLength(150)]
    public string? Email { get; set; }

    [MaxLength(25)]
    public string? Phone { get; set; }
}