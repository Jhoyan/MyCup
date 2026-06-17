using Microsoft.EntityFrameworkCore;
using MyCup.Models;

namespace MyCup.Data;

/// <summary>
/// Main Entity Framework Core context that maps all domain entities and relationships for EasyCup.
/// </summary>
public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    /// <summary>
    /// Users registered in the platform.
    /// </summary>
    public DbSet<User> Users => Set<User>();

    /// <summary>
    /// Universes where championships and permissions are organized.
    /// </summary>
    public DbSet<Universe> Universes => Set<Universe>();

    /// <summary>
    /// User-to-universe membership entries with role information.
    /// </summary>
    public DbSet<UserUniverse> UserUniverses => Set<UserUniverse>();

    /// <summary>
    /// Player profiles participating in universes and championships.
    /// </summary>
    public DbSet<Player> Players => Set<Player>();

    /// <summary>
    /// Championships organized inside universes.
    /// </summary>
    public DbSet<Championship> Championships => Set<Championship>();

    /// <summary>
    /// Team entries enrolled in championships.
    /// </summary>
    public DbSet<ChampionshipTeam> ChampionshipTeams => Set<ChampionshipTeam>();

    /// <summary>
    /// Player enrollment entries in championships with assigned teams.
    /// </summary>
    public DbSet<PlayerChampionship> PlayerChampionships => Set<PlayerChampionship>();

    /// <summary>
    /// Championship format catalog.
    /// </summary>
    public DbSet<Format> Formats => Set<Format>();

    /// <summary>
    /// Key-value rules configured per championship.
    /// </summary>
    public DbSet<ChampionshipRule> ChampionshipRules => Set<ChampionshipRule>();

    /// <summary>
    /// Championship phases.
    /// </summary>
    public DbSet<Phase> Phases => Set<Phase>();

    /// <summary>
    /// Groups inside group-based phases.
    /// </summary>
    public DbSet<Group> Groups => Set<Group>();

    /// <summary>
    /// Team allocation entries for groups.
    /// </summary>
    public DbSet<GroupTeam> GroupTeams => Set<GroupTeam>();

    /// <summary>
    /// Rounds inside phases.
    /// </summary>
    public DbSet<Round> Rounds => Set<Round>();

    /// <summary>
    /// Teams available for championships and matches.
    /// </summary>
    public DbSet<Team> Teams => Set<Team>();

    /// <summary>
    /// Matches scheduled in rounds.
    /// </summary>
    public DbSet<Match> Matches => Set<Match>();

    /// <summary>
    /// Refresh tokens issued to users (one row per active session).
    /// </summary>
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    /// <summary>
    /// Requests asking a user to take ownership of (link their account to) a player.
    /// </summary>
    public DbSet<PlayerLinkRequest> PlayerLinkRequests => Set<PlayerLinkRequest>();

/// <summary>
    /// Configures entity mappings, table names, keys, indexes, and relationships.
    /// </summary>
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>().ToTable("users");
        modelBuilder.Entity<RefreshToken>().ToTable("refresh_tokens");
        modelBuilder.Entity<Universe>().ToTable("universes");
        modelBuilder.Entity<UserUniverse>().ToTable("user_universes");
        modelBuilder.Entity<Player>().ToTable("players");
        modelBuilder.Entity<Championship>().ToTable("championships");
        modelBuilder.Entity<ChampionshipTeam>().ToTable("championship_teams");
        modelBuilder.Entity<PlayerChampionship>().ToTable("player_championships");
        modelBuilder.Entity<Format>().ToTable("formats");

        // Seed the supported championship formats. Their Type values are the keys the fixture generators
        // are registered under (see Program.cs / IFixtureGenerator.Format), so they must match exactly.
        modelBuilder.Entity<Format>().HasData(
            new Format { Id = 1, Type = "round_robin" },
            new Format { Id = 2, Type = "knockout" },
            new Format { Id = 3, Type = "groups_knockout" });
        modelBuilder.Entity<ChampionshipRule>().ToTable("championship_rules");
        modelBuilder.Entity<Phase>().ToTable("phases");
        modelBuilder.Entity<Group>().ToTable("groups");
        modelBuilder.Entity<GroupTeam>().ToTable("group_teams");
        modelBuilder.Entity<Round>().ToTable("rounds");
        modelBuilder.Entity<Team>().ToTable("teams");
        modelBuilder.Entity<Match>().ToTable("matches");
        modelBuilder.Entity<PlayerLinkRequest>().ToTable("player_link_requests");

        modelBuilder.Entity<UserUniverse>()
            .HasKey(x => new { x.UserId, x.UniverseId });

        modelBuilder.Entity<ChampionshipTeam>()
            .HasKey(x => new { x.ChampionshipId, x.TeamId });

        modelBuilder.Entity<GroupTeam>()
            .HasKey(x => new { x.GroupId, x.TeamId });

        modelBuilder.Entity<User>()
            .HasIndex(x => x.Email)
            .IsUnique();

        modelBuilder.Entity<UserUniverse>()
            .HasOne(x => x.User)
            .WithMany(x => x.UserUniverses)
            .HasForeignKey(x => x.UserId);

        modelBuilder.Entity<UserUniverse>()
            .HasOne(x => x.Universe)
            .WithMany(x => x.UserUniverses)
            .HasForeignKey(x => x.UniverseId);

        modelBuilder.Entity<Player>()
            .HasOne(x => x.User)
            .WithMany(x => x.Players)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Player>()
            .HasOne(x => x.Universe)
            .WithMany(x => x.Players)
            .HasForeignKey(x => x.UniverseId);

        // A user controls at most one player per universe. Partial index so unlinked players (UserId NULL)
        // are never constrained against each other.
        modelBuilder.Entity<Player>()
            .HasIndex(x => new { x.UniverseId, x.UserId })
            .IsUnique()
            .HasFilter("\"UserId\" IS NOT NULL");

        modelBuilder.Entity<PlayerLinkRequest>()
            .HasOne(x => x.Player)
            .WithMany()
            .HasForeignKey(x => x.PlayerId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<PlayerLinkRequest>()
            .HasOne(x => x.TargetUser)
            .WithMany()
            .HasForeignKey(x => x.TargetUserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<PlayerLinkRequest>()
            .HasOne(x => x.RequestedByUser)
            .WithMany()
            .HasForeignKey(x => x.RequestedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Team>()
            .HasOne(x => x.Universe)
            .WithMany(x => x.Teams)
            .HasForeignKey(x => x.UniverseId);

        modelBuilder.Entity<Championship>()
            .HasOne(x => x.Universe)
            .WithMany(x => x.Championships)
            .HasForeignKey(x => x.UniverseId);

        modelBuilder.Entity<Championship>()
            .HasOne(x => x.Format)
            .WithMany(x => x.Championships)
            .HasForeignKey(x => x.FormatId);

        modelBuilder.Entity<ChampionshipTeam>()
            .HasOne(x => x.Championship)
            .WithMany(x => x.ChampionshipTeams)
            .HasForeignKey(x => x.ChampionshipId);

        modelBuilder.Entity<ChampionshipTeam>()
            .HasOne(x => x.Team)
            .WithMany(x => x.ChampionshipTeams)
            .HasForeignKey(x => x.TeamId);

        modelBuilder.Entity<PlayerChampionship>()
            .HasOne(x => x.Player)
            .WithMany(x => x.PlayerChampionships)
            .HasForeignKey(x => x.PlayerId);

        modelBuilder.Entity<PlayerChampionship>()
            .HasOne(x => x.Championship)
            .WithMany(x => x.PlayerChampionships)
            .HasForeignKey(x => x.ChampionshipId);

        modelBuilder.Entity<PlayerChampionship>()
            .HasOne(x => x.Team)
            .WithMany(x => x.PlayerChampionships)
            .HasForeignKey(x => x.TeamId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<ChampionshipRule>()
            .HasOne(x => x.Championship)
            .WithMany(x => x.ChampionshipRules)
            .HasForeignKey(x => x.ChampionshipId);

        modelBuilder.Entity<Phase>()
            .HasOne(x => x.Championship)
            .WithMany(x => x.Phases)
            .HasForeignKey(x => x.ChampionshipId);

        modelBuilder.Entity<Group>()
            .HasOne(x => x.Phase)
            .WithMany(x => x.Groups)
            .HasForeignKey(x => x.PhaseId);

        modelBuilder.Entity<GroupTeam>()
            .HasOne(x => x.Group)
            .WithMany(x => x.GroupTeams)
            .HasForeignKey(x => x.GroupId);

        modelBuilder.Entity<GroupTeam>()
            .HasOne(x => x.Team)
            .WithMany(x => x.GroupTeams)
            .HasForeignKey(x => x.TeamId);

        modelBuilder.Entity<Round>()
            .HasOne(x => x.Phase)
            .WithMany(x => x.Rounds)
            .HasForeignKey(x => x.PhaseId);

        modelBuilder.Entity<Match>()
            .HasOne(x => x.Round)
            .WithMany(x => x.Matches)
            .HasForeignKey(x => x.RoundId);

        modelBuilder.Entity<Match>()
            .HasOne(x => x.Group)
            .WithMany(x => x.Matches)
            .HasForeignKey(x => x.GroupId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Match>()
            .HasOne(x => x.HomeTeam)
            .WithMany(x => x.HomeMatches)
            .HasForeignKey(x => x.HomeTeamId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Match>()
            .HasOne(x => x.AwayTeam)
            .WithMany(x => x.AwayMatches)
            .HasForeignKey(x => x.AwayTeamId)
            .OnDelete(DeleteBehavior.Restrict);

        // Self-references linking a knockout match to the matches that feed its slots. SetNull so that
        // wiping a bracket (regeneration / cascade delete) never trips the self FK.
        modelBuilder.Entity<Match>()
            .HasOne(x => x.HomeSourceMatch)
            .WithMany()
            .HasForeignKey(x => x.HomeSourceMatchId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Match>()
            .HasOne(x => x.AwaySourceMatch)
            .WithMany()
            .HasForeignKey(x => x.AwaySourceMatchId)
            .OnDelete(DeleteBehavior.SetNull);

        // Group-position seeding for the groups_knockout knockout phase (no inverse navigation; the
        // group's Matches collection is reserved for its own group-stage matches via Match.GroupId).
        modelBuilder.Entity<Match>()
            .HasOne(x => x.HomeSourceGroup)
            .WithMany()
            .HasForeignKey(x => x.HomeSourceGroupId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Match>()
            .HasOne(x => x.AwaySourceGroup)
            .WithMany()
            .HasForeignKey(x => x.AwaySourceGroupId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<RefreshToken>()
            .HasOne(x => x.User)
            .WithMany(x => x.RefreshTokens)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Refresh is a lookup by token value, so index it.
        modelBuilder.Entity<RefreshToken>()
            .HasIndex(x => x.Token);

    }
}
