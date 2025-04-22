
namespace Models;
public class ObjectProperties
{
    public Guid ObjectId { get; set; }
    public string Key { get; set; }
    public string Value { get; set; }

    public CustomObject Object { get; set; }
}