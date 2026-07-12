namespace DayhomeFlowApi.Dtos;

public class InvoiceChildLineDto
{
    public int ChildId { get; set; }
    public string ChildName { get; set; } = string.Empty;
    public string? ParentName { get; set; }
    public List<InvoiceDayDto> Days { get; set; } = new();
    public decimal TotalHours { get; set; }
    public decimal ContractFee { get; set; }
}