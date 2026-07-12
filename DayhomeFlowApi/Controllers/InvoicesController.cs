using System.Globalization;
using System.Security.Claims;
using ClosedXML.Excel;
using DayhomeFlowApi.Data;
using DayhomeFlowApi.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DayhomeFlowApi.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class InvoicesController : ControllerBase
{
    private readonly DayhomeFlowContext _context;
    private readonly IWebHostEnvironment _environment;

    public InvoicesController(DayhomeFlowContext context, IWebHostEnvironment environment)
    {
        _context = context;
        _environment = environment;
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

    private static decimal RoundToNearestQuarter(decimal hours)
    {
        return Math.Round(hours * 4, MidpointRounding.AwayFromZero) / 4;
    }

    private static decimal CalculateHours(TimeSpan? dropOffTime, TimeSpan? pickUpTime)
    {
        if (dropOffTime == null || pickUpTime == null)
        {
            return 0;
        }

        var duration = pickUpTime.Value - dropOffTime.Value;

        if (duration.TotalMinutes <= 0)
        {
            return 0;
        }

        return RoundToNearestQuarter((decimal)duration.TotalHours);
    }

    private async Task<InvoicePreviewDto> BuildInvoicePreview(int userId, int year, int month)
    {
        var daysInMonth = DateTime.DaysInMonth(year, month);

        var startDate = new DateTime(year, month, 1);
        var endDate = startDate.AddMonths(1);

        var children = await _context.Children
            .Where(c => c.UserId == userId && c.IsActive)
            .OrderBy(c => c.FirstName)
            .ThenBy(c => c.LastName)
            .ToListAsync();

        var attendanceRecords = await _context.AttendanceRecords
            .Where(a =>
                a.UserId == userId &&
                a.Date >= startDate &&
                a.Date < endDate)
            .ToListAsync();

        var invoiceLines = new List<InvoiceChildLineDto>();

        foreach (var child in children)
        {
            var childRecords = attendanceRecords
                .Where(a => a.ChildId == child.Id)
                .ToList();

            var dayDtos = new List<InvoiceDayDto>();
            decimal totalHours = 0;

            for (int day = 1; day <= daysInMonth; day++)
            {
                var record = childRecords.FirstOrDefault(a => a.Date.Day == day);

                string value = "x";

                if (record != null)
                {
                    if (!record.WasPresent)
                    {
                        value = "a";
                    }
                    else
                    {
                        var hours = CalculateHours(record.DropOffTime, record.PickUpTime);

                        if (hours > 0)
                        {
                            value = hours.ToString("0.##", CultureInfo.InvariantCulture);
                            totalHours += hours;
                        }
                        else
                        {
                            value = "0";
                        }
                    }
                }

                dayDtos.Add(new InvoiceDayDto
                {
                    Day = day,
                    Value = value
                });
            }

            invoiceLines.Add(new InvoiceChildLineDto
            {
                ChildId = child.Id,
                ChildName = $"{child.FirstName} {child.LastName}",
                ParentName = child.ParentName,
                Days = dayDtos,
                TotalHours = totalHours
            });
        }

        return new InvoicePreviewDto
        {
            Month = month,
            Year = year,
            DaysInMonth = daysInMonth,
            Children = invoiceLines
        };
    }

    [HttpGet("preview")]
    public async Task<ActionResult<InvoicePreviewDto>> Preview(
        [FromQuery] int year,
        [FromQuery] int month)
    {
        var userId = GetCurrentUserId();

        if (month < 1 || month > 12)
        {
            return BadRequest(new { message = "Month must be between 1 and 12." });
        }

        var preview = await BuildInvoicePreview(userId, year, month);

        return Ok(preview);
    }

    [HttpGet("export/excel")]
    public async Task<IActionResult> ExportExcel(
        [FromQuery] int year,
        [FromQuery] int month)
    {
        var userId = GetCurrentUserId();

        if (month < 1 || month > 12)
        {
            return BadRequest(new { message = "Month must be between 1 and 12." });
        }

        var preview = await BuildInvoicePreview(userId, year, month);

        if (preview.Children.Count > 13)
        {
            return BadRequest(new
            {
                message = "The current Excel template supports up to 13 children in the main invoice section."
            });
        }

        var providerProfile = await _context.ProviderProfiles
            .FirstOrDefaultAsync(p => p.UserId == userId);

        var templatePath = Path.Combine(
            _environment.ContentRootPath,
            "Templates",
            "EducatorInvoiceTemplate.xlsx"
        );

        if (!System.IO.File.Exists(templatePath))
        {
            return NotFound(new
            {
                message = "Excel template file was not found. Place it in Templates/EducatorInvoiceTemplate.xlsx."
            });
        }

        using var workbook = new XLWorkbook(templatePath);
        var worksheet = workbook.Worksheet("Educator Invoice - v3");

        var monthName = CultureInfo.CurrentCulture.DateTimeFormat.GetMonthName(month);

        // Top invoice info
        worksheet.Cell("N1").Value = providerProfile?.ProviderName ?? "";
        worksheet.Cell("N2").Value = monthName;
        worksheet.Cell("U2").Value = year;
        worksheet.Cell("N3").Value = providerProfile?.Phone ?? "";

        ClearMainInvoiceRows(worksheet);
        ClearParentNameRows(worksheet);

        var startRow = 7;

        for (int i = 0; i < preview.Children.Count; i++)
        {
            var row = startRow + i;
            var child = preview.Children[i];

            // Child name column
            worksheet.Cell(row, 1).Value = child.ChildName;

            // Day columns: day 1 starts at column C, so day + 2
            for (int day = 1; day <= 31; day++)
            {
                var cell = worksheet.Cell(row, day + 2);

                if (day > preview.DaysInMonth)
                {
                    cell.Clear(XLClearOptions.Contents);
                    continue;
                }

                var dayValue = child.Days.FirstOrDefault(d => d.Day == day)?.Value ?? "x";
                SetDayCellValue(cell, dayValue);
            }

            // Total Hours column
            worksheet.Cell(row, 34).Value = child.TotalHours;

            // Contract Fee column is intentionally left blank.
            worksheet.Cell(row, 35).Clear(XLClearOptions.Contents);
        }

        // Parent names section.
        // Same parent only appears once, even if they have multiple children.
        var uniqueParentNames = preview.Children
            .Select(c => c.ParentName)
            .Where(parentName => !string.IsNullOrWhiteSpace(parentName))
            .Select(parentName => parentName!.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .Take(12)
            .ToList();

        for (int i = 0; i < uniqueParentNames.Count; i++)
        {
            worksheet.Cell(34 + i, 1).Value = uniqueParentNames[i];
        }

        // Money/agency fields are intentionally left blank.
        worksheet.Cell("AI33").Clear(XLClearOptions.Contents);
        worksheet.Cell("AI34").Clear(XLClearOptions.Contents);
        worksheet.Cell("AI35").Clear(XLClearOptions.Contents);
        worksheet.Cell("AI36").Clear(XLClearOptions.Contents);
        worksheet.Cell("AI37").Clear(XLClearOptions.Contents);
        worksheet.Cell("AI42").Clear(XLClearOptions.Contents);
        worksheet.Cell("AI43").Clear(XLClearOptions.Contents);
        worksheet.Cell("AI46").Clear(XLClearOptions.Contents);

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);

        var fileBytes = stream.ToArray();
        var fileName = $"DayhomeFlow-Invoice-{year}-{month:00}.xlsx";

        return File(
            fileBytes,
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            fileName
        );
    }

    private static void ClearMainInvoiceRows(IXLWorksheet worksheet)
    {
        for (int row = 7; row <= 19; row++)
        {
            worksheet.Cell(row, 1).Clear(XLClearOptions.Contents);

            for (int col = 3; col <= 35; col++)
            {
                worksheet.Cell(row, col).Clear(XLClearOptions.Contents);
            }
        }
    }

    private static void ClearParentNameRows(IXLWorksheet worksheet)
    {
        for (int row = 34; row <= 45; row++)
        {
            worksheet.Cell(row, 1).Clear(XLClearOptions.Contents);
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

        cell.Value = value.ToLowerInvariant();
    }
}