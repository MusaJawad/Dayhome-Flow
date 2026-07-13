using System.Globalization;
using System.Security.Claims;
using ClosedXML.Excel;
using DayhomeFlowApi.Data;
using DayhomeFlowApi.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DayhomeFlowApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class InvoicesController : ControllerBase
{
    private const int FirstChildRow = 7;
    private const int LastChildRow = 31;
    private const int FirstDayColumn = 3; // C
    private const int TotalHoursColumn = 34; // AH
    private const int ContractFeeColumn = 35; // AI
    private const int ParentNameStartRow = 34;
    private const int ParentNameMaxRows = 12;

    private readonly DayhomeFlowContext _context;
    private readonly IWebHostEnvironment _environment;

    public InvoicesController(DayhomeFlowContext context, IWebHostEnvironment environment)
    {
        _context = context;
        _environment = environment;
    }

    [HttpGet("preview")]
    public async Task<ActionResult<InvoicePreviewDto>> Preview(
        [FromQuery] int year,
        [FromQuery] int month)
    {
        var validationResult = ValidateMonthAndYear(year, month);

        if (validationResult != null)
        {
            return validationResult;
        }

        var userId = GetUserId();
        var preview = await BuildInvoicePreview(userId, year, month);

        return Ok(preview);
    }

    [HttpGet("export/excel")]
    public async Task<IActionResult> ExportExcel(
        [FromQuery] int year,
        [FromQuery] int month)
    {
        var validationResult = ValidateMonthAndYear(year, month);

        if (validationResult != null)
        {
            return validationResult;
        }

        var userId = GetUserId();
        var preview = await BuildInvoicePreview(userId, year, month);

        var providerProfile = await _context.ProviderProfiles
            .FirstOrDefaultAsync(p => p.UserId == userId);

        var templatePath = Path.Combine(
            _environment.ContentRootPath,
            "Templates",
            "EducatorInvoiceTemplate.xlsx");

        if (!System.IO.File.Exists(templatePath))
        {
            return NotFound("Excel template file was not found on the server.");
        }

        using var workbook = new XLWorkbook(templatePath);
        var worksheet = workbook.Worksheet("Educator Invoice - v3");

        FillHeader(worksheet, providerProfile, month, year);
        ClearMainInvoiceRows(worksheet);
        ClearParentNameRows(worksheet);
        ClearMoneyCells(worksheet);
        FillChildRows(worksheet, preview);
        FillParentNames(worksheet, preview);

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);

        var fileName = $"dayhomeflow-invoice-{year}-{month:D2}.xlsx";

        return File(
            stream.ToArray(),
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            fileName);
    }

    private async Task<InvoicePreviewDto> BuildInvoicePreview(int userId, int year, int month)
    {
        var daysInMonth = DateTime.DaysInMonth(year, month);

        var startDate = DateTime.SpecifyKind(new DateTime(year, month, 1), DateTimeKind.Utc);
        var endDate = startDate.AddMonths(1);

        var allChildren = await _context.Children
            .Where(c => c.UserId == userId)
            .OrderBy(c => c.FirstName)
            .ThenBy(c => c.LastName)
            .ToListAsync();

        var attendanceRecords = await _context.AttendanceRecords
            .Where(a =>
                a.UserId == userId &&
                a.Date >= startDate &&
                a.Date < endDate)
            .ToListAsync();

        var children = allChildren
            .Where(c => c.IsActive || attendanceRecords.Any(a => a.ChildId == c.Id))
            .ToList();

        var recordsByChild = attendanceRecords
            .GroupBy(a => a.ChildId)
            .ToDictionary(
                group => group.Key,
                group => group.ToDictionary(a => a.Date.Day));

        var preview = new InvoicePreviewDto
        {
            Year = year,
            Month = month,
            DaysInMonth = daysInMonth,
            Children = new List<InvoiceChildLineDto>()
        };

        foreach (var child in children)
        {
            var childLine = new InvoiceChildLineDto
            {
                ChildId = child.Id,
                ChildName = $"{child.FirstName} {child.LastName}".Trim(),
                ParentName = child.ParentName,
                Days = new List<InvoiceDayDto>(),
                TotalHours = 0m
            };

            recordsByChild.TryGetValue(child.Id, out var childRecords);

            for (var day = 1; day <= daysInMonth; day++)
            {
                var value = "x";

                if (childRecords != null && childRecords.TryGetValue(day, out var record))
                {
                    if (!record.WasPresent)
                    {
                        value = "a";
                    }
                    else
                    {
                        var hours = CalculateRoundedHours(record.DropOffTime, record.PickUpTime);

                        if (hours > 0)
                        {
                            childLine.TotalHours += hours;
                            value = FormatHours(hours);
                        }
                        else
                        {
                            value = "0";
                        }
                    }
                }

                childLine.Days.Add(new InvoiceDayDto
                {
                    Day = day,
                    Value = value
                });
            }

            childLine.TotalHours = RoundToQuarterHour(childLine.TotalHours);
            preview.Children.Add(childLine);
        }

        return preview;
    }

    private static decimal CalculateRoundedHours(TimeSpan? dropOffTime, TimeSpan? pickUpTime)
    {
        if (!dropOffTime.HasValue || !pickUpTime.HasValue)
        {
            return 0m;
        }

        var duration = pickUpTime.Value - dropOffTime.Value;

        if (duration <= TimeSpan.Zero)
        {
            return 0m;
        }

        var hours = (decimal)duration.TotalMinutes / 60m;

        return RoundToQuarterHour(hours);
    }

    private static decimal RoundToQuarterHour(decimal hours)
    {
        return Math.Round(hours * 4m, 0, MidpointRounding.AwayFromZero) / 4m;
    }

    private static string FormatHours(decimal hours)
    {
        if (hours == Math.Truncate(hours))
        {
            return hours.ToString("0", CultureInfo.InvariantCulture);
        }

        return hours.ToString("0.##", CultureInfo.InvariantCulture);
    }

    private void FillHeader(
        IXLWorksheet worksheet,
        DayhomeFlowApi.Models.ProviderProfile? providerProfile,
        int month,
        int year)
    {
        var monthName = CultureInfo.CurrentCulture.DateTimeFormat.GetMonthName(month);

        var providerName = providerProfile?.ProviderName;

        if (string.IsNullOrWhiteSpace(providerName))
        {
            providerName = providerProfile?.BusinessName;
        }

        if (string.IsNullOrWhiteSpace(providerName))
        {
            providerName = User.FindFirstValue(ClaimTypes.Email) ?? string.Empty;
        }

        worksheet.Cell("N1").Value = SanitizeExcelText(providerName);
        worksheet.Cell("N2").Value = monthName;
        worksheet.Cell("U2").Value = year;
        worksheet.Cell("N3").Value = SanitizeExcelText(providerProfile?.Phone);
    }

    private static void FillChildRows(IXLWorksheet worksheet, InvoicePreviewDto preview)
    {
        var row = FirstChildRow;

        foreach (var child in preview.Children)
        {
            if (row > LastChildRow)
            {
                break;
            }

            worksheet.Cell(row, 1).Value = SanitizeExcelText(child.ChildName);

            foreach (var day in child.Days)
            {
                var column = FirstDayColumn + day.Day - 1;
                SetDayCellValue(worksheet.Cell(row, column), day.Value);
            }

            worksheet.Cell(row, TotalHoursColumn).Value = child.TotalHours;
            worksheet.Cell(row, ContractFeeColumn).Clear(XLClearOptions.Contents);

            row++;
        }
    }

    private static void FillParentNames(IXLWorksheet worksheet, InvoicePreviewDto preview)
    {
        var parentNames = preview.Children
            .Select(c => c.ParentName)
            .Where(name => !string.IsNullOrWhiteSpace(name))
            .Select(name => name!.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .Take(ParentNameMaxRows)
            .ToList();

        for (var i = 0; i < parentNames.Count; i++)
        {
            worksheet.Cell(ParentNameStartRow + i, 1).Value = SanitizeExcelText(parentNames[i]);
        }
    }

    private static void ClearMainInvoiceRows(IXLWorksheet worksheet)
    {
        for (var row = FirstChildRow; row <= LastChildRow; row++)
        {
            worksheet.Cell(row, 1).Clear(XLClearOptions.Contents);

            for (var column = FirstDayColumn; column <= ContractFeeColumn; column++)
            {
                worksheet.Cell(row, column).Clear(XLClearOptions.Contents);
            }
        }
    }

    private static void ClearParentNameRows(IXLWorksheet worksheet)
    {
        for (var i = 0; i < ParentNameMaxRows; i++)
        {
            worksheet.Cell(ParentNameStartRow + i, 1).Clear(XLClearOptions.Contents);
        }
    }

    private static void ClearMoneyCells(IXLWorksheet worksheet)
    {
        var cellsToClear = new[]
        {
            "AI33",
            "AI34",
            "AI35",
            "AI36",
            "AI37",
            "AI42",
            "AI43",
            "AI46"
        };

        foreach (var cellAddress in cellsToClear)
        {
            worksheet.Cell(cellAddress).Clear(XLClearOptions.Contents);
        }
    }

    private static void SetDayCellValue(IXLCell cell, string value)
    {
        if (decimal.TryParse(
                value,
                NumberStyles.Number,
                CultureInfo.InvariantCulture,
                out var numericValue))
        {
            cell.Value = numericValue;
            return;
        }

        cell.Value = value;
    }

    private ActionResult? ValidateMonthAndYear(int year, int month)
    {
        if (month < 1 || month > 12)
        {
            return BadRequest("Month must be between 1 and 12.");
        }

        if (year < 2000 || year > 2100)
        {
            return BadRequest("Year is invalid.");
        }

        return null;
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

    private static string SanitizeExcelText(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return string.Empty;
        }

        var trimmed = value.Trim();

        if (
            trimmed.StartsWith("=") ||
            trimmed.StartsWith("+") ||
            trimmed.StartsWith("-") ||
            trimmed.StartsWith("@"))
        {
            return "'" + trimmed;
        }

        return trimmed;
    }
}