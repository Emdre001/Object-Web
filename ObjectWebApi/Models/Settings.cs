using System.ComponentModel.DataAnnotations;

namespace Models;
public class SettingsEntity
{
    [Key]
    public Guid SettingsId { get; set; }
    public string JsonData { get; set; } = string.Empty;
}
public class Settings
{
    public List<Application> Applications { get; set; } = new();
}

public class Application
{
    public string Name { get; set; } = string.Empty;
    public List<MyObject> ApplicationObject { get; set; } = new();
    public List<ParentReference> Parents { get; set; } = new();
}
public class ParentReference
{
    public Guid ObjectId { get; set; }
    public string Description { get; set; } = string.Empty; // ex: "linked to venue", "main parent", etc.
}
