namespace AgroLinkAPI.DTOs;

public class CropResponseDto
{
    public int Id { get; set; }

    public string Name { get; set; }
        = string.Empty;

    public string Category { get; set; }
        = string.Empty;

    public string Description { get; set; }
        = string.Empty;

    public decimal PricePerKg { get; set; }

    public decimal QuantityInKg { get; set; }

    public string Location { get; set; }
        = string.Empty;

    public int FarmerId { get; set; }

    public string FarmerName { get; set; }
        = string.Empty;

    public DateTime CreatedAt { get; set; }
}