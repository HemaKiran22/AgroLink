namespace AgroLinkAPI.DTOs;

public class AgrochemicalResponseDto
{
    public int Id { get; set; }

    public string Name { get; set; }
        = string.Empty;

    public string Category { get; set; }
        = string.Empty;

    public string Description { get; set; }
        = string.Empty;

    public string UsageInstructions { get; set; }
        = string.Empty;

    public decimal Price { get; set; }

    public int StockQuantity { get; set; }

    public int SellerId { get; set; }

    public string SellerName { get; set; }
        = string.Empty;

    public DateTime CreatedAt { get; set; }
}