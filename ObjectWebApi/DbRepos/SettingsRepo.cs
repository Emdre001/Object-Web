using Microsoft.EntityFrameworkCore;
using DbContext;
using Models;
using System.Text.Json;

public class SettingsRepository
{
    private readonly MainDbContext _context;

    public SettingsRepository(MainDbContext context)
    {
        _context = context;
    }

    public async Task<Settings?> LoadSettingsAsync(Guid settingsId)
    {
        var entity = await _context.Settings.FindAsync(settingsId);
        return entity != null
            ? JsonSerializer.Deserialize<Settings>(entity.JsonData)
            : null;
    }

    public async Task SaveSettingsAsync(Guid settingsId, Settings settings)
{
    // Assign a new AppId to any application that doesn't have one
    foreach (var app in settings.Applications)
    {
        if (app.AppId == Guid.Empty)
        {
            app.AppId = Guid.NewGuid();
        }
    }

    var options = new JsonSerializerOptions { WriteIndented = true };
    var json = JsonSerializer.Serialize(settings, options);

    var entity = await _context.Settings.FindAsync(settingsId);

    if (entity != null)
    {
        entity.JsonData = json;
        _context.Settings.Update(entity);
    }
    else
    {
        _context.Settings.Add(new SettingsEntity
        {
            SettingsId = settingsId,
            JsonData = json
        });
    }

    await _context.SaveChangesAsync();
}

    public async Task DeleteSettingsAsync(Guid settingsId)
    {
        var entity = await _context.Settings.FindAsync(settingsId);
        if (entity != null)
        {
            _context.Settings.Remove(entity);
            await _context.SaveChangesAsync();
        }
    }
}
