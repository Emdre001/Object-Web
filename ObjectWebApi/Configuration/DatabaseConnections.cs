using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;

namespace Configuration;

public enum DatabaseServer {SQLServer, MySql, PostgreSql, SQLite}
public class DatabaseConnections
{
    readonly IConfiguration _configuration;
    readonly DbConnectionSetsOptions _options;
    private readonly DbSetDetailOptions _activeDataSet;
 
    public SetupInformation SetupInfo => new SetupInformation () {

            SecretSource = _configuration.GetValue<bool>("ApplicationSecrets:UseAzureKeyVault")
                ?$"Azure: {Environment.GetEnvironmentVariable("AZURE_KeyVaultSecret")}"
                :$"Usersecret: {Environment.GetEnvironmentVariable("USERSECRETID")}",
            
            DefaultDataUser = _configuration["DatabaseConnections:DefaultDataUser"],
            MigrationDataUser = _configuration["DatabaseConnections:MigrationDataUser"],
            
            DataConnectionTag = _activeDataSet.DbTag,
            
            DataConnectionServer = _activeDataSet.DbServer.Trim().ToLower() switch {
                "sqlserver" => DatabaseServer.SQLServer,    
                "mysql" => DatabaseServer.MySql,
                "postgresql" => DatabaseServer.PostgreSql,
                "sqlite" => DatabaseServer.SQLite,
                _ => throw new NotSupportedException ($"DbServer {_activeDataSet.DbServer} not supported")},

            };

    

    public class SetupInformation
    {
        public string AppEnvironment => Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
        public string SecretSource {get; init;}
        public string DataConnectionTag {get; init;}
        public string DefaultDataUser {get; init;}
        public string MigrationDataUser {get; init;}
        public DatabaseServer DataConnectionServer {get; init;}
        public string DataConnectionServerString => DataConnectionServer.ToString();  //for json clear text
    }
}