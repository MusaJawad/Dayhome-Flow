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
public class ChildrenController : ControllerBase
{
    private readonly DayhomeFlowContext _context;

    public ChildrenController(DayhomeFlowContext context)
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

    private static ChildResponseDto ToResponseDto(Child child)
    {
        return new ChildResponseDto
        {
            Id = child.Id,
            FirstName = child.FirstName,
            LastName = child.LastName,
            ParentName = child.ParentName,
            ParentEmail = child.ParentEmail,
            ParentPhone = child.ParentPhone,
            DailyRate = child.DailyRate,
            IsActive = child.IsActive
        };
    }

    [HttpGet]
    public async Task<ActionResult<List<ChildResponseDto>>> GetAll()
    {
        var userId = GetCurrentUserId();

        var children = await _context.Children
            .Where(c => c.UserId == userId)
            .OrderBy(c => c.FirstName)
            .ThenBy(c => c.LastName)
            .ToListAsync();

        var response = children.Select(ToResponseDto).ToList();

        return Ok(response);
    }

    [HttpGet("active")]
    public async Task<ActionResult<List<ChildResponseDto>>> GetActive()
    {
        var userId = GetCurrentUserId();

        var children = await _context.Children
            .Where(c => c.UserId == userId && c.IsActive)
            .OrderBy(c => c.FirstName)
            .ThenBy(c => c.LastName)
            .ToListAsync();

        var response = children.Select(ToResponseDto).ToList();

        return Ok(response);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ChildResponseDto>> GetById(int id)
    {
        var userId = GetCurrentUserId();

        var child = await _context.Children
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

        if (child == null)
        {
            return NotFound();
        }

        return Ok(ToResponseDto(child));
    }

    [HttpPost]
    public async Task<ActionResult<ChildResponseDto>> Create(CreateChildDto createDto)
    {
        var userId = GetCurrentUserId();

        var child = new Child
        {
            UserId = userId,
            FirstName = createDto.FirstName,
            LastName = createDto.LastName,
            ParentName = createDto.ParentName,
            ParentEmail = createDto.ParentEmail,
            ParentPhone = createDto.ParentPhone,
            DailyRate = createDto.DailyRate,
            IsActive = true
        };

        _context.Children.Add(child);
        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetById),
            new { id = child.Id },
            ToResponseDto(child)
        );
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateChildDto updateDto)
    {
        var userId = GetCurrentUserId();

        var child = await _context.Children
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

        if (child == null)
        {
            return NotFound();
        }

        child.FirstName = updateDto.FirstName;
        child.LastName = updateDto.LastName;
        child.ParentName = updateDto.ParentName;
        child.ParentEmail = updateDto.ParentEmail;
        child.ParentPhone = updateDto.ParentPhone;
        child.DailyRate = updateDto.DailyRate;
        child.IsActive = updateDto.IsActive;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Deactivate(int id)
    {
        var userId = GetCurrentUserId();

        var child = await _context.Children
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

        if (child == null)
        {
            return NotFound();
        }

        child.IsActive = false;

        await _context.SaveChangesAsync();

        return NoContent();
    }
}