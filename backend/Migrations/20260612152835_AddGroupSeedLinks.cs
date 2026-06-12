using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MyCup.Migrations
{
    /// <inheritdoc />
    public partial class AddGroupSeedLinks : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AwaySourceGroupId",
                table: "matches",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "AwaySourceGroupRank",
                table: "matches",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "HomeSourceGroupId",
                table: "matches",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "HomeSourceGroupRank",
                table: "matches",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_matches_AwaySourceGroupId",
                table: "matches",
                column: "AwaySourceGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_matches_HomeSourceGroupId",
                table: "matches",
                column: "HomeSourceGroupId");

            migrationBuilder.AddForeignKey(
                name: "FK_matches_groups_AwaySourceGroupId",
                table: "matches",
                column: "AwaySourceGroupId",
                principalTable: "groups",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_matches_groups_HomeSourceGroupId",
                table: "matches",
                column: "HomeSourceGroupId",
                principalTable: "groups",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_matches_groups_AwaySourceGroupId",
                table: "matches");

            migrationBuilder.DropForeignKey(
                name: "FK_matches_groups_HomeSourceGroupId",
                table: "matches");

            migrationBuilder.DropIndex(
                name: "IX_matches_AwaySourceGroupId",
                table: "matches");

            migrationBuilder.DropIndex(
                name: "IX_matches_HomeSourceGroupId",
                table: "matches");

            migrationBuilder.DropColumn(
                name: "AwaySourceGroupId",
                table: "matches");

            migrationBuilder.DropColumn(
                name: "AwaySourceGroupRank",
                table: "matches");

            migrationBuilder.DropColumn(
                name: "HomeSourceGroupId",
                table: "matches");

            migrationBuilder.DropColumn(
                name: "HomeSourceGroupRank",
                table: "matches");
        }
    }
}
