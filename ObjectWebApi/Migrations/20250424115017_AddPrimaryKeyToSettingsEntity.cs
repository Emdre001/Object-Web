using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ObjectWebApi.Migrations
{
    /// <inheritdoc />
    public partial class AddPrimaryKeyToSettingsEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Id",
                table: "Settings",
                newName: "SettingsId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "SettingsId",
                table: "Settings",
                newName: "Id");
        }
    }
}
