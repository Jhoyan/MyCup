using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MyCup.Migrations
{
    /// <inheritdoc />
    public partial class AddKnockoutBracketLinks : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "HomeTeamId",
                table: "matches",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<int>(
                name: "AwayTeamId",
                table: "matches",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddColumn<int>(
                name: "AwaySourceMatchId",
                table: "matches",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AwaySourceOutcome",
                table: "matches",
                type: "character varying(10)",
                maxLength: 10,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "HomeSourceMatchId",
                table: "matches",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HomeSourceOutcome",
                table: "matches",
                type: "character varying(10)",
                maxLength: 10,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_matches_AwaySourceMatchId",
                table: "matches",
                column: "AwaySourceMatchId");

            migrationBuilder.CreateIndex(
                name: "IX_matches_HomeSourceMatchId",
                table: "matches",
                column: "HomeSourceMatchId");

            migrationBuilder.AddForeignKey(
                name: "FK_matches_matches_AwaySourceMatchId",
                table: "matches",
                column: "AwaySourceMatchId",
                principalTable: "matches",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_matches_matches_HomeSourceMatchId",
                table: "matches",
                column: "HomeSourceMatchId",
                principalTable: "matches",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_matches_matches_AwaySourceMatchId",
                table: "matches");

            migrationBuilder.DropForeignKey(
                name: "FK_matches_matches_HomeSourceMatchId",
                table: "matches");

            migrationBuilder.DropIndex(
                name: "IX_matches_AwaySourceMatchId",
                table: "matches");

            migrationBuilder.DropIndex(
                name: "IX_matches_HomeSourceMatchId",
                table: "matches");

            migrationBuilder.DropColumn(
                name: "AwaySourceMatchId",
                table: "matches");

            migrationBuilder.DropColumn(
                name: "AwaySourceOutcome",
                table: "matches");

            migrationBuilder.DropColumn(
                name: "HomeSourceMatchId",
                table: "matches");

            migrationBuilder.DropColumn(
                name: "HomeSourceOutcome",
                table: "matches");

            migrationBuilder.AlterColumn<int>(
                name: "HomeTeamId",
                table: "matches",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "AwayTeamId",
                table: "matches",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);
        }
    }
}
