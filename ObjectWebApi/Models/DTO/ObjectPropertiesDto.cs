using System;

namespace Models.Dto;

public class ObjectPropertiesDto
{
    public virtual Guid? PropertyId { get; set; }
    public string Key { get; set; }

    public virtual Guid? ObjectId { get; set; } = null;

    public ObjectPropertiesDto () { }

    public ObjectPropertiesDto(IObjectProperties org)
    {
        PropertyId = org.PropertyId;
        Key = org.Key;

        ObjectId = org?.CustomObject?.ObjectId;
    }
}
