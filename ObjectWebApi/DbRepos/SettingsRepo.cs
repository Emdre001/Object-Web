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

    public async Task<Settings?> LoadSettingsAsync(Guid SettingsId)
    {
        var entity = await _context.Settings.FindAsync(SettingsId);
         return entity != null
            ? JsonSerializer.Deserialize<Settings>(entity.JsonData)
            : null;
    }

    public async Task SaveSettingsAsync(Guid SettingsId, Settings settings)
    {
        var options = new JsonSerializerOptions { WriteIndented = true };

        var json = JsonSerializer.Serialize(settings, options);
        var entity = await _context.Settings.FindAsync(SettingsId);

        if (entity != null)
        {
            entity.JsonData = json;
            _context.Settings.Update(entity);
        }
        else
        {
            _context.Settings.Add(new SettingsEntity
            {
                SettingsId = SettingsId,
                JsonData = json
            });
        }

        await _context.SaveChangesAsync();
    }

    public async Task DeleteSettingsAsync(Guid SettingsId)
    {
        var entity = await _context.Settings.FindAsync(SettingsId);
        if (entity != null)
        {
            _context.Settings.Remove(entity);
            await _context.SaveChangesAsync();
        }
    }
}
