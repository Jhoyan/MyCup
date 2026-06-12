---
name: update-tasks-md-on-completion
description: Standing instruction — update tasks.md whenever a roadmap task is finished
metadata:
  type: feedback
---

Whenever I finish a roadmap task (a `BE-xxx` / `FE-xxx` / `INT-xxx` item), update `tasks.md`: tick the checkbox (`- [ ]` → `- [x]`), change the status emoji to ✅, and add a short note of what was delivered.

**Why:** the user wants `tasks.md` to stay an accurate, live picture of project progress (it had drifted badly — many done items were still unchecked).

**How to apply:** edit `tasks.md` as part of finishing the task (same change set / commit), not as a separate afterthought. Reconcile stale entries opportunistically. Note the file's "Última atualização" date when convenient.
