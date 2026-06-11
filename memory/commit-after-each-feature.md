---
name: commit-after-each-feature
description: General working preference (all projects) — commit proactively after finishing each feature
metadata:
  type: feedback
---

After finishing developing a feature, **commit it** without waiting to be asked. Prefer commits segmented into clear, concrete units — typically "what I just did" (e.g. one entity's service + controller). This applies to all projects, not just MyCup.

**Why:** the user wants steady, reviewable history and doesn't want to micro-manage when to commit.

**How to apply:**
- When a self-contained piece of work is done and builds, make a commit on the current branch.
- Keep each commit scoped to that concrete unit.
- If the user doesn't want a given commit, they'll ask to remove it.
- Do NOT push — at the end the user asks for a single push explicitly.
- Follow the repo's commit-message conventions (for MyCup, see CLAUDE.md: English, imperative, no Co-Authored).
