using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace MyCup.Migrations
{
    /// <inheritdoc />
    public partial class SeedFormats : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "formats",
                columns: new[] { "Id", "Type" },
                values: new object[,]
                {
                    { 1, "round_robin" },
                    { 2, "knockout" },
                    { 3, "groups_knockout" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "formats",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "formats",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "formats",
                keyColumn: "Id",
                keyValue: 3);
        }
    }
}
