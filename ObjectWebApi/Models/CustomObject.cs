
namespace Models;
public class CustomObject : ICustomObject
{
    public virtual Guid ObjectId { get; set; }
    public string ObjectName { get; set; }
    public string ObjectType { get; set; }
    public virtual List<IObjectProperties> ObjectProperties { get; set; }
}