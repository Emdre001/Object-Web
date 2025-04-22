public class Object
{
    public Guid ObjectID { get; set; }
    public string Name { get; set; }
    public string Type { get; set; }
    public List<ObjectProperties> ObjectProperties { get; set; } = new();
}