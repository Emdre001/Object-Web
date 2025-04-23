using Microsoft.EntityFrameworkCore;
using Models;
using Models.Dto;
using DbModels;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using Configuration;

namespace DbContext
{
    public class ObjectDbContext : Microsoft.EntityFrameworkCore.DbContext
    {
        public DbSet<CustomObjectDbM> CustomObjects { get; set; }
        public DbSet<ObjectPropertiesDbM> ObjectProperties { get; set; }

        public ObjectDbContext() { }

        public ObjectDbContext(DbContextOptions<ObjectDbContext> options)
            : base(options) { }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                // Build configuration (loads appsettings and secrets)
                var configuration = new ConfigurationBuilder()
                    .SetBasePath(Directory.GetCurrentDirectory())
                    .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
                    .AddUserSecrets<ObjectDbContext>() // Or use .AddUserSecrets("your-id") if needed
                    .Build();

                var connectionString = configuration.GetConnectionString("ObjectDb");

                optionsBuilder.UseSqlServer(connectionString); // Use correct provider for your DB
            }
        }
    }
}

