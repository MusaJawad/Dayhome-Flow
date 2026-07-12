using System.ComponentModel.DataAnnotations;

namespace DayhomeFlowApi.Models;

public class User
{
    public int Id { get; set; }

    [Required]
    [MaxLength(150)]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    public ProviderProfile? ProviderProfile { get; set; }

    public List<Child> Children { get; set; } = new();
}