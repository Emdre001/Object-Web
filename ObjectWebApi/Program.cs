using Microsoft.OpenApi.Models;


var builder = WebApplication.CreateBuilder(args);

// Add Swagger services
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Enable Swagger middleware
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Define endpoints
app.MapGet("/", () => "Hello, world!");
app.MapGet("/hello/{name}", (string name) => $"Hello, {name}!");
app.MapPost("/echo", (User user) => Results.Ok(user));

app.Run();

record User(string Name, int Age);
