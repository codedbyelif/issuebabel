# @issuebabel/linear

Linear issue reference adapter for issuebabel. Detects and validates the `ENG-123` format in commit messages and branch names.

Use this package if your team tracks work in **Linear**. The team key is fully configurable and matching is case-insensitive, so `ENG-123` and `eng-123` are both accepted.

---

## Installation

```sh
npm install @issuebabel/core @issuebabel/linear
```

---

## How It Works

Linear uses `TEAM_KEY-NUMBER` as its issue identifier (e.g. `ENG-42`). This adapter teaches issuebabel to:

- Detect `ENG-42` (or any configured key) anywhere in a commit message
- Validate the format against the configured team key
- Show a clear error if the reference is missing

For example, the following commit is **valid**:

```
feat(ui): add dark mode toggle ENG-42
```

The following commit is **blocked**:

```
feat(ui): add dark mode toggle
# ✖ No issue reference found. Expected format: ENG-42
```

---

## Quick Setup

```sh
npx issuebabel init
```

---

## Manual Setup

### 1. Install packages

```sh
npm install --save-dev @issuebabel/core @issuebabel/linear @issuebabel/hooks husky
```

### 2. Initialize Husky

```sh
npx husky install
```

Add to `package.json`:

```json
{
  "scripts": {
    "prepare": "husky install"
  }
}
```

### 3. Create config

```js
// issuebabel.config.js
import { createLinearAdapter } from '@issuebabel/linear';

export default {
  platform: 'linear',

  // Replace 'ENG' with your Linear team key
  adapter: createLinearAdapter('ENG'),

  // Block commits that don't include a Linear issue reference
  requireIssueRef: true,

  // Allowed commit types
  commitTypes: [
    'feat', 'fix', 'chore', 'docs', 'style',
    'refactor', 'perf', 'test', 'build', 'ci', 'revert',
    'rename', 'move',
  ],

  // Branch name rules
  branch: {
    requireIssueRef: false, // warn but don't block
    allowedTypes: ['feat', 'fix', 'bugfix', 'hotfix', 'chore', 'docs', 'release'],
  },

  lint: {
    command: 'npm run lint',
  },

  build: {
    command: 'npm run build',
    runOn: 'pre-push',
  },
};
```

### 4. Create Husky hooks

```sh
echo 'node_modules/.bin/issuebabel-commit-msg "$1"' > .husky/commit-msg
chmod +x .husky/commit-msg

echo 'node_modules/.bin/issuebabel-pre-push' > .husky/pre-push
chmod +x .husky/pre-push

echo 'node_modules/.bin/issuebabel-pre-commit' > .husky/pre-commit
chmod +x .husky/pre-commit
```

---

## Usage in Code

```ts
import { createLinearAdapter } from '@issuebabel/linear';
import { validateCommitMessage, validateBranchName } from '@issuebabel/core';

const adapter = createLinearAdapter('ENG');

const config = {
  platform: 'linear' as const,
  adapter,
  requireIssueRef: true,
};

// Validate a commit message
const result = validateCommitMessage('feat(ui): add dark mode ENG-42', config);
console.log(result.valid);   // true
console.log(result.errors);  // []

// Validate a branch name
const branch = validateBranchName('feat/eng-42-dark-mode', config);
console.log(branch.valid);   // true
```

---

## Issue Ref Format

Case-insensitive — the adapter normalizes to uppercase internally.

| Format  | Example   | Valid |
|---------|-----------|-------|
| `KEY-N` | `ENG-1`   | ✔ |
| `KEY-N` | `ENG-42`  | ✔ |
| `KEY-N` | `eng-42`  | ✔ (case-insensitive) |
| `KEY-N` | `Eng-42`  | ✔ (case-insensitive) |
| `#N`    | `#42`     | ✖ (GitHub format) |
| No key  | `42`      | ✖ |

---

## Commit Message Format

```
<type>(<scope>): <description> <TEAM_KEY>-<number>
```

### Valid Examples

```sh
feat(ui): add dark mode toggle ENG-42
fix(auth): fix token expiry not refreshing ENG-99
chore: upgrade all dependencies ENG-150
feat!: rename /api/v1 to /api/v2 (breaking) ENG-200
refactor(db): extract repository layer ENG-301
test(ui): add dark mode snapshot tests ENG-42
docs: document dark mode config options ENG-42
perf(search): optimize full-text search query ENG-404
```

### Invalid Examples

```sh
# Missing Linear reference
feat(ui): add dark mode
# ✖ No issue reference found. Expected: ENG-42

# Wrong team key
feat(ui): add dark mode DESIGN-42
# ✖ No issue reference found. Expected: ENG-42

# No type
add dark mode ENG-42
# ✖ Invalid commit message format.
```

---

## Branch Name Format

```
<type>/<team-key>-<number>-<short-description>
```

All lowercase, words separated by hyphens.

### Valid Examples

```sh
feat/eng-42-dark-mode-toggle
fix/eng-99-token-expiry-refresh
hotfix/eng-200-critical-data-loss
chore/eng-150-upgrade-dependencies
docs/eng-42-dark-mode-config
bugfix/eng-303-wrong-sidebar-color
release/4.0.0
```

### Invalid Examples

```sh
# No type prefix
eng-42-dark-mode
# ✖ Invalid branch name format.

# Uppercase
Feat/ENG-42-DarkMode
# ✖ Invalid branch name format (must be lowercase).

# Unknown type
wip/eng-42-something
# ✖ "wip" is not a valid branch type.
```

---

## Git Reference

### Starting a New Feature

```sh
# 1. Pull the latest state of your main branch
git checkout main
git pull

# 2. Create a branch named after your Linear issue
git checkout -b feat/eng-42-dark-mode-toggle

# 3. Make changes, stage them, commit
git add .
git commit -m "feat(ui): add dark mode toggle ENG-42"
# ↑ commit-msg hook validates message + Linear reference

# 4. Push to remote
git push -u origin feat/eng-42-dark-mode-toggle
# ↑ pre-push hook validates branch name and runs build
```

### Fixing a Bug

```sh
git checkout develop
git pull
git checkout -b fix/eng-99-token-expiry

git add .
git commit -m "fix(auth): fix token expiry not refreshing ENG-99"
git push -u origin fix/eng-99-token-expiry
```

### Urgent Hotfix on Production

```sh
# Always branch from main for hotfixes
git checkout main
git pull
git checkout -b hotfix/eng-200-data-loss

git add .
git commit -m "fix(db): prevent data loss on concurrent writes ENG-200"
git push -u origin hotfix/eng-200-data-loss

# After merging to main, also merge to develop
git checkout develop
git merge hotfix/eng-200-data-loss
```

### Staging & Committing

```sh
git add .                          # Stage all changes
git add src/ui/DarkMode.ts         # Stage a specific file
git status                         # See staged vs unstaged
git diff --staged                  # See diff of staged files
git commit -m "feat(ui): add dark mode ENG-42"
```

### Syncing with Remote

```sh
git push                           # Push to remote (triggers pre-push hook)
git push -u origin feat/eng-42-dark-mode  # Push new branch
git pull                           # Pull latest changes
git pull --rebase                  # Pull and rebase
```

### Branch Management

```sh
git branch                         # List local branches
git branch -r                      # List remote branches
git branch -a                      # List all branches
git checkout develop               # Switch to a branch
git branch -d feat/eng-42-dark-mode        # Delete local branch
git push origin --delete feat/eng-42-dark-mode  # Delete remote branch
```

### Inspecting History

```sh
git log                            # Full history
git log --oneline                  # Compact one-line history
git log --oneline --graph --all    # Graph of all branches
git show <commit-hash>             # See a specific commit
git blame src/ui/DarkMode.ts       # See who wrote each line
```

### Undoing Changes

```sh
git restore --staged src/ui/DarkMode.ts  # Unstage a file
git restore src/ui/DarkMode.ts           # Discard local changes
git reset --soft HEAD~1                  # Undo last commit, keep changes
git revert <commit-hash>                 # Reverse a commit with a new commit
```

### Other Useful Commands

```sh
git clone <url>     # Clone a repository
git remote -v       # Check remote URL
git stash           # Temporarily save uncommitted changes
git stash pop       # Restore stashed changes
```

### Shell Commands

```sh
cd projects/my-app   # Navigate into a folder
cd ..                # Go up one level
ls                   # List files and folders
ls -la               # List with details
mkdir src/ui         # Create a new folder
touch src/ui/Dark.ts # Create a new empty file
rm src/ui/Old.ts     # Remove a file
rm -rf dist/         # Remove a folder and all its contents
pwd                  # Print current folder path
cp src/a.ts src/b.ts # Copy a file
mv src/a.ts src/b.ts # Move or rename a file
```

---

## Commit Types

| Type | When to Use | Example |
|------|-------------|---------|
| `feat` | Adding a brand new feature | `feat(ui): add dark mode ENG-42` |
| `fix` | Fixing a bug | `fix(auth): token expiry ENG-99` |
| `chore` | Maintenance, no behavior change | `chore: upgrade dependencies` |
| `test` | Adding or updating tests | `test(ui): dark mode snapshots ENG-42` |
| `style` | Formatting, no logic change | `style: format with prettier` |
| `refactor` | Restructure without behavior change | `refactor(db): extract repository` |
| `docs` | Documentation only | `docs: dark mode config ENG-42` |
| `rename` | Rename a file or folder | `rename: DarkToggle → ThemeToggle` |
| `move` | Move a file or folder | `move: utils → src/shared/utils` |
| `perf` | Performance improvement | `perf(search): optimize query` |
| `build` | Build system or dependency change | `build: add bundle analyzer` |
| `ci` | CI/CD configuration change | `ci: add deploy workflow` |
| `revert` | Revert a previous commit | `revert: feat(ui): add dark mode ENG-42` |

---

## Branch Types

| Branch | Purpose | Naming | Example |
|--------|---------|--------|---------|
| `main` | Always stable and deployable. Never commit directly. | — | `main` |
| `develop` | Collects finished features before a release. | — | `develop` |
| `feature/` | One branch per Linear issue. Merged and deleted when done. | `feature/<key>-<desc>` | `feature/eng-42-dark-mode` |
| `fix/` or `bugfix/` | Non-urgent bug fixes. Opened from `develop`. | `fix/<key>-<desc>` | `fix/eng-99-token-expiry` |
| `hotfix/` | Urgent production fix. Opened from `main`. | `hotfix/<key>-<desc>` | `hotfix/eng-200-data-loss` |
| `release/` | Release preparation. Only bugfixes and version bumps. | `release/<version>` | `release/4.0.0` |
