using System;


namespace Models.DTO;

public class GstUsrInfoDbDto
{
    public string Title {get;  set;}
    public int NrCustomObjects { get; set; } = 0;
    public int NrObjectProperties { get; set; } = 0;

}

public class UsrInfoCustomObjectsDto
{
    public string ObjectName { get; set; } = null;
    public string ObjectType { get; set; } = null;
    public int NrObjects { get; set; } = 0;
}

public class UsrInfoObjectPropertiessDto
{
    public string Keys { get; set; } = null;
    public int NrProperties { get; set; } = 0;
}

public class UsrInfoAllDto
{
    public GstUsrInfoDbDto Db { get; set; } = null;
    public List<UsrInfoCustomObjectsDto> CustomObjects { get; set; } = null;
    public List<UsrInfoObjectPropertiessDto> ObjectProperties { get; set; } = null;
   
}


