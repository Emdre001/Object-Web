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

    [HttpPost("PostObject")]
    public async Task<IActionResult> CreateObject([FromBody] MyObjectDto dto)
    {
        if (dto == null)
        {
            return BadRequest("Object data is required.");
        }

        try
        {
            // Create object with IDs assigned inside the repo method
            var createdObject = _repository.CreateObject(dto);

            // Ensure nested ObjectProperties FK is correct (redundant if repo sets properly)
            if (createdObject.ObjectProperties != null)
            {
                foreach (var prop in createdObject.ObjectProperties)
                {
                    prop.MyObjectObjectId = createdObject.ObjectId;
                }
            }

            await _repository.SaveObjectAsync(createdObject);

            return CreatedAtAction(nameof(GetObject), new { objectId = createdObject.ObjectId }, createdObject);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
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

    [HttpGet("get-children/{objectId}")]
    public async Task<IActionResult> GetChildrenByObjectId(Guid objectId)
    {
        try
        {
            var children = await _repository.GetChildrenByObjectIdAsync(objectId);
            if (children == null || children.Count == 0)
            {
                return NotFound($"No children found for the object with ID {objectId}");
            }

            return Ok(children); 
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error fetching children: {ex.Message}");
        }
    }

    [HttpPut("{objectId}")]
    public async Task<IActionResult> UpdateObject(Guid objectId, [FromBody] UpdateObjectDto dto)
    {
        if (dto == null || objectId != dto.ObjectId)
        {
            return BadRequest("Invalid object ID or data.");
        }

        try
        {
            var success = await _repository.UpdateObjectAsync(dto);

            if (!success)
                return NotFound($"Object with ID {objectId} not found.");

            return NoContent(); 
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
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

}
