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


    [HttpGet("searchByTerm")]
    public async Task<IActionResult> SearchObjects([FromQuery] string term)
    {
        if (string.IsNullOrWhiteSpace(term))
            return BadRequest("Search term cannot be empty.");

        var results = await _repository.SearchObjectsAsync(term);
        return Ok(results);
    }
 
      [HttpGet("create")]
    public async Task<ActionResult<List<MyObject>>> RunCreateTestData()
    {
        try
        {
            var result = await CreateTestData();  // Call your async method
            return Ok(result);  // Returns the list as JSON
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error generating test data: {ex.Message}");
        }
    }

    private async Task<List<MyObject>> CreateTestData()
    {
        var ObjList = new List<MyObject>(); 

        for (int i = 0; i < 10; i++)
        {
            var customer = new MyObject
            {
                ObjectId = Guid.NewGuid(),
                ObjectName = $"Company {i}",
                ObjectType = "Company",
                ObjectProperties = new List<ObjectProperties>
                {
                    new ObjectProperties
                    {
                        ObjectId = Guid.NewGuid(),
                        Field = "Home page",
                        Value = $"www.company{i}.se"
                    }
                },
                Childrens = new List<MyObject>()
            };

            for (int j = 0; j < 5; j++)
            {
                var person = new MyObject
                {
                    ObjectId = Guid.NewGuid(),
                    ObjectName = $"Person {j} {customer.ObjectName}",
                    ObjectType = "Employee",
                    ObjectProperties = new List<ObjectProperties>
                    {
                        new ObjectProperties
                        {
                            ObjectId = Guid.NewGuid(), 
                            Field = "Mobile",
                            Value = "070"
                        }
                    },
                    Parents = new List<MyObject> { customer }
                };

                customer.Childrens.Add(person);
                ObjList.Add(person);
            }

            ObjList.Add(customer);
        }

        await _repository.SaveManyObjectsAsync(ObjList);
        return ObjList;
    }
}
