using System.ComponentModel.DataAnnotations;

namespace AgroLinkAPI.DTOs;

public class UpdateCropDto
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string Category { get; set; } = string.Empty;

    [MaxLength(500)]
    public string Description { get; set; } = string.Empty;

    [Range(0.01, double.MaxValue)]
    public decimal PricePerKg { get; set; }

    [Range(0.01, double.MaxValue)]
    public decimal QuantityInKg { get; set; }

    [Required]
    [MaxLength(100)]
    public string Location { get; set; } = string.Empty;
}