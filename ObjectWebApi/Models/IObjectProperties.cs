public class ObjectProperties
{
    [Key]
    public int Id { get; set; }

    [ForeignKey("Object")]
    public Guid ObjectID { get; set; }
    public string Field { get; set; }
    public string Value { get; set; }

    public Object Object { get; set; }
}