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
public class CropsController : ControllerBase
{
    private readonly AppDbContext _context;

    public CropsController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/crops
    [HttpGet]
    public async Task<
        ActionResult<IEnumerable<CropResponseDto>>> GetCrops()
    {
        var crops = await _context.Crops
            .AsNoTracking()
            .OrderByDescending(crop => crop.CreatedAt)
            .Select(crop => new CropResponseDto
            {
                Id = crop.Id,
                Name = crop.Name,
                Category = crop.Category,
                Description = crop.Description,
                PricePerKg = crop.PricePerKg,
                QuantityInKg = crop.QuantityInKg,
                Location = crop.Location,
                FarmerId = crop.FarmerId,
                FarmerName = crop.Farmer.Name,
                CreatedAt = crop.CreatedAt
            })
            .ToListAsync();

        return Ok(crops);
    }

    // GET: api/crops/5
    [HttpGet("{id:int}")]
    public async Task<ActionResult<CropResponseDto>>
        GetCrop(int id)
    {
        var crop = await _context.Crops
            .AsNoTracking()
            .Where(crop => crop.Id == id)
            .Select(crop => new CropResponseDto
            {
                Id = crop.Id,
                Name = crop.Name,
                Category = crop.Category,
                Description = crop.Description,
                PricePerKg = crop.PricePerKg,
                QuantityInKg = crop.QuantityInKg,
                Location = crop.Location,
                FarmerId = crop.FarmerId,
                FarmerName = crop.Farmer.Name,
                CreatedAt = crop.CreatedAt
            })
            .FirstOrDefaultAsync();

        if (crop is null)
        {
            return NotFound(new
            {
                message = "Crop not found."
            });
        }

        return Ok(crop);
    }

    // GET: api/crops/my-crops
    [HttpGet("my-crops")]
    [Authorize(Roles = "Farmer")]
    public async Task<
        ActionResult<IEnumerable<CropResponseDto>>> GetMyCrops()
    {
        var farmerId = GetCurrentUserId();

        if (farmerId is null)
        {
            return Unauthorized();
        }

        var crops = await _context.Crops
            .AsNoTracking()
            .Where(crop => crop.FarmerId == farmerId.Value)
            .OrderByDescending(crop => crop.CreatedAt)
            .Select(crop => new CropResponseDto
            {
                Id = crop.Id,
                Name = crop.Name,
                Category = crop.Category,
                Description = crop.Description,
                PricePerKg = crop.PricePerKg,
                QuantityInKg = crop.QuantityInKg,
                Location = crop.Location,
                FarmerId = crop.FarmerId,
                FarmerName = crop.Farmer.Name,
                CreatedAt = crop.CreatedAt
            })
            .ToListAsync();

        return Ok(crops);
    }

    // POST: api/crops
    [HttpPost]
    [Authorize(Roles = "Farmer")]
    public async Task<ActionResult<CropResponseDto>>
        CreateCrop(CreateCropDto dto)
    {
        var farmerId = GetCurrentUserId();

        if (farmerId is null)
        {
            return Unauthorized();
        }

        var crop = new Crop
        {
            Name = dto.Name.Trim(),
            Category = dto.Category.Trim(),
            Description = dto.Description.Trim(),
            PricePerKg = dto.PricePerKg,
            QuantityInKg = dto.QuantityInKg,
            Location = dto.Location.Trim(),
            FarmerId = farmerId.Value,
            CreatedAt = DateTime.UtcNow
        };

        _context.Crops.Add(crop);

        await _context.SaveChangesAsync();

        var farmerName = User.FindFirstValue(
            ClaimTypes.Name
        ) ?? string.Empty;

        var response = new CropResponseDto
        {
            Id = crop.Id,
            Name = crop.Name,
            Category = crop.Category,
            Description = crop.Description,
            PricePerKg = crop.PricePerKg,
            QuantityInKg = crop.QuantityInKg,
            Location = crop.Location,
            FarmerId = crop.FarmerId,
            FarmerName = farmerName,
            CreatedAt = crop.CreatedAt
        };

        return CreatedAtAction(
            nameof(GetCrop),
            new { id = crop.Id },
            response
        );
    }

    // PUT: api/crops/5
    [HttpPut("{id:int}")]
    [Authorize(Roles = "Farmer")]
    public async Task<IActionResult> UpdateCrop(
        int id,
        UpdateCropDto dto)
    {
        var farmerId = GetCurrentUserId();

        if (farmerId is null)
        {
            return Unauthorized();
        }

        var crop = await _context.Crops
            .FirstOrDefaultAsync(crop =>
                crop.Id == id &&
                crop.FarmerId == farmerId.Value
            );

        if (crop is null)
        {
            return NotFound(new
            {
                message =
                    "Crop not found or you do not own this crop."
            });
        }

        crop.Name = dto.Name.Trim();
        crop.Category = dto.Category.Trim();
        crop.Description = dto.Description.Trim();
        crop.PricePerKg = dto.PricePerKg;
        crop.QuantityInKg = dto.QuantityInKg;
        crop.Location = dto.Location.Trim();

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Crop updated successfully.",

            crop = new
            {
                crop.Id,
                crop.Name,
                crop.Category,
                crop.Description,
                crop.PricePerKg,
                crop.QuantityInKg,
                crop.Location,
                crop.FarmerId,
                crop.CreatedAt
            }
        });
    }

    // DELETE: api/crops/5
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Farmer")]
    public async Task<IActionResult> DeleteCrop(int id)
    {
        var farmerId = GetCurrentUserId();

        if (farmerId is null)
        {
            return Unauthorized();
        }

        var crop = await _context.Crops
            .FirstOrDefaultAsync(crop =>
                crop.Id == id &&
                crop.FarmerId == farmerId.Value
            );

        if (crop is null)
        {
            return NotFound(new
            {
                message =
                    "Crop not found or you do not own this crop."
            });
        }

        _context.Crops.Remove(crop);

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