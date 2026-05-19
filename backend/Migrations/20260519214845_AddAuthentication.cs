using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MyCup.Migrations
{
    /// <inheritdoc />
    public partial class AddAuthentication : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Password",
                table: "users",
                newName: "PasswordHash");

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "users",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "users",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "users",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "universes",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Distribution",
                table: "championships",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Slug",
                table: "championships",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "users");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "users");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "users");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "universes");

            migrationBuilder.DropColumn(
                name: "Distribution",
                table: "championships");

            migrationBuilder.DropColumn(
                name: "Slug",
                table: "championships");

            migrationBuilder.RenameColumn(
                name: "PasswordHash",
                table: "users",
                newName: "Password");
        }
    }
}
