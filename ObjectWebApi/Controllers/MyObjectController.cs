using Microsoft.AspNetCore.Mvc;
using Models;
using DTO;

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

    [HttpGet("all")]
    public async Task<IActionResult> GetAllObjects()
    {
        var allObjects = await _repository.GetAllObjectsAsync();
        return Ok(allObjects);
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

    [HttpDelete("DeleteAll")]
    public async Task<IActionResult> DeleteAllObjects()
    {
        await _repository.DeleteAllObjectsAsync();
        return NoContent();
    }

    [HttpGet("by-type/{objectType}")]
    public async Task<IActionResult> GetObjectsByType(string objectType)
    {
        var objects = await _repository.GetObjectsByTypeAsync(objectType);
        return Ok(objects);
    }

    [HttpGet("searchByTerm")]
    public async Task<IActionResult> SearchObjects([FromQuery] string term)
    {
        if (string.IsNullOrWhiteSpace(term))
            return BadRequest("Search term cannot be empty.");

        var results = await _repository.SearchObjectsAsync(term);
        return Ok(results);
    }
 
    [HttpPost("create-test-data")]
    public async Task<IActionResult> RunCreateTestData()
    {
        try
        {
            var testData = await _repository.CreateTestData();       // Create the objects
            await _repository.SaveManyObjectsAsync(testData);        // Save to DB
            return Ok(testData);                                     // Return the created objects
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error generating test data: {ex.Message}");
        }
    }


    [HttpPut("{objectId:guid}")]
    public async Task<IActionResult> UpdateObject(Guid objectId, [FromBody] MyObjectDto dto)
    {
        if (objectId != dto.ObjectId)
            return BadRequest("ObjectId mismatch between URL and body.");

        var success = await _repository.UpdateObjectAsync(dto);
        if (!success)
            return NotFound();

        return NoContent();
    }

}
