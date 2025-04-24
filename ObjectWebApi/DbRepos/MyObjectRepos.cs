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

    public async Task<List<MyObject>> GetObjectsByTypeAsync(string objectType)
    {
        return await _context.MyObjects
            .Include(o => o.ObjectProperties)
            .Where(o => o.ObjectType == objectType)
            .ToListAsync();
    }
}
