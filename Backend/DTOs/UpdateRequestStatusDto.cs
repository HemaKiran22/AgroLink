using System.ComponentModel.DataAnnotations;

namespace AgroLinkAPI.DTOs;

public class UpdateRequestStatusDto
{
    [Required]
    public string Status { get; set; } = string.Empty;
}