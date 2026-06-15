Always write commit messages in English using the imperative mood (e.g. "add", "fix", "update", not "added", "fixes", "updating").

Follow Conventional Commits. The first line must be `<type>: <description>`. Allowed types:

* feat: a new feature
* fix: a bug fix
* refactor: a code change that neither fixes a bug nor adds a feature
* perf: a code change that improves performance
* docs: documentation only
* style: formatting only, no code behavior change
* test: adding or fixing tests
* build: changes to build system or dependencies
* ci: changes to CI configuration
* chore: other changes that don't modify src or test files

First line: `<type>: <description>` (max 72 chars including the prefix). Lowercase description, imperative mood, no period at the end (e.g. "feat: add championship statistics endpoint").

Second line: blank.

Third line onwards: body explaining what and why (not how). Only include if there is something relevant to explain. Organize on bullet points using *

Never add Co-Authored

Never push without explicit user approval. Always wait for the user to test before pushing.

All code identifiers (variables, files, functions, methods, classes, DTOs, properties, etc.) must be named in English. The only exception is user-facing messages (validation errors, API response messages shown to the user), which should be in Portuguese.