# @issuebabel/github

GitHub issue reference adapter for issuebabel. Detects and validates the `#123` format in commit messages and branch names.

Use this package if your team tracks work in **GitHub Issues**. When installed, every commit must reference a GitHub issue number (e.g. `#123`) and every branch name must follow the configured convention.

---

## Installation

```sh
npm install @issuebabel/core @issuebabel/github
```

---

## How It Works

GitHub uses `#123` as its issue reference format. This adapter teaches issuebabel to:

- Detect `#123` anywhere in a commit message
- Validate that the issue reference is correctly formatted
- Show a clear error if it is missing

For example, the following commit is **valid**:

```
feat(auth): add OAuth2 login #123
```

The following commit is **blocked** (missing issue ref):

```
feat(auth): add OAuth2 login
# ✖ No issue reference found. Expected format: #123
```

---

## Quick Setup

```sh
npx issuebabel init
```

This automatically installs Husky and creates the `.husky/` hook files. The platform is auto-detected from your git remote.

---

## Manual Setup

### 1. Install packages

```sh
npm install --save-dev @issuebabel/core @issuebabel/github @issuebabel/hooks husky
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
import { githubAdapter } from '@issuebabel/github';

export default {
  platform: 'github',
  adapter: githubAdapter,

  // Block commits that don't include a GitHub issue reference
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

  // Lint on every commit
  lint: {
    command: 'npm run lint',
  },

  // Build on every push
  build: {
    command: 'npm run build',
    runOn: 'pre-push',
  },
};
```

### 4. Create Husky hooks

```sh
# Validate commit message format
echo 'node_modules/.bin/issuebabel-commit-msg "$1"' > .husky/commit-msg
chmod +x .husky/commit-msg

# Validate branch name + run build on push
echo 'node_modules/.bin/issuebabel-pre-push' > .husky/pre-push
chmod +x .husky/pre-push

# Run lint before every commit
echo 'node_modules/.bin/issuebabel-pre-commit' > .husky/pre-commit
chmod +x .husky/pre-commit
```

---

## Usage in Code

```ts
import { githubAdapter } from '@issuebabel/github';
import { validateCommitMessage, validateBranchName } from '@issuebabel/core';

const config = {
  platform: 'github' as const,
  adapter: githubAdapter,
  requireIssueRef: true,
};

// Validate a commit message
const result = validateCommitMessage('feat(auth): add login #123', config);
console.log(result.valid);   // true
console.log(result.errors);  // []

// Validate a branch name
const branch = validateBranchName('feat/123-add-login', config);
console.log(branch.valid);   // true
```

---

## Issue Ref Format

| Format | Example | Valid |
|--------|---------|-------|
| `#N` | `#1` | ✔ |
| `#N` | `#123` | ✔ |
| `#N` | `#99999` | ✔ |
| Without `#` | `123` | ✖ |
| With letters | `#abc` | ✖ |

---

## Commit Message Format

```
<type>(<scope>): <description> #<issue-number>
```

The issue number can appear anywhere in the message — beginning, middle, or end.

### Valid Examples

```sh
feat(auth): add OAuth2 login #123
fix(api): prevent crash on null response #456
chore: upgrade all dependencies #789
feat!: remove /v1 endpoints (breaking change) #99
refactor(db): extract query builder class #200
test(auth): add unit tests for login flow #123
docs: update README with new config options #55
perf(search): add database index on email field #301
```

### Invalid Examples

```sh
# Missing issue reference
feat(auth): add login
# ✖ No issue reference found. Expected: #123

# Wrong format
add login feature
# ✖ Invalid commit message format.
#   Expected: <type>(<scope>): <description> #<issue>
#   Example:  feat(auth): add login page #123

# Unknown commit type
wip: working on login
# ✖ "wip" is not a valid commit type.
#   Allowed types: feat, fix, chore, docs, ...
```

---

## Branch Name Format

```
<type>/<issue-number>-<short-description>
```

Words separated by hyphens, all lowercase.

### Valid Examples

```sh
feat/123-add-oauth2-login
fix/456-null-crash-api-response
hotfix/789-critical-payment-bug
chore/update-all-dependencies
docs/update-readme-config-section
bugfix/101-wrong-user-redirect
release/2.1.0
```

### Invalid Examples

```sh
# Missing type prefix
add-login-page
# ✖ Invalid branch name format.
#   Expected: <type>/<description>

# Unknown type
wip/123-something
# ✖ "wip" is not a valid branch type.

# Uppercase letters
Feat/123-AddLogin
# ✖ Invalid branch name format (must be lowercase).
```

---

## Git Reference

### Starting a New Feature

```sh
# 1. Make sure you are on the latest main
git checkout main
git pull

# 2. Create a new feature branch
git checkout -b feat/123-add-oauth2-login

# 3. Make your changes, then stage them
git add .

# 4. Commit — the commit-msg hook validates your message automatically
git commit -m "feat(auth): add OAuth2 login #123"

# 5. Push the branch to GitHub
git push -u origin feat/123-add-oauth2-login
# ↑ The pre-push hook validates the branch name and runs the build
```

### Fixing a Bug

```sh
# 1. Branch from develop (or main)
git checkout develop
git pull
git checkout -b fix/456-null-crash-api

# 2. Fix the bug, stage, commit
git add .
git commit -m "fix(api): prevent crash on null response #456"

# 3. Push
git push -u origin fix/456-null-crash-api
```

### Urgent Hotfix on Production

```sh
# 1. Branch directly from main
git checkout main
git pull
git checkout -b hotfix/789-payment-crash

# 2. Fix, commit, push
git add .
git commit -m "fix(payment): prevent duplicate charge on retry #789"
git push -u origin hotfix/789-payment-crash

# 3. After merging to main, also merge to develop
git checkout develop
git merge hotfix/789-payment-crash
```

### Staging & Committing

```sh
# Stage all changed files
git add .

# Stage a specific file
git add src/auth/login.ts

# See what is staged vs unstaged
git status

# See the diff of staged changes
git diff --staged

# Commit with a message (triggers commit-msg and pre-commit hooks)
git commit -m "feat(auth): add login page #123"
```

### Syncing with Remote

```sh
# Push commits to GitHub (triggers pre-push hook)
git push

# Push a new branch for the first time
git push -u origin feat/123-add-login

# Pull latest changes from GitHub
git pull

# Pull and rebase to avoid a merge commit
git pull --rebase
```

### Branch Management

```sh
# List local branches
git branch

# List remote branches on GitHub
git branch -r

# List all branches (local + remote)
git branch -a

# Switch to an existing branch
git checkout develop

# Delete a local branch after it has been merged
git branch -d feat/123-add-login

# Delete a remote branch on GitHub
git push origin --delete feat/123-add-login
```

### Inspecting History

```sh
# Full commit history
git log

# Compact one-line history
git log --oneline

# Graph showing all branches
git log --oneline --graph --all

# See what changed in a specific commit
git show <commit-hash>

# See who wrote each line of a file
git blame src/auth/login.ts
```

### Undoing Changes

```sh
# Unstage a file (keep changes in working directory)
git restore --staged src/auth/login.ts

# Discard local changes to a file
git restore src/auth/login.ts

# Undo the last commit, keep changes staged
git reset --soft HEAD~1

# Reverse a commit by creating a new one
git revert <commit-hash>
```

### Other Useful Commands

```sh
# Clone a repository from GitHub
git clone https://github.com/your-org/your-repo.git

# Check remote URLs
git remote -v

# Temporarily save uncommitted changes
git stash

# Restore stashed changes
git stash pop
```

### Shell Commands

```sh
# Navigate into a folder
cd projects/my-app

# Go up one level
cd ..

# List files and folders
ls

# List with details (permissions, sizes, dates)
ls -la

# Create a new folder
mkdir src/components

# Create a new empty file
touch src/components/Button.ts

# Remove a file
rm src/components/OldButton.ts

# Remove a folder and everything inside
rm -rf dist/

# Print the current folder path
pwd

# Copy a file
cp src/Button.ts src/Button.backup.ts

# Rename or move a file
mv src/Button.ts src/components/Button.ts
```

---

## Commit Types

| Type | When to Use | Example |
|------|-------------|---------|
| `feat` | Adding a brand new feature | `feat(auth): add Google login #12` |
| `fix` | Fixing a bug | `fix(api): handle null response #34` |
| `chore` | Maintenance that doesn't change app behavior | `chore: upgrade eslint to v9` |
| `test` | Adding or updating tests | `test(auth): add login unit tests #12` |
| `style` | Formatting, whitespace — no logic change | `style: format files with prettier` |
| `refactor` | Restructuring code without changing behavior | `refactor(db): extract query builder` |
| `docs` | Documentation changes only | `docs: add API usage to README` |
| `rename` | Renaming a file or folder | `rename: LoginPage → AuthPage` |
| `move` | Moving a file or folder | `move: utils → src/shared/utils` |
| `perf` | Performance improvements | `perf(db): add index on users.email` |
| `build` | Build system or dependency changes | `build: add webpack bundle analyzer` |
| `ci` | CI/CD configuration changes | `ci: add GitHub Actions deploy workflow` |
| `revert` | Reverting a previous commit | `revert: feat(auth): add Google login #12` |

---

## Branch Types

| Branch | Purpose | Naming | Example |
|--------|---------|--------|---------|
| `main` | Always stable and deployable. The source of truth. Never commit directly. | — | `main` |
| `develop` | Collects finished features before a release. Optional but recommended. | — | `develop` |
| `feature/` | One branch per feature. Opened from `develop`, merged back and deleted. | `feature/<issue>-<description>` | `feature/123-add-login` |
| `fix/` or `bugfix/` | For non-urgent bug fixes. Opened from `develop`. | `fix/<issue>-<description>` | `fix/456-null-crash` |
| `hotfix/` | Urgent production fixes. Opened from `main`, merged to both `main` and `develop`. | `hotfix/<issue>-<description>` | `hotfix/789-payment-bug` |
| `release/` | Release preparation. Only bugfixes and version bumps. | `release/<version>` | `release/2.1.0` |
