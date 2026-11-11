using System.ComponentModel.DataAnnotations;

namespace AgroLinkAPI.Models;

public class User
{
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [MaxLength(150)]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    public string Role { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Crop> Crops { get; set; }
        = new List<Crop>();

    public ICollection<Agrochemical> Agrochemicals { get; set; }
        = new List<Agrochemical>();

    public ICollection<ProductRequest> ProductRequests { get; set; }
        = new List<ProductRequest>();

    public ICollection<Feedback> Feedbacks { get; set; }
        = new List<Feedback>();
}