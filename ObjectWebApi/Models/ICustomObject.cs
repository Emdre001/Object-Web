
namespace Models;
public interface ICustomObject
{
    public Guid ObjectId { get; set; }
    public string ObjectName { get; set; } 
    public string ObjectType { get; set; } 
    public List<IObjectProperties> ObjectProperties { get; set; } 
}