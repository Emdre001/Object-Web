using System;

namespace Models.Dto;

public class CustomObjectDto
{
    public virtual Guid? ObjectId { get; set; }
    public string ObjectName { get; set; } 
    public string ObjectType { get; set; } 

    public virtual List<Guid> PropertiesId { get; set; } = null;

    public CustomObjectDto() { }

    public CustomObjectDto(ICustomObject org)
    {
        ObjectId = org.ObjectId;
        ObjectName = org.ObjectName;
        ObjectType = org.ObjectType;
     
        PropertiesId = org.ObjectProperties?.Select(p => p.PropertyId).ToList();
    }
}
