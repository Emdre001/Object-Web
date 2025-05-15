using Microsoft.EntityFrameworkCore;
using DbContext;
using Models;
using DTO;
public class ObjectRepository
{
    private readonly MainDbContext _context;

    public ObjectRepository(MainDbContext context)
    {
        _context = context;
    }

    public MyObject CreateObject(MyObjectDto dto)
    {
        // Generate the parent ObjectId once
        var objectId = Guid.NewGuid();

        var newObject = new MyObject
        {
            ObjectId = objectId,
            ObjectName = dto.ObjectName,
            ObjectType = dto.ObjectType,
            ObjectProperties = new List<ObjectProperties>()
        };

        foreach (var propertyDto in dto.ObjectProperties)
        {
            newObject.ObjectProperties.Add(new ObjectProperties
            {
                ObjectId = objectId,            // Same as parent ObjectId
                Field = propertyDto.Field,
                Value = propertyDto.Value,
                MyObjectObjectId = objectId    // FK back to parent
            });
        }

        return newObject;
    }


    public async Task<List<MyObject>> CreateTestData()
{
    var ObjList = new List<MyObject>();

    for (int i = 0; i < 10; i++)
    {
        MyObject company = new MyObject
        {
            ObjectId = Guid.NewGuid(),
            ObjectName = $"Company {i}",
            ObjectType = "Company",
        };
        company.ObjectProperties.Add(new ObjectProperties
        {
            ObjectId = company.ObjectId,
            Field = "Homepage",
            Value = $"www.company{i}.se",
        });
        ObjList.Add(company);

        for (int j = 0; j < 5; j++)
        {
            MyObject person = new MyObject
            {
                ObjectId = Guid.NewGuid(),
                ObjectName = $"Person {j} {company.ObjectName}",
                ObjectType = "Person",
            };

            person.ObjectProperties.Add(new ObjectProperties { ObjectId = person.ObjectId, Field = "Phonenumber", Value = "0701234567" });
            person.ObjectProperties.Add(new ObjectProperties { ObjectId = person.ObjectId, Field = "Active", Value = "True" });
            person.ObjectProperties.Add(new ObjectProperties { ObjectId = person.ObjectId, Field = "Gender", Value = "Other" });
            person.ObjectProperties.Add(new ObjectProperties { ObjectId = person.ObjectId, Field = "E-Mail", Value = $"person{j}@company{i}.com" });
            person.ObjectProperties.Add(new ObjectProperties { ObjectId = person.ObjectId, Field = "Registration Date", Value = "2000-01-01" });

            company.Childrens.Add(person);  // renamed Childrens to Children
            person.Parents.Add(company);

            ObjList.Add(person);
        }
    }

    for (int k = 0; k < 5; k++)
        {
            MyObject myEvent = new MyObject
            {
                ObjectId = Guid.NewGuid(),
                ObjectName = $"Event {k + 1}",
                ObjectType = "Event",
            };

            myEvent.ObjectProperties.Add(new ObjectProperties { ObjectId = myEvent.ObjectId, Field = "EventTitle", Value = $"Event Title {k + 1}" });
            myEvent.ObjectProperties.Add(new ObjectProperties { ObjectId = myEvent.ObjectId, Field = "Location", Value = "Stockholm" });
            myEvent.ObjectProperties.Add(new ObjectProperties { ObjectId = myEvent.ObjectId, Field = "EventText", Value = $"Event {k + 1}" });
            myEvent.ObjectProperties.Add(new ObjectProperties { ObjectId = myEvent.ObjectId, Field = "StartTime", Value = "17.00" });
            myEvent.ObjectProperties.Add(new ObjectProperties { ObjectId = myEvent.ObjectId, Field = "StopTime", Value = "22.00" });
            myEvent.ObjectProperties.Add(new ObjectProperties { ObjectId = myEvent.ObjectId, Field = "EventDate", Value = $"2025-05-0{k + 1}" });
            myEvent.ObjectProperties.Add(new ObjectProperties { ObjectId = myEvent.ObjectId, Field = "AllDayEvent", Value = "False" });

            ObjList.Add(myEvent);
        }

    return ObjList;  // <-- Return after loop finishes
}



    public async Task<bool> UpdateObjectAsync(UpdateObjectDto dto)
    {
        var existing = await _context.MyObjects
            .Include(o => o.ObjectProperties)
            .FirstOrDefaultAsync(o => o.ObjectId == dto.ObjectId);

        if (existing == null)
            return false;

        // Update basic fields
        existing.ObjectName = dto.ObjectName;
        existing.ObjectType = dto.ObjectType;

        // Replace ObjectProperties
        _context.ObjectProperties.RemoveRange(existing.ObjectProperties);

        var updatedProperties = dto.ObjectProperties.Select(p => new ObjectProperties
        {
            ObjectId = dto.ObjectId,
            Field = p.Field,
            Value = p.Value
        }).ToList();

        existing.ObjectProperties = updatedProperties;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<List<MyObject>> GetAllObjectsAsync()
    {
        return await _context.MyObjects
            .Include(o => o.ObjectProperties)
            .Include(o => o.Childrens)
            .Include(o => o.Parents)
            .ToListAsync();
    }

    public async Task<List<MyObject>> GetObjectsByTypeAsync(string objectType)
    {
        return await _context.MyObjects
            .Include(o => o.ObjectProperties)
            .Where(o => o.ObjectType == objectType)
            .ToListAsync();
    }

    public async Task<List<MyObject>> GetChildrenByObjectIdAsync(Guid objectId)
    {
        var obj = await _context.MyObjects
            .Include(o => o.Childrens)  
            .ThenInclude(c => c.ObjectProperties) 
            .FirstOrDefaultAsync(o => o.ObjectId == objectId);
        if (obj == null)
        {
            return new List<MyObject>();  
        }
        return obj.Childrens;
    }

    public async Task<List<MyObject>> SearchObjectsAsync(string term)
    {
        term = term.ToLower();

        return await _context.MyObjects
            .Include(o => o.ObjectProperties) // 👈 include related properties
            .Where(o =>
                (o.ObjectName != null && o.ObjectName.ToLower().Contains(term)) ||
                (o.ObjectType != null && o.ObjectType.ToLower().Contains(term)) ||
                o.ObjectId.ToString().Contains(term) ||
                o.ObjectProperties.Any(p =>
                    (p.Field != null && p.Field.ToLower().Contains(term)) ||
                    (p.Value != null && p.Value.ToLower().Contains(term))
                )
            )
            .ToListAsync();
    }

    public async Task DeleteObjectAsync(Guid objectId)
    {
        var obj = await _context.MyObjects.FindAsync(objectId);
        if (obj != null)
        {
            _context.MyObjects.Remove(obj);
            await _context.SaveChangesAsync();
        }
    }

    public async Task DeleteAllObjectsAsync()
    {
        // Step 1: Clear the relation table (if needed)
        await _context.Database.ExecuteSqlRawAsync("DELETE FROM MyObjectRelation");

        // Step 2: Delete from ObjectProperties (child)
        _context.ObjectProperties.RemoveRange(_context.ObjectProperties);

        // Step 3: Delete from MyObjects (parent)
        _context.MyObjects.RemoveRange(_context.MyObjects);

        await _context.SaveChangesAsync();
    }

    public async Task SaveManyObjectsAsync(List<MyObject> objects)
    {
        await _context.MyObjects.AddRangeAsync(objects);
        await _context.SaveChangesAsync();
    }

    public async Task SaveObjectAsync(MyObject obj)
    {
        var exists = await _context.MyObjects.AnyAsync(o => o.ObjectId == obj.ObjectId);
        if (exists)
            _context.MyObjects.Update(obj); // update
        else
            _context.MyObjects.Add(obj); // insert

    
        await _context.SaveChangesAsync();
    }

    public async Task<MyObject?> LoadObjectAsync(Guid objectId)
    {
        return await _context.MyObjects
            .Include(o => o.ObjectProperties)
            .FirstOrDefaultAsync(o => o.ObjectId == objectId);
    }

    public async Task<List<MyObject>> LoadObjectsByIdsAsync(IEnumerable<Guid> ids)
    {
        return await _context.MyObjects
            .Where(o => ids.Contains(o.ObjectId))
            .ToListAsync();
    }


}
