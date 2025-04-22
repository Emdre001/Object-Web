using Microsoft.AspNetCore.Mvc;
using Models;

[ApiController]
[Route("api/[controller]")]
public class CustomObjectController : ControllerBase
{
    private static readonly Dictionary<Guid, CustomObject> _store = new();

    [HttpGet("{id}")]
    public ActionResult<CustomObject> Get(Guid id)
    {
        if (_store.TryGetValue(id, out var obj))
            return Ok(obj);

        return NotFound();
    }

    [HttpPut("{id}")]
    public ActionResult<CustomObject> Put(Guid id, [FromBody] CustomObject updated)
    {
        if (!_store.ContainsKey(id))
            return NotFound();

        updated.ObjectId = id;
        _store[id] = updated;

        return Ok(updated);
    }

    [HttpPost]
    public ActionResult<CustomObject> Create([FromBody] CustomObject newObj)
    {
        newObj.ObjectId = Guid.NewGuid();
        _store[newObj.ObjectId] = newObj;

        return CreatedAtAction(nameof(Get), new { id = newObj.ObjectId }, newObj);
    }
}
