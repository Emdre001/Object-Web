using Seido.Utilities.SeedGenerator;

namespace Models;
public class ObjectProperties : IObjectProperties , ISeed<ObjectProperties>
{
    public virtual Guid PropertyId { get; set; }
    public virtual string Key { get; set; }

    public virtual ICustomObject CustomObject { get; set; }
    public bool Seeded { get; set; } = false;

    public virtual ObjectProperties Seed (SeedGenerator seeder)
    {
        Seeded = true;
        PropertyId = Guid.NewGuid();
        Key = seeder.LatinParagraph;
        
        return this;
    }
    
}