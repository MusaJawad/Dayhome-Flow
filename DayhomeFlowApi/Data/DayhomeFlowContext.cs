using DayhomeFlowApi.Models;
using Microsoft.EntityFrameworkCore;

namespace DayhomeFlowApi.Data;

public class DayhomeFlowContext : DbContext
{
    public DayhomeFlowContext(DbContextOptions<DayhomeFlowContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<ProviderProfile> ProviderProfiles => Set<ProviderProfile>();
    public DbSet<Child> Children => Set<Child>();
    public DbSet<AttendanceRecord> AttendanceRecords => Set<AttendanceRecord>();
    public DbSet<Invoice> Invoices => Set<Invoice>();
}