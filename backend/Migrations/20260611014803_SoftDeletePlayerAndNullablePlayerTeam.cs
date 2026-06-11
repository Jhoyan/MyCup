using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MyCup.Migrations
{
    /// <inheritdoc />
    public partial class SoftDeletePlayerAndNullablePlayerTeam : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_player_championships_teams_TeamId",
                table: "player_championships");

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "players",
                type: "boolean",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AlterColumn<int>(
                name: "TeamId",
                table: "player_championships",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddForeignKey(
                name: "FK_player_championships_teams_TeamId",
                table: "player_championships",
                column: "TeamId",
                principalTable: "teams",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_player_championships_teams_TeamId",
                table: "player_championships");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "players");

            migrationBuilder.AlterColumn<int>(
                name: "TeamId",
                table: "player_championships",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_player_championships_teams_TeamId",
                table: "player_championships",
                column: "TeamId",
                principalTable: "teams",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
