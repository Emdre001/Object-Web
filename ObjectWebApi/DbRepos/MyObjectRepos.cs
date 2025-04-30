using Microsoft.EntityFrameworkCore;
using DbContext;
using Models;

public class ObjectRepository
{
    private readonly MainDbContext _context;

    public ObjectRepository(MainDbContext context)
    {
        _context = context;
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
        await _context.Database.ExecuteSqlRawAsync("DELETE FROM MyObjectRelation");
        _context.ObjectProperties.RemoveRange(_context.ObjectProperties);
        _context.MyObjects.RemoveRange(_context.MyObjects);
        await _context.SaveChangesAsync();
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

    public async Task<List<MyObject>> CreateTestData()
    {
        var ObjList = new List<MyObject>(); 
        for (int i = 0; i < 10; i++)
        {
            MyObject customer= new MyObject();
            customer.ObjectId = new Guid();
            customer.ObjectName = $"Company + {i}";
            customer.ObjectType = "Company";

            ObjectProperties CustomerProp = new ObjectProperties();
            CustomerProp.Field = "Home page";
            CustomerProp.Value = $"www.company{i}.se";
            customer.ObjectProperties.Add(new ObjectProperties());

            ObjList.Add(customer);

            for (int j = 0; j < 5; j++)
            {
                MyObject Person = new MyObject();
                Person.ObjectName = $"Person + {i} {customer.ObjectName}";
                Person.ObjectType = "Employee";

                ObjectProperties Prop = new ObjectProperties();
                Prop.Field = "Mobile";
                Prop.Value = "070";
                Person.ObjectProperties.Add(Prop);
                
                ObjList.Add(Person);
            }        
        }
        return ObjList;
    }

    public async Task SaveManyObjectsAsync(List<MyObject> objects)
    {
        await _context.MyObjects.AddRangeAsync(objects);
        await _context.SaveChangesAsync();
    }

}
