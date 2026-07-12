using System.ComponentModel.DataAnnotations;

namespace DayhomeFlowApi.Dtos;

public class RegisterUserDto
{
    [Required]
    [EmailAddress]
    [MaxLength(150)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(6)]
    public string Password { get; set; } = string.Empty;

    [Required]
    [MaxLength(150)]
    public string BusinessName { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string ProviderName { get; set; } = string.Empty;

    [MaxLength(25)]
    public string? Phone { get; set; }
}