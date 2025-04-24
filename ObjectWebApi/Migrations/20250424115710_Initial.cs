using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ObjectWebApi.Migrations
{
    /// <inheritdoc />
    public partial class Initial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "MyObjects",
                columns: table => new
                {
                    ObjectId = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWID()"),
                    ObjectName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ObjectType = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MyObjects", x => x.ObjectId);
                });

            migrationBuilder.CreateTable(
                name: "Settings",
                columns: table => new
                {
                    SettingsId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    JsonData = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Settings", x => x.SettingsId);
                });

            migrationBuilder.CreateTable(
                name: "ObjectProperties",
                columns: table => new
                {
                    ObjectId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Field = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Value = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ObjectProperties", x => new { x.ObjectId, x.Field });
                    table.ForeignKey(
                        name: "FK_ObjectProperties_MyObjects_ObjectId",
                        column: x => x.ObjectId,
                        principalTable: "MyObjects",
                        principalColumn: "ObjectId",
                        onDelete: ReferentialAction.Cascade);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ObjectProperties");

            migrationBuilder.DropTable(
                name: "Settings");

            migrationBuilder.DropTable(
                name: "MyObjects");
        }
    }
}
