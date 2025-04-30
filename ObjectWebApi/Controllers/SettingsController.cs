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

    // GET all settings
    [HttpGet]
    public async Task<IActionResult> GetAllSettings()
    {
        var entities = await _context.Settings.ToListAsync();

        if (entities == null || entities.Count == 0)
        {
            return NotFound("No settings available.");
        }

        var results = entities.Select(entity =>
        {
            Settings? deserialized = null;
            try
            {
                deserialized = JsonSerializer.Deserialize<Settings>(entity.JsonData);
            }
            catch (JsonException ex)
            {
                // Handle malformed JSON if necessary
            }

            return new
            {
                entity.SettingsId,
                entity.SettingEntityName,
                Applications = deserialized?.Applications ?? new List<Application>()
            };
        });

        return Ok(results);
    }


    // GET specific settings by SettingsId
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetSetting(Guid id)
    {
        var settings = await _repo.LoadSettingsAsync(id);
        return settings != null ? Ok(settings) : NotFound();
    }

    // GET all Applications and AppIds by SettingsId
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

    //POST a new setting
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
        return CreatedAtAction(nameof(GetSetting), new { id = settingsId }, settings);
    }

    //DELETE all settings
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteSettings(Guid id)
    {
        await _repo.DeleteSettingsAsync(id);
        return NoContent();
    }

    //POST test settings
    [HttpPost("createDemoSetting")]
    public async Task<IActionResult> CreateTestSettings()
    {
        Settings settings = new Settings();
        Application application = new Application
        {
            AppId = Guid.NewGuid(),
            Name = "AppTest"
        };

        ObjectType company = new ObjectType { Name = "Company" };
        company.Fields.Add(new Field { FieldName = "Homepage", Editor = "Text", Defaults = "" });

        ObjectType person = new ObjectType { Name = "Person" };
        person.ParentObjectTypes.Add("Company");
        person.Fields.Add(new Field { FieldName = "Phonenumber", Editor = "Text", Defaults = "" });
        person.Fields.Add(new Field { FieldName = "Active", Editor = "Select", Defaults = "True, False" });

        application.ObjectType.Add(company);
        application.ObjectType.Add(person);
        settings.Applications.Add(application);

        // 💾 Save to database
        var settingsId = Guid.NewGuid();
        var jsonData = JsonSerializer.Serialize(settings);

        var settingsEntity = new SettingsEntity
        {
            SettingsId = settingsId,
            SettingEntityName = application.Name,
            JsonData = jsonData
        };

        _context.Settings.Add(settingsEntity);
        await _context.SaveChangesAsync();

        // Optional: also store in your repository layer
        await _repo.SaveSettingsAsync(settingsId, settings);

        return CreatedAtAction(nameof(GetSetting), new { id = settingsId }, settings);
    }


    // GET test settings
    [HttpGet("getDemoSetting")]
    public async Task<IActionResult> GetTestSettings()
    {
        // Create the same demo settings as in the POST method
        Settings settings = new Settings();
        Application application = new Application();
        
        application.AppId = new Guid();
        application.Name = "AppTest";
        
        ObjectType company = new ObjectType();
        company.Name = "Company";

        Field field1 = new Field();
        field1.FieldName = "Homepage";
        field1.Editor = "Text";
        field1.Defaults = "";
        company.Fields.Add(field1);

        application.ObjectType.Add(company);

        ObjectType person = new ObjectType();
        person.Name = "Person";
        person.ParentObjectTypes.Add("Company");

        Field field2 = new Field();
        field2.FieldName = "Phonenumber";
        field2.Editor = "Text";
        field2.Defaults = "";
        person.Fields.Add(field2);

        Field field3 = new Field();
        field3.FieldName = "Active";
        field3.Editor = "Select";
        field3.Defaults = "True, False";
        person.Fields.Add(field3);

        application.ObjectType.Add(person);
        settings.Applications.Add(application);

        return Ok(settings);
    }

}

