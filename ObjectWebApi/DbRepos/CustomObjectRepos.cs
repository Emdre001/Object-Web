using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using Models;
using Models.Dto;
using DbModels;
using DbContext;

namespace DbRepos;

public class CustomObjectRepos
{
    private readonly ILogger<CustomObjectRepos> _logger;
    private readonly ObjectDbContext _dbContext;

    #region contructors
    public CustomObjectRepos(ILogger<CustomObjectRepos> logger, ObjectDbContext context)
    {
        _logger = logger;
        _dbContext = context;
    }
    #endregion

    public async Task<ResponseItemDto<ICustomObject>> ReadItemAsync(Guid id, bool flat)
    {
        IQueryable<CustomObjectDbM> query;
        if (!flat)
        {
            query = _dbContext.CustomObjects.AsNoTracking()
                .Include(i => i.ObjectPropertiesDbM)
                .Where(i => i.ObjectId == id);
        }
        else
        {
            query = _dbContext.CustomObjects.AsNoTracking()
                .Where(i => i.ObjectId == id);
        }   

        var resp =  await query.FirstOrDefaultAsync<ICustomObject>();
        return new ResponseItemDto<ICustomObject>()
        {
            Item = resp
        };
    }

     public async Task<ResponsePageDto<ICustomObject>> ReadItemsAsync(bool seeded, bool flat, string filter, int pageNumber, int pageSize)
    {
        filter ??= "";
        IQueryable<CustomObjectDbM> query;
        if (flat)
        {
            query = _dbContext.CustomObjects.AsNoTracking();
        }
        else
        {
            query = _dbContext.CustomObjects.AsNoTracking()
                .Include(i => i.ObjectPropertiesDbM);
        }

        return new ResponsePageDto<ICustomObject>()
        {
            //DbConnectionKeyUsed = _dbContext.dbConnection,
            DbItemsCount = await query
            //Adding filter functionality
            .Where(i => (i.Seeded == seeded) && 
                        (i.ObjectName.ToLower().Contains(filter) ||
                         i.ObjectType.ToLower().Contains(filter))).CountAsync(),

            PageItems = await query

            //Adding filter functionality
            .Where(i => (i.Seeded == seeded) && 
                         (i.ObjectName.ToLower().Contains(filter) ||
                         i.ObjectType.ToLower().Contains(filter)))

            //Adding paging
            .Skip(pageNumber * pageSize)
            .Take(pageSize)

            .ToListAsync<ICustomObject>(),

            PageNr = pageNumber,
            PageSize = pageSize
            
        };
    }
    public async Task<ResponseItemDto<ICustomObject>> DeleteItemAsync(Guid id)
    {
        //Find the instance with matching id
        var query1 = _dbContext.CustomObjects
            .Where(i => i.ObjectId == id);
        var item = await query1.FirstOrDefaultAsync<CustomObjectDbM>();

        //If the item does not exists
        if (item == null) throw new ArgumentException($"Item {id} is not existing");

        //delete in the database model
        _dbContext.CustomObjects.Remove(item);

        //write to database in a UoW
        await _dbContext.SaveChangesAsync();

        return new ResponseItemDto<ICustomObject>()
        {
            Item = item
        };
    }
    public async Task<ResponseItemDto<ICustomObject>> UpdateItemAsync(CustomObjectDto itemDto)
    {
        //Find the instance with matching id and read the navigation properties.
        var query1 = _dbContext.CustomObjects
            .Where(i => i.ObjectId == itemDto.ObjectId);
        var item = await query1
            .Include(i => i.ObjectPropertiesDbM)
            .FirstOrDefaultAsync<CustomObjectDbM>();

        //If the item does not exists
        if (item == null) throw new ArgumentException($"Item {itemDto.ObjectId} is not existing");

        //transfer any changes from DTO to database objects
        //Update individual properties
        item.UpdateFromDTO(itemDto);

        //Update navigation properties
       ///await navProp_Itemdto_to_ItemDbM(itemDto, item);

        //write to database model
        _dbContext.CustomObjects.Update(item);

        //write to database in a UoW
        await _dbContext.SaveChangesAsync();

        //return the updated item in non-flat mode
        return await ReadItemAsync(item.ObjectId, false);    
    }
    public async Task<ResponseItemDto<ICustomObject>> CreateItemAsync(CustomObjectDto itemDto)
    {
        if (itemDto.ObjectId != null)
            throw new ArgumentException($"{nameof(itemDto.ObjectId)} must be null when creating a new object");
 
        var item = new CustomObjectDbM(itemDto);

        await navProp_Itemdto_to_ItemDbM(itemDto, item);
        _dbContext.CustomObjects.Add(item);

        await _dbContext.SaveChangesAsync();
        
        return await ReadItemAsync(item.ObjectId, false);
    }
    //from all Guid relationships in _itemDtoSrc finds the corresponding object in the database and assigns it to _itemDst 
    //as navigation properties. Error is thrown if no object is found corresponing to an id.
    private async Task navProp_Itemdto_to_ItemDbM(CustomObjectDto itemDtoSrc, CustomObjectDbM itemDst)
    {
        //update ObjectPropertiesDbM from list
        List<ObjectPropertiesDbM> ObjectProperties = null;
        if (itemDtoSrc.PropertiesId != null)
        {
            ObjectProperties = new List<ObjectPropertiesDbM>();
            foreach (var id in itemDtoSrc.PropertiesId)
            {
                var p = await _dbContext.ObjectProperties.FirstOrDefaultAsync(i => i.PropertyId == id);
                if (p == null)
                    throw new ArgumentException($"Item id {id} not existing");

                ObjectProperties.Add(p);
            }
        }
        itemDst.ObjectPropertiesDbM = ObjectProperties;
    }
}