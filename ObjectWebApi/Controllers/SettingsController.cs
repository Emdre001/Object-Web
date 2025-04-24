using Microsoft.AspNetCore.Mvc;
using Models;
using System.Text.Json;
using DbContext;
using Microsoft.EntityFrameworkCore;


[ApiController]
[Route("api/[controller]")]
public class SettingsController : ControllerBase
{
    private readonly SettingsRepository _repo;
    private readonly MainDbContext _context;

    public SettingsController(SettingsRepository repo, MainDbContext context)
    {
        _repo = repo;
        _context = context;
    }

    // Existing GetAllSettings method: Modify to show all SettingsEntities
    [HttpGet]
    public async Task<IActionResult> GetAllSettings()
    {
        // Retrieve all settings entities from the database
        var entities = await _context.Settings.ToListAsync();

        if (entities == null || entities.Count == 0)
        {
            return NotFound("No settings available.");
        }

        // Return the list of all SettingsEntities
        return Ok(entities);
    }

    // Existing GetSettings method: Fetch specific settings by SettingsId
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetSettings(Guid id)
    {
        var settings = await _repo.LoadSettingsAsync(id);
        return settings != null ? Ok(settings) : NotFound();
    }

    // New GET method to get all Applications and AppIds by SettingsId
    [HttpGet("{settingsId:guid}/applications")]
    public async Task<IActionResult> GetApplicationsBySettingsId(Guid settingsId)
    {
        var settings = await _repo.LoadSettingsAsync(settingsId);

        if (settings == null)
        {
            return NotFound($"Settings with ID {settingsId} not found.");
        }

        // Return the list of Applications and their AppIds
        var applicationsWithAppIds = settings.Applications.Select(app => new
        {
            app.AppId,
            app.Name
        }).ToList();

        return Ok(applicationsWithAppIds);
    }

    [HttpPost]
public async Task<IActionResult> SaveSettings([FromBody] Settings settings)
{
    var settingsId = Guid.NewGuid(); // Generate a new unique SettingsId

    // Set SettingEntityName based on logic (for example, using the first application's Name or other properties)
    var settingEntityName = settings.Applications.FirstOrDefault()?.Name ?? "Enter Name Here"; // Example logic

    // Serialize settings to JSON data
    var jsonData = JsonSerializer.Serialize(settings);

    // Create a new SettingsEntity with the generated SettingsId and SettingEntityName
    var settingsEntity = new SettingsEntity
    {
        SettingsId = settingsId,
        SettingEntityName = settingEntityName,
        JsonData = jsonData 
    };

    // Add the SettingsEntity to the DbContext and save it to the database
    _context.Settings.Add(settingsEntity);
    await _context.SaveChangesAsync(); // Persist the new SettingsEntity

    // Save the settings using the repository method
    await _repo.SaveSettingsAsync(settingsId, settings);

    // Return a CreatedAtAction response with the new SettingsId and the saved settings
    return CreatedAtAction(nameof(GetSettings), new { id = settingsId }, settings);
}


    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteSettings(Guid id)
    {
        await _repo.DeleteSettingsAsync(id);
        return NoContent();
    }

    [HttpPost("{settingsId:guid}/applications/{appId:guid}/add-objects")]
    public async Task<IActionResult> AddObjectsToApplication(Guid settingsId, Guid appId, [FromBody] List<MyObject> newObjects)
    {
        var settings = await _repo.LoadSettingsAsync(settingsId);
        if (settings == null)
            return NotFound($"Settings with ID {settingsId} not found.");

        // Find the application by appId
        var app = settings.Applications.FirstOrDefault(a => a.AppId == appId);
        if (app == null)
            return NotFound($"Application with ID {appId} not found in settings.");

        // Add new objects to the application
        app.ApplicationObject.AddRange(newObjects);

        // Save the updated settings
        await _repo.SaveSettingsAsync(settingsId, settings);

        // Return updated settings as response
        return Ok(settings);
    }
}

