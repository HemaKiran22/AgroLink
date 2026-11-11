using System.Security.Claims;
using AgroLinkAPI.Data;
using AgroLinkAPI.DTOs;
using AgroLinkAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AgroLinkAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AgrochemicalsController : ControllerBase
{
    private readonly AppDbContext _context;

    public AgrochemicalsController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/agrochemicals
    [HttpGet]
    public async Task<
        ActionResult<IEnumerable<AgrochemicalResponseDto>>>
        GetAgrochemicals()
    {
        var products = await _context.Agrochemicals
            .AsNoTracking()
            .OrderByDescending(item => item.CreatedAt)
            .Select(item => new AgrochemicalResponseDto
            {
                Id = item.Id,
                Name = item.Name,
                Category = item.Category,
                Description = item.Description,
                UsageInstructions = item.UsageInstructions,
                Price = item.Price,
                StockQuantity = item.StockQuantity,
                SellerId = item.SellerId,
                SellerName = item.Seller.Name,
                CreatedAt = item.CreatedAt
            })
            .ToListAsync();

        return Ok(products);
    }

    // GET: api/agrochemicals/5
    [HttpGet("{id:int}")]
    public async Task<ActionResult<AgrochemicalResponseDto>>
        GetAgrochemical(int id)
    {
        var product = await _context.Agrochemicals
            .AsNoTracking()
            .Where(item => item.Id == id)
            .Select(item => new AgrochemicalResponseDto
            {
                Id = item.Id,
                Name = item.Name,
                Category = item.Category,
                Description = item.Description,
                UsageInstructions = item.UsageInstructions,
                Price = item.Price,
                StockQuantity = item.StockQuantity,
                SellerId = item.SellerId,
                SellerName = item.Seller.Name,
                CreatedAt = item.CreatedAt
            })
            .FirstOrDefaultAsync();

        if (product is null)
        {
            return NotFound(new
            {
                message = "Agrochemical not found."
            });
        }

        return Ok(product);
    }

    // GET: api/agrochemicals/my-products
    [HttpGet("my-products")]
    [Authorize(Roles = "Seller")]
    public async Task<
        ActionResult<IEnumerable<AgrochemicalResponseDto>>>
        GetMyProducts()
    {
        var sellerId = GetCurrentUserId();

        if (sellerId is null)
        {
            return Unauthorized();
        }

        var products = await _context.Agrochemicals
            .AsNoTracking()
            .Where(item => item.SellerId == sellerId.Value)
            .OrderByDescending(item => item.CreatedAt)
            .Select(item => new AgrochemicalResponseDto
            {
                Id = item.Id,
                Name = item.Name,
                Category = item.Category,
                Description = item.Description,
                UsageInstructions = item.UsageInstructions,
                Price = item.Price,
                StockQuantity = item.StockQuantity,
                SellerId = item.SellerId,
                SellerName = item.Seller.Name,
                CreatedAt = item.CreatedAt
            })
            .ToListAsync();

        return Ok(products);
    }

    // POST: api/agrochemicals
    [HttpPost]
    [Authorize(Roles = "Seller")]
    public async Task<ActionResult<AgrochemicalResponseDto>>
        CreateAgrochemical(CreateAgrochemicalDto dto)
    {
        var sellerId = GetCurrentUserId();

        if (sellerId is null)
        {
            return Unauthorized();
        }

        var product = new Agrochemical
        {
            Name = dto.Name.Trim(),
            Category = dto.Category.Trim(),
            Description = dto.Description.Trim(),
            UsageInstructions = dto.UsageInstructions.Trim(),
            Price = dto.Price,
            StockQuantity = dto.StockQuantity,
            SellerId = sellerId.Value,
            CreatedAt = DateTime.UtcNow
        };

        _context.Agrochemicals.Add(product);

        await _context.SaveChangesAsync();

        var sellerName = User.FindFirstValue(
            ClaimTypes.Name
        ) ?? string.Empty;

        var response = new AgrochemicalResponseDto
        {
            Id = product.Id,
            Name = product.Name,
            Category = product.Category,
            Description = product.Description,
            UsageInstructions = product.UsageInstructions,
            Price = product.Price,
            StockQuantity = product.StockQuantity,
            SellerId = product.SellerId,
            SellerName = sellerName,
            CreatedAt = product.CreatedAt
        };

        return CreatedAtAction(
            nameof(GetAgrochemical),
            new { id = product.Id },
            response
        );
    }

    // PUT: api/agrochemicals/5
    [HttpPut("{id:int}")]
    [Authorize(Roles = "Seller")]
    public async Task<IActionResult> UpdateAgrochemical(
        int id,
        UpdateAgrochemicalDto dto)
    {
        var sellerId = GetCurrentUserId();

        if (sellerId is null)
        {
            return Unauthorized();
        }

        var product = await _context.Agrochemicals
            .FirstOrDefaultAsync(item =>
                item.Id == id &&
                item.SellerId == sellerId.Value
            );

        if (product is null)
        {
            return NotFound(new
            {
                message =
                    "Agrochemical not found or you do not own this product."
            });
        }

        product.Name = dto.Name.Trim();
        product.Category = dto.Category.Trim();
        product.Description = dto.Description.Trim();
        product.UsageInstructions =
            dto.UsageInstructions.Trim();
        product.Price = dto.Price;
        product.StockQuantity = dto.StockQuantity;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Agrochemical updated successfully.",

            product = new
            {
                product.Id,
                product.Name,
                product.Category,
                product.Description,
                product.UsageInstructions,
                product.Price,
                product.StockQuantity,
                product.SellerId,
                product.CreatedAt
            }
        });
    }

    // DELETE: api/agrochemicals/5
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Seller")]
    public async Task<IActionResult> DeleteAgrochemical(int id)
    {
        var sellerId = GetCurrentUserId();

        if (sellerId is null)
        {
            return Unauthorized();
        }

        var product = await _context.Agrochemicals
            .FirstOrDefaultAsync(item =>
                item.Id == id &&
                item.SellerId == sellerId.Value
            );

        if (product is null)
        {
            return NotFound(new
            {
                message =
                    "Agrochemical not found or you do not own this product."
            });
        }

        var hasRequests = await _context.ProductRequests
            .AnyAsync(request =>
                request.AgrochemicalId == product.Id
            );

        if (hasRequests)
        {
            return Conflict(new
            {
                message =
                    "This product cannot be deleted because requests exist for it."
            });
        }

        _context.Agrochemicals.Remove(product);

        await _context.SaveChangesAsync();

        return NoContent();
    }

    private int? GetCurrentUserId()
    {
        var value = User.FindFirstValue(
            ClaimTypes.NameIdentifier
        );

        return int.TryParse(value, out var userId)
            ? userId
            : null;
    }
}