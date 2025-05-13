namespace DTO;
public class MyObjectDto
{
    public string ObjectName { get; set; }
    public string ObjectType { get; set; }
    public List<ObjectPropertiesDto> ObjectProperties { get; set; } = new();
    public List<Guid> ChildrenIds { get; set; } = new();  
    public List<Guid> ParentIds { get; set; } = new();
}

public class ObjectPropertiesDto
{
    public string Field { get; set; }
    public string Value { get; set; }
}

public class UpdateObjectDto : MyObjectDto
{
    public Guid ObjectId { get; set; }
}
