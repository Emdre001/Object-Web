
namespace Models;
public class ObjectProperties
{
<<<<<<< HEAD
    public Guid ObjectId { get; set; }
    public string Key { get; set; }
=======
    [Key]
    public int Id { get; set; }

    [ForeignKey("Object")]
    public Guid ObjectID { get; set; }
    public string Field { get; set; }
>>>>>>> 6c547b6ca49781ea59c81e794d82586dd3f9e247
    public string Value { get; set; }

    public Object Object { get; set; }
}