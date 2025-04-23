using DbRepos;
using Microsoft.Extensions.Logging;
using Models;
using Models.Dto;

namespace Services;

public class CustomObjectServiceDb : ICustomObjectService
{
    private readonly CustomObjectRepos _customObjectRepo;
    private readonly ObjectPropertiesRepos _objectPropertiesRepo;
    private readonly ILogger<CustomObjectServiceDb> _logger;    

    public CustomObjectServiceDb( CustomObjectRepos customObjectRepo, ObjectPropertiesRepos objectPropertiesRepo, ILogger<CustomObjectServiceDb> logger)
    {
        _customObjectRepo = customObjectRepo;
        _objectPropertiesRepo = objectPropertiesRepo;
        _logger = logger;
    }

    public Task<ResponsePageDto<ICustomObject>> ReadCustomObjectsAsync(bool seeded, bool flat, string filter, int pageNumber, int pageSize) => _customObjectRepo.ReadItemsAsync(seeded, flat, filter, pageNumber, pageSize);
    public Task<ResponseItemDto<ICustomObject>> ReadCustomObjectAsync(Guid id, bool flat) => _customObjectRepo.ReadItemAsync(id, flat);
    public Task<ResponseItemDto<ICustomObject>> DeleteCustomObjectAsync(Guid id) => _customObjectRepo.DeleteItemAsync(id);
    public Task<ResponseItemDto<ICustomObject>> UpdateCustomObjectAsync(CustomObjectDto item) => _customObjectRepo.UpdateItemAsync(item);
    public Task<ResponseItemDto<ICustomObject>> CreateCustomObjectAsync(CustomObjectDto item) => _customObjectRepo.CreateItemAsync(item);

    public Task<ResponsePageDto<IObjectProperties>> ReadObjectPropertiesAsync(bool seeded, bool flat, string filter, int pageNumber, int pageSize) => _objectPropertiesRepo.ReadItemsAsync(seeded, flat, filter, pageNumber, pageSize);
    public Task<ResponseItemDto<IObjectProperties>> ReadObjectPropertiesAsync(Guid id, bool flat) => _objectPropertiesRepo.ReadItemAsync(id, flat);
    public Task<ResponseItemDto<IObjectProperties>> DeleteObjectPropertiesAsync(Guid id) => _objectPropertiesRepo.DeleteItemAsync(id);
    public Task<ResponseItemDto<IObjectProperties>> UpdateObjectPropertiesAsync(ObjectPropertiesDto item) => _objectPropertiesRepo.UpdateItemAsync(item);
    public Task<ResponseItemDto<IObjectProperties>> CreateObjectPropertiesAsync(ObjectPropertiesDto item) => _objectPropertiesRepo.CreateItemAsync(item);

}
