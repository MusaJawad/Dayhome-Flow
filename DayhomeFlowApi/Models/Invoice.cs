using System.ComponentModel.DataAnnotations;

namespace DayhomeFlowApi.Models;

public class Invoice
{
    public int Id { get; set; }

    [Required]
    public int UserId { get; set; }

    public User? User { get; set; }

    [Required]
    public int ChildId { get; set; }

    public Child? Child { get; set; }

    public int Month { get; set; }

    public int Year { get; set; }

    public int TotalDays { get; set; }

    public decimal DailyRate { get; set; }

    public decimal TotalAmount { get; set; }

    [MaxLength(50)]
    public string Status { get; set; } = "Unpaid";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}