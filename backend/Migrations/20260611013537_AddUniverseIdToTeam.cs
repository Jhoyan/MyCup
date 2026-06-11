using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MyCup.Migrations
{
    /// <inheritdoc />
    public partial class AddUniverseIdToTeam : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "UniverseId",
                table: "teams",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_teams_UniverseId",
                table: "teams",
                column: "UniverseId");

            migrationBuilder.AddForeignKey(
                name: "FK_teams_universes_UniverseId",
                table: "teams",
                column: "UniverseId",
                principalTable: "universes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_teams_universes_UniverseId",
                table: "teams");

            migrationBuilder.DropIndex(
                name: "IX_teams_UniverseId",
                table: "teams");

            migrationBuilder.DropColumn(
                name: "UniverseId",
                table: "teams");
        }
    }
}
