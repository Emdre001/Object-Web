using Models;
using Models.Dto;

namespace Services;

public interface ICustomObjectService {
    public Task<ResponsePageDto<ICustomObject>> ReadCustomObjectsAsync(bool seeded, bool flat, string filter, int pageNumber, int pageSize);
    public Task<ResponseItemDto<ICustomObject>> ReadCustomObjectAsync(Guid id, bool flat);
    public Task<ResponseItemDto<ICustomObject>> DeleteCustomObjectAsync(Guid id);
    public Task<ResponseItemDto<ICustomObject>> UpdateCustomObjectAsync(CustomObjectDto item);
    public Task<ResponseItemDto<ICustomObject>> CreateCustomObjectAsync(CustomObjectDto item);

    public Task<ResponsePageDto<IObjectProperties>> ReadObjectPropertiesAsync(bool seeded, bool flat, string filter, int pageNumber, int pageSize);
    public Task<ResponseItemDto<IObjectProperties>> ReadObjectPropertiesAsync(Guid id, bool flat);
    public Task<ResponseItemDto<IObjectProperties>> DeleteObjectPropertiesAsync(Guid id);
    public Task<ResponseItemDto<IObjectProperties>> UpdateObjectPropertiesAsync(ObjectPropertiesDto item);
    public Task<ResponseItemDto<IObjectProperties>> CreateObjectPropertiesAsync(ObjectPropertiesDto item);

}
