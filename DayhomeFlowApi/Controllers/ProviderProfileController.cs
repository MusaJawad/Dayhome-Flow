using System.Security.Claims;
using DayhomeFlowApi.Data;
using DayhomeFlowApi.Dtos;
using DayhomeFlowApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DayhomeFlowApi.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ProviderProfileController : ControllerBase
{
    private readonly DayhomeFlowContext _context;

    public ProviderProfileController(DayhomeFlowContext context)
    {
        _context = context;
    }

    private int GetCurrentUserId()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userIdClaim))
        {
            throw new UnauthorizedAccessException("User ID claim is missing.");
        }

        return int.Parse(userIdClaim);
    }

    private static ProviderProfileResponseDto ToResponseDto(ProviderProfile profile)
    {
        return new ProviderProfileResponseDto
        {
            Id = profile.Id,
            BusinessName = profile.BusinessName,
            ProviderName = profile.ProviderName,
            Email = profile.Email,
            Phone = profile.Phone
        };
    }

    [HttpGet("me")]
    public async Task<ActionResult<ProviderProfileResponseDto>> GetMyProfile()
    {
        var userId = GetCurrentUserId();

        var profile = await _context.ProviderProfiles
            .FirstOrDefaultAsync(p => p.UserId == userId);

        if (profile == null)
        {
            return NotFound(new { message = "Provider profile not found." });
        }

        return Ok(ToResponseDto(profile));
    }

    [HttpPut("me")]
    public async Task<ActionResult<ProviderProfileResponseDto>> UpdateMyProfile(
        UpdateProviderProfileDto updateDto)
    {
        var userId = GetCurrentUserId();

        var profile = await _context.ProviderProfiles
            .FirstOrDefaultAsync(p => p.UserId == userId);

        if (profile == null)
        {
            profile = new ProviderProfile
            {
                UserId = userId,
                BusinessName = updateDto.BusinessName,
                ProviderName = updateDto.ProviderName,
                Email = updateDto.Email,
                Phone = updateDto.Phone
            };

            _context.ProviderProfiles.Add(profile);
        }
        else
        {
            profile.BusinessName = updateDto.BusinessName;
            profile.ProviderName = updateDto.ProviderName;
            profile.Email = updateDto.Email;
            profile.Phone = updateDto.Phone;
        }

        await _context.SaveChangesAsync();

        return Ok(ToResponseDto(profile));
    }
}