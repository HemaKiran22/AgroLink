using System.ComponentModel.DataAnnotations;

namespace AgroLinkAPI.DTOs;

public class RegisterDto
{
    // Letters, _ and - only. Single spaces between words. At least one letter.
    [Required(ErrorMessage = "Full name is required.")]
    [StringLength(100, MinimumLength = 2,
        ErrorMessage = "Name must be between 2 and 100 characters.")]
    [RegularExpression(
        @"^(?=.*[A-Za-z])[A-Za-z_-]+( [A-Za-z_-]+)*$",
        ErrorMessage = "Name can contain only letters, _ and -, with single spaces between words.")]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "Email is required.")]
    [EmailAddress(ErrorMessage = "Enter a valid email address.")]
    [MaxLength(150, ErrorMessage = "Email cannot be longer than 150 characters.")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Password is required.")]
    [MinLength(6, ErrorMessage = "Password must contain at least 6 characters.")]
    public string Password { get; set; } = string.Empty;

    // Only Farmer or Seller can register (Admin cannot be chosen from the form)
    [Required(ErrorMessage = "Role is required.")]
    [RegularExpression("^(Farmer|Seller)$",
        ErrorMessage = "Role must be Farmer or Seller.")]
    public string Role { get; set; } = string.Empty;
}