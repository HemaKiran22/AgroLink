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
public class ProductRequestsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProductRequestsController(AppDbContext context)
    {
        _context = context;
    }


    // =============================================
    // CREATE PRODUCT REQUEST (Farmer only)
    // POST: api/productrequests
    //
    // Stock is only CHECKED here, not reduced.
    // Stock is reduced when the seller approves.
    // =============================================

    [HttpPost]
    [Authorize(Roles = "Farmer")]
    public async Task<IActionResult> CreateRequest(CreateProductRequestDto dto)
    {
        var farmerId = GetCurrentUserId();

        if (farmerId is null)
        {
            return Unauthorized(new { message = "Invalid user." });
        }

        if (dto.Quantity <= 0)
        {
            return BadRequest(new { message = "Quantity must be at least 1." });
        }

        var agrochemical = await _context.Agrochemicals
            .AsNoTracking()
            .FirstOrDefaultAsync(product => product.Id == dto.AgrochemicalId);

        if (agrochemical is null)
        {
            return NotFound(new { message = "Agrochemical not found." });
        }

        if (agrochemical.StockQuantity <= 0)
        {
            return BadRequest(new { message = "This product is currently out of stock." });
        }

        if (dto.Quantity > agrochemical.StockQuantity)
        {
            return BadRequest(new
            {
                message = $"Only {agrochemical.StockQuantity} items are available."
            });
        }

        var productRequest = new ProductRequest
        {
            FarmerId = farmerId.Value,
            AgrochemicalId = dto.AgrochemicalId,
            Quantity = dto.Quantity,
            Message = dto.Message?.Trim() ?? string.Empty,
            Status = "Pending",
            RequestedAt = DateTime.UtcNow
        };

        _context.ProductRequests.Add(productRequest);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Product request created successfully.",
            request = new
            {
                productRequest.Id,
                productRequest.FarmerId,
                productRequest.AgrochemicalId,
                AgrochemicalName = agrochemical.Name,
                productRequest.Quantity,
                productRequest.Message,
                productRequest.Status,
                productRequest.RequestedAt
            }
        });
    }


    // =============================================
    // GET FARMER'S OWN REQUESTS
    // GET: api/productrequests/my-requests
    // =============================================

    [HttpGet("my-requests")]
    [Authorize(Roles = "Farmer")]
    public async Task<IActionResult> GetMyRequests()
    {
        var farmerId = GetCurrentUserId();

        if (farmerId is null)
        {
            return Unauthorized();
        }

        var requests = await _context.ProductRequests
            .AsNoTracking()
            .Where(request => request.FarmerId == farmerId.Value)
            .OrderByDescending(request => request.RequestedAt)
            .Select(request => new
            {
                request.Id,
                request.AgrochemicalId,
                AgrochemicalName = request.Agrochemical.Name,
                ProductPrice = request.Agrochemical.Price,
                SellerName = request.Agrochemical.Seller.Name,
                request.Quantity,
                request.Message,
                request.Status,
                request.RequestedAt
            })
            .ToListAsync();

        return Ok(requests);
    }


    // =============================================
    // GET REQUESTS FOR SELLER'S PRODUCTS
    // GET: api/productrequests/seller-requests
    // =============================================

    [HttpGet("seller-requests")]
    [Authorize(Roles = "Seller")]
    public async Task<IActionResult> GetSellerRequests()
    {
        var sellerId = GetCurrentUserId();

        if (sellerId is null)
        {
            return Unauthorized();
        }

        var requests = await _context.ProductRequests
            .AsNoTracking()
            .Where(request => request.Agrochemical.SellerId == sellerId.Value)
            .OrderByDescending(request => request.RequestedAt)
            .Select(request => new
            {
                request.Id,
                request.FarmerId,
                FarmerName = request.Farmer.Name,
                request.AgrochemicalId,
                AgrochemicalName = request.Agrochemical.Name,
                request.Quantity,
                request.Message,
                request.Status,
                request.RequestedAt
            })
            .ToListAsync();

        return Ok(requests);
    }


    // =============================================
    // UPDATE REQUEST STATUS (Seller only)
    // PUT: api/productrequests/5/status
    //
    // Pending  → Approved   (stock is reduced)
    // Pending  → Rejected   (stock unchanged)
    // Approved → Completed  (stock unchanged, already reduced)
    //
    // Rejected / Completed are final.
    // =============================================

    [HttpPut("{id:int}/status")]
    [Authorize(Roles = "Seller")]
    public async Task<IActionResult> UpdateRequestStatus(int id, UpdateRequestStatusDto dto)
    {
        var sellerId = GetCurrentUserId();

        if (sellerId is null)
        {
            return Unauthorized(new { message = "Invalid seller identity." });
        }

        var newStatus = NormalizeStatus(dto.Status);

        if (newStatus is null)
        {
            return BadRequest(new
            {
                message = "Status must be Approved, Rejected or Completed."
            });
        }

        // Load the request together with its product (tracked, so stock changes are saved)
        var request = await _context.ProductRequests
            .Include(request => request.Agrochemical)
            .FirstOrDefaultAsync(request =>
                request.Id == id &&
                request.Agrochemical.SellerId == sellerId.Value);

        if (request is null)
        {
            return NotFound(new
            {
                message = "Request not found or this request does not belong to your product."
            });
        }

        var validTransition =
            (request.Status == "Pending" &&
                (newStatus == "Approved" || newStatus == "Rejected"))
            ||
            (request.Status == "Approved" && newStatus == "Completed");

        if (!validTransition)
        {
            return BadRequest(new
            {
                message = $"Cannot change request status from {request.Status} to {newStatus}."
            });
        }

        var product = request.Agrochemical;

        // ---------- STOCK RULE: reduce stock on approval ----------
        if (newStatus == "Approved")
        {
            if (product.StockQuantity < request.Quantity)
            {
                return BadRequest(new
                {
                    message = $"Only {product.StockQuantity} units in stock. " +
                              $"Cannot approve {request.Quantity}."
                });
            }

            product.StockQuantity -= request.Quantity;
        }

        request.Status = newStatus;

        // Status and stock are saved together in one transaction
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = $"Request status changed to {newStatus}.",
            remainingStock = product.StockQuantity,
            request = new
            {
                request.Id,
                request.FarmerId,
                request.AgrochemicalId,
                request.Quantity,
                request.Message,
                request.Status,
                request.RequestedAt
            }
        });
    }


    // =============================================
    // DELETE PRODUCT REQUEST (Farmer only)
    // Only Pending requests can be deleted.
    // DELETE: api/productrequests/5
    // =============================================

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Farmer")]
    public async Task<IActionResult> DeleteRequest(int id)
    {
        var farmerId = GetCurrentUserId();

        if (farmerId is null)
        {
            return Unauthorized();
        }

        var request = await _context.ProductRequests
            .FirstOrDefaultAsync(request =>
                request.Id == id &&
                request.FarmerId == farmerId.Value);

        if (request is null)
        {
            return NotFound(new
            {
                message = "Request not found or you do not own this request."
            });
        }

        if (request.Status != "Pending")
        {
            return BadRequest(new { message = "Only Pending requests can be deleted." });
        }

        _context.ProductRequests.Remove(request);
        await _context.SaveChangesAsync();

        return NoContent();
    }


    // =============================================
    // HELPERS
    // =============================================

    private int? GetCurrentUserId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier);

        return int.TryParse(value, out var userId) ? userId : null;
    }

    private static string? NormalizeStatus(string status)
    {
        if (string.IsNullOrWhiteSpace(status))
        {
            return null;
        }

        if (status.Equals("Approved", StringComparison.OrdinalIgnoreCase))
        {
            return "Approved";
        }

        if (status.Equals("Rejected", StringComparison.OrdinalIgnoreCase))
        {
            return "Rejected";
        }

        if (status.Equals("Completed", StringComparison.OrdinalIgnoreCase))
        {
            return "Completed";
        }

        return null;
    }
}