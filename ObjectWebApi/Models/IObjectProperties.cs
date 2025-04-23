
namespace Models;
public interface IObjectProperties
{
    public Guid PropertyId { get; set; }
    public string Key { get; set; }

    public ICustomObject CustomObject { get; set; }
}