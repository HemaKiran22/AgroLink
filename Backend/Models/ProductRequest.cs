using System.ComponentModel.DataAnnotations;

namespace AgroLinkAPI.Models;

public class ProductRequest
{
    public int Id { get; set; }

    public int FarmerId { get; set; }

    public User Farmer { get; set; } = null!;

    public int AgrochemicalId { get; set; }

    public Agrochemical Agrochemical { get; set; } = null!;

    [Range(1, int.MaxValue)]
    public int Quantity { get; set; }

    [Required]
    [MaxLength(20)]
    public string Status { get; set; } = "Pending";

    [MaxLength(500)]
    public string Message { get; set; } = string.Empty;

    public DateTime RequestedAt { get; set; } = DateTime.UtcNow;
}