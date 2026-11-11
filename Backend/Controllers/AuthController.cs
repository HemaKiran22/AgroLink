using System.Security.Claims;
using AgroLinkAPI.Data;
using AgroLinkAPI.DTOs;
using AgroLinkAPI.Models;
using AgroLinkAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AgroLinkAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IPasswordHasher<User> _passwordHasher;
    private readonly TokenService _tokenService;

    public AuthController(
        AppDbContext context,
        IPasswordHasher<User> passwordHasher,
        TokenService tokenService)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _tokenService = tokenService;
    }

    // POST: api/auth/register
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        var name = dto.Name.Trim();

        var email = dto.Email
            .Trim()
            .ToLowerInvariant();

        var role = NormalizeRole(dto.Role);

        if (string.IsNullOrWhiteSpace(name))
        {
            return BadRequest(new
            {
                message = "Name is required."
            });
        }

        if (role is null)
        {
            return BadRequest(new
            {
                message = "Role must be Farmer or Seller."
            });
        }

        var emailExists = await _context.Users
            .AnyAsync(user => user.Email == email);

        if (emailExists)
        {
            return Conflict(new
            {
                message = "An account with this email already exists."
            });
        }

        var user = new User
        {
            Name = name,
            Email = email,
            Role = role,
            CreatedAt = DateTime.UtcNow
        };

        user.PasswordHash = _passwordHasher.HashPassword(
            user,
            dto.Password
        );

        _context.Users.Add(user);

        await _context.SaveChangesAsync();

        var token = _tokenService.CreateToken(user);

        return Ok(new
        {
            message = "Registration successful.",

            token,

            user = new
            {
                user.Id,
                user.Name,
                user.Email,
                user.Role,
                user.CreatedAt
            }
        });
    }

    // POST: api/auth/login
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var email = dto.Email
            .Trim()
            .ToLowerInvariant();

        var user = await _context.Users
            .FirstOrDefaultAsync(user => user.Email == email);

        if (user is null)
        {
            return Unauthorized(new
            {
                message = "Invalid email or password."
            });
        }

        var verificationResult =
            _passwordHasher.VerifyHashedPassword(
                user,
                user.PasswordHash,
                dto.Password
            );

        if (verificationResult ==
            PasswordVerificationResult.Failed)
        {
            return Unauthorized(new
            {
                message = "Invalid email or password."
            });
        }

        if (verificationResult ==
            PasswordVerificationResult.SuccessRehashNeeded)
        {
            user.PasswordHash = _passwordHasher.HashPassword(
                user,
                dto.Password
            );

            await _context.SaveChangesAsync();
        }

        var token = _tokenService.CreateToken(user);

        return Ok(new
        {
            message = "Login successful.",

            token,

            user = new
            {
                user.Id,
                user.Name,
                user.Email,
                user.Role
            }
        });
    }

    // GET: api/auth/me
    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userId = GetCurrentUserId();

        if (userId is null)
        {
            return Unauthorized(new
            {
                message = "Invalid user identity."
            });
        }

        var user = await _context.Users
            .AsNoTracking()
            .Where(user => user.Id == userId.Value)
            .Select(user => new
            {
                user.Id,
                user.Name,
                user.Email,
                user.Role,
                user.CreatedAt
            })
            .FirstOrDefaultAsync();

        if (user is null)
        {
            return Unauthorized(new
            {
                message = "User account was not found."
            });
        }

        return Ok(user);
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

    private static string? NormalizeRole(string role)
    {
        if (role.Equals(
            "Farmer",
            StringComparison.OrdinalIgnoreCase))
        {
            return "Farmer";
        }

        if (role.Equals(
            "Seller",
            StringComparison.OrdinalIgnoreCase))
        {
            return "Seller";
        }

        return null;
    }
}