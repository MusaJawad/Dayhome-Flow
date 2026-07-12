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
public class AttendanceController : ControllerBase
{
    private readonly DayhomeFlowContext _context;

    public AttendanceController(DayhomeFlowContext context)
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

    private static AttendanceResponseDto ToResponseDto(AttendanceRecord record)
    {
        return new AttendanceResponseDto
        {
            Id = record.Id,
            ChildId = record.ChildId,
            ChildName = record.Child == null
                ? string.Empty
                : $"{record.Child.FirstName} {record.Child.LastName}",
            Date = record.Date,
            WasPresent = record.WasPresent,
            DropOffTime = record.DropOffTime,
            PickUpTime = record.PickUpTime,
            Notes = record.Notes
        };
    }

    [HttpGet]
    public async Task<ActionResult<List<AttendanceResponseDto>>> GetAll()
    {
        var userId = GetCurrentUserId();

        var records = await _context.AttendanceRecords
            .Include(a => a.Child)
            .Where(a => a.UserId == userId)
            .OrderByDescending(a => a.Date)
            .ToListAsync();

        var response = records.Select(ToResponseDto).ToList();

        return Ok(response);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<AttendanceResponseDto>> GetById(int id)
    {
        var userId = GetCurrentUserId();

        var record = await _context.AttendanceRecords
            .Include(a => a.Child)
            .FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);

        if (record == null)
        {
            return NotFound();
        }

        return Ok(ToResponseDto(record));
    }

    [HttpGet("child/{childId}")]
    public async Task<ActionResult<List<AttendanceResponseDto>>> GetByChild(int childId)
    {
        var userId = GetCurrentUserId();

        var childExists = await _context.Children
            .AnyAsync(c => c.Id == childId && c.UserId == userId);

        if (!childExists)
        {
            return NotFound(new { message = "Child not found." });
        }

        var records = await _context.AttendanceRecords
            .Include(a => a.Child)
            .Where(a => a.UserId == userId && a.ChildId == childId)
            .OrderByDescending(a => a.Date)
            .ToListAsync();

        var response = records.Select(ToResponseDto).ToList();

        return Ok(response);
    }

    [HttpGet("monthly")]
    public async Task<ActionResult<List<AttendanceResponseDto>>> GetMonthly(
        [FromQuery] int year,
        [FromQuery] int month,
        [FromQuery] int? childId)
    {
        var userId = GetCurrentUserId();

        if (month < 1 || month > 12)
        {
            return BadRequest(new { message = "Month must be between 1 and 12." });
        }

        var query = _context.AttendanceRecords
            .Include(a => a.Child)
            .Where(a =>
                a.UserId == userId &&
                a.Date.Year == year &&
                a.Date.Month == month);

        if (childId.HasValue)
        {
            var childExists = await _context.Children
                .AnyAsync(c => c.Id == childId.Value && c.UserId == userId);

            if (!childExists)
            {
                return NotFound(new { message = "Child not found." });
            }

            query = query.Where(a => a.ChildId == childId.Value);
        }

        var records = await query
            .OrderBy(a => a.Date)
            .ToListAsync();

        var response = records.Select(ToResponseDto).ToList();

        return Ok(response);
    }

    [HttpPost]
    public async Task<ActionResult<AttendanceResponseDto>> Create(CreateAttendanceDto createDto)
    {
        var userId = GetCurrentUserId();

        var child = await _context.Children
            .FirstOrDefaultAsync(c => c.Id == createDto.ChildId && c.UserId == userId);

        if (child == null)
        {
            return NotFound(new { message = "Child not found." });
        }

        if (!child.IsActive)
        {
            return BadRequest(new { message = "Cannot add attendance for an inactive child." });
        }

        var dateOnly = createDto.Date.Date;

        var duplicateExists = await _context.AttendanceRecords
            .AnyAsync(a =>
                a.UserId == userId &&
                a.ChildId == createDto.ChildId &&
                a.Date.Date == dateOnly);

        if (duplicateExists)
        {
            return BadRequest(new { message = "Attendance record already exists for this child on this date." });
        }

        var record = new AttendanceRecord
        {
            UserId = userId,
            ChildId = createDto.ChildId,
            Date = dateOnly,
            WasPresent = createDto.WasPresent,
            DropOffTime = createDto.DropOffTime,
            PickUpTime = createDto.PickUpTime,
            Notes = createDto.Notes
        };

        _context.AttendanceRecords.Add(record);
        await _context.SaveChangesAsync();

        record.Child = child;

        return CreatedAtAction(
            nameof(GetById),
            new { id = record.Id },
            ToResponseDto(record)
        );
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateAttendanceDto updateDto)
    {
        var userId = GetCurrentUserId();

        var record = await _context.AttendanceRecords
            .FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);

        if (record == null)
        {
            return NotFound();
        }

        var dateOnly = updateDto.Date.Date;

        var duplicateExists = await _context.AttendanceRecords
            .AnyAsync(a =>
                a.Id != id &&
                a.UserId == userId &&
                a.ChildId == record.ChildId &&
                a.Date.Date == dateOnly);

        if (duplicateExists)
        {
            return BadRequest(new { message = "Another attendance record already exists for this child on this date." });
        }

        record.Date = dateOnly;
        record.WasPresent = updateDto.WasPresent;
        record.DropOffTime = updateDto.DropOffTime;
        record.PickUpTime = updateDto.PickUpTime;
        record.Notes = updateDto.Notes;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = GetCurrentUserId();

        var record = await _context.AttendanceRecords
            .FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);

        if (record == null)
        {
            return NotFound();
        }

        _context.AttendanceRecords.Remove(record);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}