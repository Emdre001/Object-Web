using Microsoft.AspNetCore.Mvc;
using Models;

[ApiController]
[Route("api/[controller]")]
public class SettingsController : ControllerBase
{
    private readonly SettingsRepository _repo;

    public SettingsController(SettingsRepository repo)
    {
        _repo = repo;
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetSettings(Guid SettingsId)
    {
        var settings = await _repo.LoadSettingsAsync(SettingsId);
        return settings != null ? Ok(settings) : NotFound();
    }

   [HttpPost]
    public async Task<IActionResult> SaveSettings([FromBody] Settings settings)
    {
        var settingsId = Guid.NewGuid(); // Skapar ett nytt unikt ID
        await _repo.SaveSettingsAsync(settingsId, settings);
        return CreatedAtAction(nameof(GetSettings), new { id = settingsId }, settings);
    }



    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteSettings(Guid SettingsId)
    {
        await _repo.DeleteSettingsAsync(SettingsId);
        return NoContent();
    }
}
