namespace DayhomeFlowApi.Dtos;

public class InvoicePreviewDto
{
    public int Month { get; set; }
    public int Year { get; set; }
    public int DaysInMonth { get; set; }

    public List<InvoiceChildLineDto> Children { get; set; } = new();

    public decimal SubTotal { get; set; }
    public decimal AgencyFees { get; set; }
    public decimal LiabilityInsurance { get; set; }
    public decimal StoryparkDeduction { get; set; }
    public decimal TrainingCourses { get; set; }
    public decimal Deductions { get; set; }
    public decimal Additions { get; set; }
    public decimal TotalPaid { get; set; }
}