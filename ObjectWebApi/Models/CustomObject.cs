
namespace Models;
public class CustomObject
{
    public Guid ObjectId { get; set; } = Guid.NewGuid();
    public string ObjectName { get; set; } = string.Empty;
    public string ObjectType { get; set; } = string.Empty;
    public List<ObjectProperties> ObjectProperties { get; set; } = new();
}