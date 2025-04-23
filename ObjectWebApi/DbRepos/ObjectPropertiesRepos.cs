using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using System.Data;

using Models;
using Models.Dto;
using DbModels;
using DbContext;

namespace DbRepos;

public class ObjectPropertiesRepos
{
    private readonly ILogger<ObjectPropertiesRepos> _logger;
    private readonly ObjectDbContext _dbContext;

    #region contructors
    public ObjectPropertiesRepos(ILogger<ObjectPropertiesRepos> logger, ObjectDbContext context)
    {
        _logger = logger;
        _dbContext = context;
    }
    #endregion

    public async Task<ResponseItemDto<IObjectProperties>> ReadItemAsync(Guid id, bool flat)
    {
        IQueryable<ObjectPropertiesDbM> query;
        if (!flat)
        {
            query = _dbContext.ObjectProperties.AsNoTracking()
                .Include(i => i.CustomObjectDbM)
                .Where(i => i.PropertyId == id);
        }
        else
        {
            query = _dbContext.ObjectProperties.AsNoTracking()
                .Where(i => i.PropertyId == id);
        }

        var resp = await query.FirstOrDefaultAsync<IObjectProperties>();
        return new ResponseItemDto<IObjectProperties>()
        {
            DbConnectionKeyUsed = _dbContext.dbConnection,
            Item = resp
        };
    }
    public async Task<ResponsePageDto<IObjectProperties>> ReadItemsAsync(bool seeded, bool flat, string filter, int pageNumber, int pageSize)
    {
        filter ??= "";
        IQueryable<ObjectPropertiesDbM> query;
        if (flat)
        {
            query = _dbContext.ObjectProperties.AsNoTracking();
        }
        else
        {
            query = _dbContext.ObjectProperties.AsNoTracking()
                .Include(i => i.CustomObjectDbM);
        }

        var ret = new ResponsePageDto<IObjectProperties>()
        {/*
            DbConnectionKeyUsed = _dbContext.dbConnection,
            DbItemsCount = await query

            //Adding filter functionality
            .Where(i => (i.Seeded == seeded) && 
                        (i.Name.ToLower().Contains(filter) ||
                         i.strMood.ToLower().Contains(filter) ||
                         i.strKind.ToLower().Contains(filter) ||
                         i.Age.ToString().Contains(filter) ||
                         i.Description.ToLower().Contains(filter))).CountAsync(),

            PageItems = await query

            //Adding filter functionality
            .Where(i => (i.Seeded == seeded) && 
                        (i.Name.ToLower().Contains(filter) ||
                         i.strMood.ToLower().Contains(filter) ||
                         i.strKind.ToLower().Contains(filter) ||
                         i.Age.ToString().Contains(filter) ||
                         i.Description.ToLower().Contains(filter)))

            //Adding paging
            .Skip(pageNumber * pageSize)
            .Take(pageSize)

            .ToListAsync<IObjectProperties>(),

            PageNr = pageNumber,
            PageSize = pageSize
            */
        };
        return ret;
    }
    public async Task<ResponseItemDto<IObjectProperties>> DeleteItemAsync(Guid id)
    {
        var query1 = _dbContext.ObjectProperties
            .Where(i => i.PropertyId == id);

        var item = await query1.FirstOrDefaultAsync<ObjectPropertiesDbM>();

        //If the item does not exists
        if (item == null) throw new ArgumentException($"Item {id} is not existing");

        //delete in the database model
        _dbContext.ObjectProperties.Remove(item);

        //write to database in a UoW
        await _dbContext.SaveChangesAsync();

        return new ResponseItemDto<IObjectProperties>()
        {
            DbConnectionKeyUsed = _dbContext.dbConnection,
            Item = item
        };
    }
    public async Task<ResponseItemDto<IObjectProperties>> UpdateItemAsync(ObjectPropertiesDto itemDto)
    {
        var query1 = _dbContext.ObjectProperties
            .Where(i => i.PropertyId == itemDto.PropertyId);
        var item = await query1
                .Include(i => i.CustomObjectDbM)
                .FirstOrDefaultAsync<ObjectPropertiesDbM>();

        if (item == null) throw new ArgumentException($"Item {itemDto.PropertyId} is not existing");

        //transfer any changes from DTO to database objects
        //Update individual properties 
        item.UpdateFromDTO(itemDto);

        //Update navigation properties
       /// await navProp_ItemCUdto_to_ItemDbM(itemDto, item);

        _dbContext.ObjectProperties.Update(item);

        await _dbContext.SaveChangesAsync();

        //return the updated item in non-flat mode
        return await ReadItemAsync(item.PropertyId, false);    
    }
    public async Task<ResponseItemDto<IObjectProperties>> CreateItemAsync(ObjectPropertiesDto itemDto)
    {
        if (itemDto.PropertyId != null)
            throw new ArgumentException($"{nameof(itemDto.PropertyId)} must be null when creating a new object");

        var item = new ObjectPropertiesDbM(itemDto);

        await navProp_ItemCUdto_to_ItemDbM(itemDto, item);

        //write to database model
        _dbContext.ObjectProperties.Add(item);

        await _dbContext.SaveChangesAsync();

        return await ReadItemAsync(item.PropertyId, false);    
    }
    private async Task navProp_ItemCUdto_to_ItemDbM(ObjectPropertiesDto itemDtoSrc, ObjectPropertiesDbM itemDst)
    {
        //update customObject nav props
        var customObject = await _dbContext.CustomObjects.FirstOrDefaultAsync(
            a => (a.ObjectId == itemDtoSrc.ObjectId));

        if (customObject == null)
            throw new ArgumentException($"Item id {itemDtoSrc.ObjectId} not existing");

        itemDst.CustomObjectDbM = customObject;
    }
}
