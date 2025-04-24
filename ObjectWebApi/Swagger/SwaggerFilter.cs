using Microsoft.OpenApi.Any;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using System;
namespace Filter;
public class SettingsSchemaExampleFilter : ISchemaFilter
{
    public void Apply(OpenApiSchema schema, SchemaFilterContext context)
    {
        if (context.Type == typeof(Guid) || context.Type == typeof(Guid?))
        {
            schema.Example = new OpenApiString(Guid.NewGuid().ToString());
        }
    }
}
