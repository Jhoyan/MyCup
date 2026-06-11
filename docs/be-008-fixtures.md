# BE-008 — Fixture Generation Design

Engine that generates a championship's structure (phases → rounds → matches) from its `Format`.
Triggered by an explicit action: `POST /api/championships/{id}/generate`.

Fixtures are played between **teams** (the championship's `ChampionshipTeam` pool). The player→team draw
is independent (a team can have a controlling player or not).

---

## 1. Lifecycle

- **Generate**: explicit endpoint. Builds phases/rounds/matches for the whole championship.
- **Regenerate**: allowed only while **every** match is still `scheduled` (no result yet). Otherwise `409`.
  Regenerating wipes the previous phases/rounds/matches.
- **Pool lock**: teams cannot be added/removed once any match is `ongoing` or `finished` (`409`).
- **Minimum teams**: tournament does not start with insufficient teams (knockout minimum **2**).
- **Bye**: used when the number of teams is odd (round robin) or not a power of two (knockout).
- **Dates**: matches are created `scheduled` with no auto-scheduled date (kept simple for MVP).

## 2. Match result model

- No extra-time entity — only the **final score** is recorded (whether or not extra time happened).
- **Penalties**: `Match.HomePenalties` / `Match.AwayPenalties` (nullable) decide a drawn knockout match.

## 3. Data model changes (this iteration)

| Entity | Field | Type | Purpose |
|--------|-------|------|---------|
| `Match` | `HomePenalties`, `AwayPenalties` | `int?` | shootout result for drawn knockout ties |
| `Match` | `GroupId` | `int?` (FK → `Group`) | associates a group-stage match to its group (for group standings) |
| `Round` | `Bracket` | `string?` | `null` (league/group), `upper`, `lower`, `grand_final`, `third_place` |

Team FKs on `Match` stay required; generation is **round-by-round** (a round's matches are created only
once its teams are known from the previous round's results), so no placeholder/nullable team slots are
needed. If a pre-seeded empty bracket is ever desired, it is an additive change (nullable team FKs +
`HomeSourceMatchId`/`AwaySourceMatchId` self-links) — see backlog.

## 4. Configuration

Sent in the `generate` request body and persisted as `ChampionshipRule` key-values (flexible, no schema
change, records what was used):

| Key | Applies to | Values / default |
|-----|-----------|------------------|
| `double_round` | round_robin, groups | `true`/`false` (default `false`) — single vs home-and-away |
| `third_place` | knockout, groups_knockout | `true`/`false` (default `false`) |
| `elimination` | knockout | `single` (default) / `double` |
| `bracket_seeding` | groups_knockout only | `cross_adjacent` (default) / `seeded_best_vs_worst` / `custom`* |
| `groups_count` | groups_knockout | int |
| `group_size` | groups_knockout | int |
| `qualifiers_per_group` | groups_knockout | int (default `2`) |
| `tiebreakers` | all | ordered list (see §8) |

\* `custom` = explicit bracket table → backlog.

## 5. round_robin

- Circle (Berger) method. Single round by default; `double_round` adds the return leg.
- Odd team count → one **bye** per round.
- Fully supported by the data model.

## 6. knockout

- Bracket size power of two; **bye** for top entrants otherwise. Random draw of the pool.
- Single-leg. Draw decided by **penalties**. Automatic advancement: when every match in a round is
  finished, the next round is generated from the winners.
- Optional **third-place** match (`Round.Bracket = "third_place"`).
- **Double elimination** (optional, `elimination = double`):
  - Upper bracket (`Bracket = "upper"`); the loser of an upper match drops into the lower bracket
    (`Bracket = "lower"`) and stays alive.
  - **Grand final** (`Bracket = "grand_final"`) = last upper survivor vs last lower survivor.
  - MVP: **single grand final** (no bracket reset — see backlog).
  - Delivery: single elimination ships first, double elimination immediately after (architecture ready
    for both from the start).

## 7. groups_knockout

- Groups drawn **randomly**. Each group plays a round robin (single or `double_round`).
- Top `qualifiers_per_group` (default 2) advance.
- Knockout phase seeded by `bracket_seeding`:
  - `cross_adjacent`: 1A×2B, 1B×2A, 1C×2D, … (World-Cup style).
  - `seeded_best_vs_worst`: rank all qualifiers and pair best×worst.
- Group-stage matches carry `Match.GroupId`; standings computed per group.

## 8. Standings tie-breakers (ordered, pluggable chain)

1. Points
2. Goal difference
3. Goals for
4. Wins
5. **Head-to-head** (post-MVP — slot reserved in the ordered chain)
6. Drawing of lots (deterministic final tiebreak)

No cards / fair-play (out of scope: 1 player = 1 team, no individual stats).

## 9. Architecture

- `IFixtureGenerator` implementation per format (round_robin / knockout / groups_knockout).
- `IBracketSeeding` strategy (groups_knockout qualifier pairing).
- Ordered `ITieBreaker` chain for standings.
- Round-by-round generation; advancement and loser-routing (double elim) computed from actual results.

## 10. Edge cases

- Insufficient teams → no generation (knockout min 2).
- Odd team count → bye (round robin); non-power-of-two → bye (knockout).
- Generating/regenerating while matches already have results → `409`.
- Pool altered after generation with matches in progress/finished → blocked.
- Advancing a knockout round with an unresolved draw (no penalties) → error asking for the shootout.
- Group counts that don't form a valid qualifier bracket → validation error.

## 11. Post-MVP backlog (architecture must accommodate — implement later, no big rework)

1. **Two-legged knockout** (aggregate over two matches) + **away-goals** rule.
2. **Best third-placed teams** / World-Cup 48→32 format (cross-group ranking + qualifier-dependent
   bracket table).
3. **Group draw by pots** and **manual** group draw (today: random only).
4. **Head-to-head** tie-breaker (already a slot in the ordered chain).
5. **Custom explicit bracket-seeding table** (`bracket_seeding = custom`).
6. **Double-elimination grand-final bracket reset** (second conditional final).
