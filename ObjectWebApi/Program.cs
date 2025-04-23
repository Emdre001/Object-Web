using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Load config from appsettings.json
builder.Configuration.AddJsonFile("appsettings.json", optional: true, reloadOnChange: true);

// Read the user secret ID from config
var userSecretId = builder.Configuration["UserSecrets:Id"];
if (!string.IsNullOrEmpty(userSecretId))
{
    builder.Configuration.AddUserSecrets(userSecretId);
}

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "MyObject API", Version = "v1" });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseRouting();
app.UseAuthorization();

app.MapControllers();

app.Run();
