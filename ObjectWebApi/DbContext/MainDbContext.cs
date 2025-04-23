using Microsoft.EntityFrameworkCore;
using Models;
using Models.Dto;
using DbModels;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;

namespace DbContext;

public class ObjectDbContext : Microsoft.EntityFrameworkCore.DbContext
{
    public ObjectDbContext(DbContextOptions<ObjectDbContext> options) : base(options) { }

    public DbSet<CustomObjectDbM> CustomObjects { get; set; }
    public DbSet<ObjectPropertiesDbM> ObjectProperties { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<CustomObject>()
            .HasMany(o => o.ObjectProperties)
            .WithOne(p => p.Object)
            .HasForeignKey(p => p.PropertyId);
    }
}
