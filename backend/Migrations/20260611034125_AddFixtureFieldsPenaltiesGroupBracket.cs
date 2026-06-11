using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MyCup.Migrations
{
    /// <inheritdoc />
    public partial class AddFixtureFieldsPenaltiesGroupBracket : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Bracket",
                table: "rounds",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "AwayPenalties",
                table: "matches",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "GroupId",
                table: "matches",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "HomePenalties",
                table: "matches",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_matches_GroupId",
                table: "matches",
                column: "GroupId");

            migrationBuilder.AddForeignKey(
                name: "FK_matches_groups_GroupId",
                table: "matches",
                column: "GroupId",
                principalTable: "groups",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_matches_groups_GroupId",
                table: "matches");

            migrationBuilder.DropIndex(
                name: "IX_matches_GroupId",
                table: "matches");

            migrationBuilder.DropColumn(
                name: "Bracket",
                table: "rounds");

            migrationBuilder.DropColumn(
                name: "AwayPenalties",
                table: "matches");

            migrationBuilder.DropColumn(
                name: "GroupId",
                table: "matches");

            migrationBuilder.DropColumn(
                name: "HomePenalties",
                table: "matches");
        }
    }
}
