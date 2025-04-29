using System;

namespace Models;
public class MyObject
{
    public Guid ObjectId { get; set; }
    public string ObjectName { get; set; }
    public string ObjectType { get; set; }
    public List<ObjectProperties> ObjectProperties { get; set; } = new();

    // Self-referencing parent-child relationship
    public List<MyObject> Parents { get; set; } // Navigation property to Parent
    public List<MyObject> Childrens { get; set; } = new(); // Navigation property to Children
}


public class ObjectProperties
{
    public Guid ObjectId { get; set; }
    public string Field { get; set; }
    public string Value { get; set; }
}

