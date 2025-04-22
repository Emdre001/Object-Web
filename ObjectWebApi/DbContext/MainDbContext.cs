using Microsoft.EntityFrameworkCore;

public class ObjectDbContext : MainDbContext
{
    public ObjectDbContext(DbContextOptions<ObjectDbContext> options) : base(options) { }

    public DbSet<Object> Objects { get; set; }
    public DbSet<ObjectProperties> ObjectProperties { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Object>()
            .HasMany(o => o.ObjectProperties)
            .WithOne(p => p.Object)
            .HasForeignKey(p => p.ObjectID);
    }
}
