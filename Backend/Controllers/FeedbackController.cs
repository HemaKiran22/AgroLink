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
public class FeedbackController : ControllerBase
{
    private readonly AppDbContext _context;

    public FeedbackController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/feedback
    [HttpGet]
    public async Task<IActionResult> GetFeedback()
    {
        var feedback = await _context.Feedbacks
            .AsNoTracking()
            .OrderByDescending(item => item.CreatedAt)
            .Select(item => new
            {
                item.Id,
                item.UserId,
                UserName = item.User.Name,
                UserRole = item.User.Role,
                item.Rating,
                item.Comment,
                item.CreatedAt
            })
            .ToListAsync();

        return Ok(feedback);
    }

    // GET: api/feedback/my-feedback
    [HttpGet("my-feedback")]
    public async Task<IActionResult> GetMyFeedback()
    {
        var userId = GetCurrentUserId();

        if (userId is null)
        {
            return Unauthorized();
        }

        var feedback = await _context.Feedbacks
            .AsNoTracking()
            .Where(item => item.UserId == userId.Value)
            .OrderByDescending(item => item.CreatedAt)
            .Select(item => new
            {
                item.Id,
                item.Rating,
                item.Comment,
                item.CreatedAt
            })
            .ToListAsync();

        return Ok(feedback);
    }

    // POST: api/feedback
    [HttpPost]
    public async Task<ActionResult<Feedback>>
        CreateFeedback(CreateFeedbackDto dto)
    {
        var userId = GetCurrentUserId();

        if (userId is null)
        {
            return Unauthorized();
        }

        var feedback = new Feedback
        {
            UserId = userId.Value,
            Rating = dto.Rating,
            Comment = dto.Comment.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        _context.Feedbacks.Add(feedback);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Feedback submitted successfully.",

            feedback = new
            {
                feedback.Id,
                feedback.UserId,
                feedback.Rating,
                feedback.Comment,
                feedback.CreatedAt
            }
        });
    }

    // DELETE: api/feedback/5
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteFeedback(int id)
    {
        var userId = GetCurrentUserId();

        if (userId is null)
        {
            return Unauthorized();
        }

        var feedback = await _context.Feedbacks
            .FirstOrDefaultAsync(item =>
                item.Id == id &&
                item.UserId == userId.Value
            );

        if (feedback is null)
        {
            return NotFound(new
            {
                message =
                    "Feedback not found or you do not own it."
            });
        }

        _context.Feedbacks.Remove(feedback);

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