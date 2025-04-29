using System.ComponentModel.DataAnnotations;

namespace Models;
public class SettingsEntity
{
    [Key]
    public Guid SettingsId { get; set; }
    public string SettingEntityName { get; set; }
    public string JsonData { get; set; } = string.Empty;
}
public class Settings
{
    public List<Application> Applications { get; set; } = new();
}

public class Application
{   
    public Guid AppId { get; set; }
    public string Name { get; set; } = string.Empty;
    public List<ObjectType> ObjectType { get; set; } = new();
    //public List<ParentReference> Parents { get; set; } = new();
}
//public class ParentReference

 public class ObjectType
{
    public string Name { get; set; }
    public List<string> ParentObjectTypes { get; set; } = new();
    public List<Field> Fields { get; set; } = new();
}

public class Field 
{
    public string FieldName { get; set;}
    public string Editor { get; set; } //textbox? input?
    public string Defaults { get; set; } //kryssruta med true/false ect.
}
