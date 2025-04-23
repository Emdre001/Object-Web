
namespace Models;
public class ObjectProperties : IObjectProperties
{
    public virtual Guid PropertyId { get; set; }
    public virtual string Key { get; set; }

    public virtual ICustomObject CustomObject { get; set; }
}