using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace MyCup.Migrations
{
    /// <inheritdoc />
    public partial class RemoveMatchStatistic : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "match_statistics");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "match_statistics",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MatchId = table.Column<int>(type: "integer", nullable: false),
                    PlayerId = table.Column<int>(type: "integer", nullable: false),
                    Assists = table.Column<int>(type: "integer", nullable: false),
                    Goals = table.Column<int>(type: "integer", nullable: false),
                    Result = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_match_statistics", x => x.Id);
                    table.ForeignKey(
                        name: "FK_match_statistics_matches_MatchId",
                        column: x => x.MatchId,
                        principalTable: "matches",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_match_statistics_players_PlayerId",
                        column: x => x.PlayerId,
                        principalTable: "players",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_match_statistics_MatchId",
                table: "match_statistics",
                column: "MatchId");

            migrationBuilder.CreateIndex(
                name: "IX_match_statistics_PlayerId",
                table: "match_statistics",
                column: "PlayerId");
        }
    }
}
