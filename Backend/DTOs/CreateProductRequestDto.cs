using System.ComponentModel.DataAnnotations;

namespace AgroLinkAPI.DTOs;

public class CreateProductRequestDto
{
    [Required]
    public int AgrochemicalId { get; set; }

    [Range(1, int.MaxValue)]
    public int Quantity { get; set; }

    [MaxLength(500)]
    public string Message { get; set; } = string.Empty;
}