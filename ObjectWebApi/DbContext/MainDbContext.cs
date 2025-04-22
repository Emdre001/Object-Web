using Microsoft.EntityFrameworkCore;
using Models;

public class ObjectDbContext : DbContext
{
    public ObjectDbContext(DbContextOptions<ObjectDbContext> options) : base(options) { }

    public DbSet<CustomObject> CustomObjects { get; set; }
    public DbSet<ObjectProperties> ObjectProperties { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<CustomObject>()
            .HasMany(o => o.ObjectProperties)
            .WithOne(p => p.Object)
            .HasForeignKey(p => p.ObjectId);
    }
}
