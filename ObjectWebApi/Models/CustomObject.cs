using Seido.Utilities.SeedGenerator;

namespace Models;
public class CustomObject : ICustomObject , ISeed<CustomObject>
{
    public virtual Guid ObjectId { get; set; }
    public string ObjectName { get; set; }
    public string ObjectType { get; set; }
    public virtual List<IObjectProperties> ObjectProperties { get; set; }

    public bool Seeded { get; set; } = false;
    public virtual CustomObject Seed (SeedGenerator seeder)
    {
        ObjectId = Guid.NewGuid();
        ObjectName = seeder.PetName;
        ObjectType = seeder.MusicAlbumName;
        return this;
    }
}