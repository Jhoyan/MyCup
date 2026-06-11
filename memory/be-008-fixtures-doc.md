---
name: be-008-fixtures-doc
description: Pointer to the BE-008 fixture generation design document
metadata:
  type: reference
---

The full design for BE-008 (fixture/bracket generation) is in `docs/be-008-fixtures.md` at the repo root.

It covers: generation lifecycle, the three formats (round_robin, knockout incl. double elimination, groups_knockout), config keys (persisted as ChampionshipRule), data-model changes (Match penalties, Match.GroupId, Round.Bracket), the ordered tie-breaker chain, architecture abstractions, edge cases, and the post-MVP backlog the architecture must accommodate.

Read it before implementing or changing anything fixture-related. Decisions summarized in [[backend-business-rules]].
