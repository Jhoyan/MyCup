using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace MyCup.Migrations
{
    /// <inheritdoc />
    public partial class AddPlayerLinkRequests : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_players_UniverseId",
                table: "players");

            migrationBuilder.CreateTable(
                name: "player_link_requests",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PlayerId = table.Column<int>(type: "integer", nullable: false),
                    TargetUserId = table.Column<int>(type: "integer", nullable: false),
                    RequestedByUserId = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    RespondedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_player_link_requests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_player_link_requests_players_PlayerId",
                        column: x => x.PlayerId,
                        principalTable: "players",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_player_link_requests_users_RequestedByUserId",
                        column: x => x.RequestedByUserId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_player_link_requests_users_TargetUserId",
                        column: x => x.TargetUserId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_players_UniverseId_UserId",
                table: "players",
                columns: new[] { "UniverseId", "UserId" },
                unique: true,
                filter: "\"UserId\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_player_link_requests_PlayerId",
                table: "player_link_requests",
                column: "PlayerId");

            migrationBuilder.CreateIndex(
                name: "IX_player_link_requests_RequestedByUserId",
                table: "player_link_requests",
                column: "RequestedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_player_link_requests_TargetUserId",
                table: "player_link_requests",
                column: "TargetUserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "player_link_requests");

            migrationBuilder.DropIndex(
                name: "IX_players_UniverseId_UserId",
                table: "players");

            migrationBuilder.CreateIndex(
                name: "IX_players_UniverseId",
                table: "players",
                column: "UniverseId");
        }
    }
}
