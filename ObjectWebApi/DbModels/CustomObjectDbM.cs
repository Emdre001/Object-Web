using Models;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Newtonsoft.Json;
using Models.Dto;

namespace DbModels;

public class CustomObjectDbM : CustomObject
{
    [Key]
    public override Guid ObjectId { get; set; }

    [NotMapped]
    public override List<IObjectProperties> ObjectProperties { get => ObjectPropertiesDbM?.ToList<IObjectProperties>(); set => throw new NotImplementedException(); }

    [JsonIgnore]
    public List<ObjectPropertiesDbM> ObjectPropertiesDbM { get; set; }

    public CustomObjectDbM UpdateFromDTO(CustomObjectDto org)
    {
        if (org == null) return null;
        ObjectName = org.ObjectName;
        ObjectType = org.ObjectType;

        return this;
    }

    public CustomObjectDbM() { }
    public CustomObjectDbM(CustomObjectDto org)
    {
        ObjectId = Guid.NewGuid();
        UpdateFromDTO(org);

    }
}
