
namespace Models;
public interface IObjectProperties
{
    public Guid ObjectId { get; set; }
    public string Key { get; set; }
    public string Value { get; set; }

    public List<CustomObject> Object { get; set; }
}