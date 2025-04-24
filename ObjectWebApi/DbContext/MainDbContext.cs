using Microsoft.EntityFrameworkCore;
using Models;

namespace DbContext;

public class MainDbContext : Microsoft.EntityFrameworkCore.DbContext
{
    public DbSet<MyObject> MyObjects { get; set; }
    public DbSet<ObjectProperties> ObjectProperties { get; set; }

    public MainDbContext(DbContextOptions<MainDbContext> options) : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<MyObject>(entity =>
        {
            // Set primary key
            entity.HasKey(o => o.ObjectId);

            // Set the type and default value for ObjectId
            entity.Property(o => o.ObjectId)
                  .HasColumnType("uniqueidentifier")
                  .HasDefaultValueSql("NEWID()")
                  .ValueGeneratedOnAdd();
        });

        modelBuilder.Entity<ObjectProperties>(entity =>
        {
            // Set composite key for ObjectProperties
            entity.HasKey(op => new { op.ObjectId, op.Field });

            // Set ObjectId property type for ObjectProperties
            entity.Property(op => op.ObjectId)
                  .HasColumnType("uniqueidentifier");
        });

        // Define relationships
        modelBuilder.Entity<MyObject>()
            .HasMany(o => o.ObjectProperties)
            .WithOne()
            .HasForeignKey(op => op.ObjectId);
    }
}
