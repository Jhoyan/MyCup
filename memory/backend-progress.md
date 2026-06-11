---
name: backend-progress
description: Current backend implementation progress and the next step to resume
metadata:
  type: project
---

Backend services/controllers progress (as of 2026-06-11, all committed locally on `main`, NOT pushed):

- ✅ Universes, Players, Auth — pre-existing.
- ✅ BE-004 Teams, BE-003 Championships (+ team pool, rules, player enroll/draw/manual), BE-005 Matches, BE-007 UserUniverses (members/roles), BE-006 Dashboard.
- 🟡 BE-008 fixture generation — IN PROGRESS. Design in `docs/be-008-fixtures.md` (see [[be-008-fixtures-doc]]). Done: engine infra (`FixturesService`, `IFixtureGenerator`), `POST /championships/{id}/generate`, pool lock, and the **round_robin** generator (circle method, bye, optional double round). `knockout` and `groups_knockout` are stubbed (throw "ainda não disponível").

**NEXT STEP to resume:** implement the **single-elimination knockout** generator — power-of-two bracket + bye, random draw, penalties, automatic next-round advancement, optional third place. This also requires updating `UpdateMatchResultDto`/`MatchesService` to accept **penalties** and to trigger generation of the next knockout round when a round completes. After that: double elimination, then groups_knockout. Order and rules are in [[backend-business-rules]] and the design doc.

Last commit: `8ec27b9 add fixture generation engine with round-robin generator`. Nothing pushed (push only on explicit request).
