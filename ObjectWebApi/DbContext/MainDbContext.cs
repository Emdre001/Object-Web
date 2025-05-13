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
            // Relation till MyObject
            entity.HasOne(op => op.MyObject)
                .WithMany(o => o.ObjectProperties)
                .HasForeignKey(op => op.MyObjectObjectId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<MyObject>()
            .HasMany(e => e.Childrens)
            .WithMany(e => e.Parents)
            .UsingEntity<Dictionary<string, object>>(
                "MyObjectRelation",
                j => j
                    .HasOne<MyObject>()
                    .WithMany()
                    .HasForeignKey("ChildId")
                    .OnDelete(DeleteBehavior.Restrict),
                j => j
                    .HasOne<MyObject>()
                    .WithMany()
                    .HasForeignKey("ParentId")
                    .OnDelete(DeleteBehavior.Restrict),
                j =>
                {
                    j.HasKey("ParentId", "ChildId");
                    j.ToTable("MyObjectRelation");
                }
            );
        modelBuilder.Entity<SettingsEntity>(entity =>
        {
            entity.HasKey(e => e.SettingsId);
        });
    }

}
