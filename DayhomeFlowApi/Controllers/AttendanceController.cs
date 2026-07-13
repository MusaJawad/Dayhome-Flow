using System.Security.Claims;
using DayhomeFlowApi.Data;
using DayhomeFlowApi.Dtos;
using DayhomeFlowApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DayhomeFlowApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AttendanceController : ControllerBase
{
    private readonly DayhomeFlowContext _context;

    public AttendanceController(DayhomeFlowContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<AttendanceResponseDto>>> GetAll()
    {
        var userId = GetUserId();

        var records = await _context.AttendanceRecords
            .Include(a => a.Child)
            .Where(a => a.UserId == userId)
            .OrderByDescending(a => a.Date)
            .ThenBy(a => a.Child!.FirstName)
            .ThenBy(a => a.Child!.LastName)
            .Select(a => ToResponseDto(a))
            .ToListAsync();

        return Ok(records);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<AttendanceResponseDto>> GetById(int id)
    {
        var userId = GetUserId();

        var record = await _context.AttendanceRecords
            .Include(a => a.Child)
            .FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);

        if (record == null)
        {
            return NotFound("Attendance record not found.");
        }

        return Ok(ToResponseDto(record));
    }

    [HttpGet("child/{childId:int}")]
    public async Task<ActionResult<List<AttendanceResponseDto>>> GetByChild(int childId)
    {
        var userId = GetUserId();

        var childExists = await _context.Children
            .AnyAsync(c => c.Id == childId && c.UserId == userId);

        if (!childExists)
        {
            return NotFound("Child not found.");
        }

        var records = await _context.AttendanceRecords
            .Include(a => a.Child)
            .Where(a => a.UserId == userId && a.ChildId == childId)
            .OrderByDescending(a => a.Date)
            .Select(a => ToResponseDto(a))
            .ToListAsync();

        return Ok(records);
    }

    [HttpGet("monthly")]
    public async Task<ActionResult<List<AttendanceResponseDto>>> GetMonthly(
        [FromQuery] int year,
        [FromQuery] int month)
    {
        return await GetMonthlyRecords(year, month);
    }

    [HttpGet("monthly/{year:int}/{month:int}")]
    public async Task<ActionResult<List<AttendanceResponseDto>>> GetMonthlyByRoute(
        int year,
        int month)
    {
        return await GetMonthlyRecords(year, month);
    }

    [HttpPost]
    public async Task<ActionResult<AttendanceResponseDto>> Create(CreateAttendanceDto dto)
    {
        var userId = GetUserId();
        var attendanceDate = AsUtcDate(dto.Date);

        var child = await _context.Children
            .FirstOrDefaultAsync(c => c.Id == dto.ChildId && c.UserId == userId);

        if (child == null)
        {
            return NotFound("Child not found.");
        }

        var duplicateExists = await _context.AttendanceRecords.AnyAsync(a =>
            a.UserId == userId &&
            a.ChildId == dto.ChildId &&
            a.Date == attendanceDate);

        if (duplicateExists)
        {
            return BadRequest("Attendance has already been recorded for this child on this date.");
        }

        var record = new AttendanceRecord
        {
            UserId = userId,
            ChildId = dto.ChildId,
            Date = attendanceDate,
            WasPresent = dto.WasPresent,
            DropOffTime = dto.DropOffTime,
            PickUpTime = dto.PickUpTime,
            Notes = dto.Notes
        };

        _context.AttendanceRecords.Add(record);
        await _context.SaveChangesAsync();

        record.Child = child;

        return CreatedAtAction(nameof(GetById), new { id = record.Id }, ToResponseDto(record));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<AttendanceResponseDto>> Update(int id, UpdateAttendanceDto dto)
    {
        var userId = GetUserId();
        var attendanceDate = AsUtcDate(dto.Date);

        var record = await _context.AttendanceRecords
            .Include(a => a.Child)
            .FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);

        if (record == null)
        {
            return NotFound("Attendance record not found.");
        }

        var child = await _context.Children
            .FirstOrDefaultAsync(c => c.Id == dto.ChildId && c.UserId == userId);

        if (child == null)
        {
            return NotFound("Child not found.");
        }

        var duplicateExists = await _context.AttendanceRecords.AnyAsync(a =>
            a.Id != id &&
            a.UserId == userId &&
            a.ChildId == dto.ChildId &&
            a.Date == attendanceDate);

        if (duplicateExists)
        {
            return BadRequest("Attendance has already been recorded for this child on this date.");
        }

        record.ChildId = dto.ChildId;
        record.Date = attendanceDate;
        record.WasPresent = dto.WasPresent;
        record.DropOffTime = dto.DropOffTime;
        record.PickUpTime = dto.PickUpTime;
        record.Notes = dto.Notes;

        await _context.SaveChangesAsync();

        record.Child = child;

        return Ok(ToResponseDto(record));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = GetUserId();

        var record = await _context.AttendanceRecords
            .FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);

        if (record == null)
        {
            return NotFound("Attendance record not found.");
        }

        _context.AttendanceRecords.Remove(record);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private async Task<ActionResult<List<AttendanceResponseDto>>> GetMonthlyRecords(int year, int month)
    {
        if (month < 1 || month > 12)
        {
            return BadRequest("Month must be between 1 and 12.");
        }

        if (year < 2000 || year > 2100)
        {
            return BadRequest("Year is invalid.");
        }

        var userId = GetUserId();

        var startDate = DateTime.SpecifyKind(new DateTime(year, month, 1), DateTimeKind.Utc);
        var endDate = startDate.AddMonths(1);

        var records = await _context.AttendanceRecords
            .Include(a => a.Child)
            .Where(a =>
                a.UserId == userId &&
                a.Date >= startDate &&
                a.Date < endDate)
            .OrderBy(a => a.Date)
            .ThenBy(a => a.Child!.FirstName)
            .ThenBy(a => a.Child!.LastName)
            .Select(a => ToResponseDto(a))
            .ToListAsync();

        return Ok(records);
    }

    private int GetUserId()
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userIdValue))
        {
            throw new UnauthorizedAccessException("User ID claim is missing.");
        }

        return int.Parse(userIdValue);
    }

    private static DateTime AsUtcDate(DateTime date)
    {
        return DateTime.SpecifyKind(date.Date, DateTimeKind.Utc);
    }

    private static AttendanceResponseDto ToResponseDto(AttendanceRecord record)
    {
        return new AttendanceResponseDto
        {
            Id = record.Id,
            ChildId = record.ChildId,
            ChildName = record.Child == null
                ? string.Empty
                : $"{record.Child.FirstName} {record.Child.LastName}".Trim(),
            Date = record.Date,
            WasPresent = record.WasPresent,
            DropOffTime = record.DropOffTime,
            PickUpTime = record.PickUpTime,
            Notes = record.Notes
        };
    }
}