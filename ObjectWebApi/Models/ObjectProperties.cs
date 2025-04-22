
namespace Models;
public class ObjectProperties : IObjectProperties
{
    public virtual Guid ObjectId { get; set; }
    public virtual string Key { get; set; }
    public virtual string Value { get; set; }

    public virtual List<CustomObject> Object { get; set; }
}