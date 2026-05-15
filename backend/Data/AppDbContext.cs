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
    /// Individual player statistics per match.
    /// </summary>
    public DbSet<MatchStatistic> MatchStatistics => Set<MatchStatistic>();

    /// <summary>
    /// Configures entity mappings, table names, keys, indexes, and relationships.
    /// </summary>
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>().ToTable("users");
        modelBuilder.Entity<Universe>().ToTable("universes");
        modelBuilder.Entity<UserUniverse>().ToTable("user_universes");
        modelBuilder.Entity<Player>().ToTable("players");
        modelBuilder.Entity<Championship>().ToTable("championships");
        modelBuilder.Entity<ChampionshipTeam>().ToTable("championship_teams");
        modelBuilder.Entity<PlayerChampionship>().ToTable("player_championships");
        modelBuilder.Entity<Format>().ToTable("formats");
        modelBuilder.Entity<ChampionshipRule>().ToTable("championship_rules");
        modelBuilder.Entity<Phase>().ToTable("phases");
        modelBuilder.Entity<Group>().ToTable("groups");
        modelBuilder.Entity<GroupTeam>().ToTable("group_teams");
        modelBuilder.Entity<Round>().ToTable("rounds");
        modelBuilder.Entity<Team>().ToTable("teams");
        modelBuilder.Entity<Match>().ToTable("matches");
        modelBuilder.Entity<MatchStatistic>().ToTable("match_statistics");

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
            .HasForeignKey(x => x.TeamId);

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
            .HasOne(x => x.HomeTeam)
            .WithMany(x => x.HomeMatches)
            .HasForeignKey(x => x.HomeTeamId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Match>()
            .HasOne(x => x.AwayTeam)
            .WithMany(x => x.AwayMatches)
            .HasForeignKey(x => x.AwayTeamId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<MatchStatistic>()
            .HasOne(x => x.Match)
            .WithMany(x => x.MatchStatistics)
            .HasForeignKey(x => x.MatchId);

        modelBuilder.Entity<MatchStatistic>()
            .HasOne(x => x.Player)
            .WithMany(x => x.MatchStatistics)
            .HasForeignKey(x => x.PlayerId);
    }
}
