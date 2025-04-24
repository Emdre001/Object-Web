using Microsoft.AspNetCore.Mvc;
using Models;


[ApiController]
[Route("api/[controller]")]
public class ObjectController : ControllerBase
{
    private readonly ObjectRepository _repository;

    public ObjectController(ObjectRepository repository)
    {
        _repository = repository;
    }

    [HttpPost]
    public async Task<IActionResult> CreateObject([FromBody] MyObject obj)
    {
        // Only clear the ID if it's been preset (usually by Swagger or a front-end)
        if (obj.ObjectId != Guid.Empty)
            obj.ObjectId = default;

        await _repository.SaveObjectAsync(obj);
        return CreatedAtAction(nameof(GetObject), new { objectId = obj.ObjectId }, obj);
    }

    [HttpGet("{objectId:guid}")]
    public async Task<IActionResult> GetObject(Guid objectId)
    {
        var obj = await _repository.LoadObjectAsync(objectId);
        return obj != null ? Ok(obj) : NotFound();
    }

    [HttpDelete("{objectId:guid}")]
    public async Task<IActionResult> DeleteObject(Guid objectId)
    {
        await _repository.DeleteObjectAsync(objectId);
        return NoContent();
    }

    [HttpGet("by-type/{objectType}")]
    public async Task<IActionResult> GetObjectsByType(string objectType)
    {
        var objects = await _repository.GetObjectsByTypeAsync(objectType);
        return Ok(objects);
    }

}
