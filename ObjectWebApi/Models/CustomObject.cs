
namespace Models;
public class CustomObject : ICustomObject
{
    public virtual Guid ObjectId { get; set; } = Guid.NewGuid();
    public virtual string ObjectName { get; set; } = string.Empty;
    public virtual string ObjectType { get; set; } = string.Empty;
    public virtual List<ObjectProperties> ObjectProperties { get; set; } = new();
}