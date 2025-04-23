using Models;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Newtonsoft.Json;
using Models.Dto;
using System.Security.Cryptography;

namespace DbModels;

public class ObjectPropertiesDbM : ObjectProperties
{
    [Key]
    public override Guid PropertyId { get; set; }

    [NotMapped]
    public override ICustomObject CustomObject { get => CustomObjectDbM; set => throw new NotImplementedException(); }

    [JsonIgnore]
    [Required]
    public CustomObjectDbM CustomObjectDbM { get; set; }

    public ObjectPropertiesDbM UpdateFromDTO(ObjectPropertiesDto org)
    {
        if (org == null) return null;

        Key = org.Key;

        return this;
    }

    public ObjectPropertiesDbM() { }
    public ObjectPropertiesDbM(ObjectPropertiesDto org)
    {
        PropertyId = Guid.NewGuid();
        UpdateFromDTO(org);
    }

}
