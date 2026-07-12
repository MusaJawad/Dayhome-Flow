namespace DayhomeFlowApi.Dtos;

public class InvoicePreviewDto
{
    public int Month { get; set; }
    public int Year { get; set; }
    public int DaysInMonth { get; set; }

    public List<InvoiceChildLineDto> Children { get; set; } = new();
}