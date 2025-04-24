using Microsoft.EntityFrameworkCore;
using Models;

namespace DbContext;

public class MainDbContext : Microsoft.EntityFrameworkCore.DbContext
{
    public DbSet<MyObject> MyObjects { get; set; }
    public DbSet<ObjectProperties> ObjectProperties { get; set; }
    public DbSet<SettingsEntity> Settings { get; set; }

    public MainDbContext(DbContextOptions<MainDbContext> options) : base(options) { }

   protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<MyObject>(entity =>
    {
        entity.HasKey(o => o.ObjectId);

        entity.Property(o => o.ObjectId)
              .HasColumnType("uniqueidentifier")
              .HasDefaultValueSql("NEWID()")
              .ValueGeneratedOnAdd();
    });

    modelBuilder.Entity<ObjectProperties>(entity =>
    {
        entity.HasKey(op => new { op.ObjectId, op.Field });

        entity.Property(op => op.ObjectId)
              .HasColumnType("uniqueidentifier");
    });

    modelBuilder.Entity<MyObject>()
        .HasMany(o => o.ObjectProperties)
        .WithOne()
        .HasForeignKey(op => op.ObjectId);

    // 🛠 Här är fixen för SettingsEntity
    modelBuilder.Entity<SettingsEntity>(entity =>
    {
        entity.HasKey(e => e.SettingsId);
    });
}

}
