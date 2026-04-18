# @issuebabel/jira

Jira issue reference adapter for issuebabel. Detects and validates the `PROJ-123` format in commit messages and branch names.

Use this package if your team tracks work in **Jira**. The project key is fully configurable — use whatever key your Jira project uses (e.g. `PROJ`, `ENG`, `MYAPP`).

---

## Installation

```sh
npm install @issuebabel/core @issuebabel/jira
```

---

## How It Works

Jira uses `PROJECT_KEY-NUMBER` as its issue reference format (e.g. `PROJ-123`). This adapter teaches issuebabel to:

- Detect `PROJ-123` (or any configured key) anywhere in a commit message
- Validate that the reference matches the configured project key
- Show a clear error if it is missing or uses the wrong key

For example, the following commit is **valid**:

```
feat(auth): add OAuth2 login PROJ-123
```

The following commit is **blocked**:

```
feat(auth): add OAuth2 login
# ✖ No issue reference found. Expected format: PROJ-123
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
npm install --save-dev @issuebabel/core @issuebabel/jira @issuebabel/hooks husky
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
import { createJiraAdapter } from '@issuebabel/jira';

export default {
  platform: 'jira',

  // Replace 'PROJ' with your actual Jira project key
  adapter: createJiraAdapter('PROJ'),

  // Block commits that don't include a Jira issue reference
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
import { createJiraAdapter } from '@issuebabel/jira';
import { validateCommitMessage, validateBranchName } from '@issuebabel/core';

const adapter = createJiraAdapter('PROJ');

const config = {
  platform: 'jira' as const,
  adapter,
  requireIssueRef: true,
};

// Validate a commit message
const result = validateCommitMessage('fix(api): null crash PROJ-456', config);
console.log(result.valid);   // true
console.log(result.errors);  // []

// Validate a branch name
const branch = validateBranchName('fix/proj-456-null-crash', config);
console.log(branch.valid);   // true
```

---

## Issue Ref Format

| Format   | Example    | Valid |
|----------|------------|-------|
| `KEY-N`  | `PROJ-1`   | ✔ |
| `KEY-N`  | `PROJ-123` | ✔ |
| `KEY-N`  | `ENG-456`  | ✔ (if project key is ENG) |
| `#N`     | `#123`     | ✖ (GitHub format, not Jira) |
| Lowercase | `proj-123` | ✖ |

---

## Commit Message Format

```
<type>(<scope>): <description> <JIRA-KEY>-<number>
```

The issue reference can appear anywhere in the message.

### Valid Examples

```sh
feat(auth): add SAML SSO integration PROJ-123
fix(api): prevent 500 on missing user PROJ-456
chore: upgrade all npm dependencies PROJ-789
feat!: remove deprecated v1 endpoints PROJ-99
refactor(db): extract repository pattern PROJ-200
test(auth): add unit tests for SAML flow PROJ-123
docs: update API authentication guide PROJ-55
perf(search): add index on email column PROJ-301
```

### Invalid Examples

```sh
# Missing Jira reference
feat(auth): add SAML SSO
# ✖ No issue reference found. Expected: PROJ-123

# Wrong project key
feat(auth): add SAML SSO OTHER-123
# ✖ No issue reference found. Expected: PROJ-123

# GitHub format used instead
feat(auth): add SAML SSO #123
# ✖ No issue reference found. Expected: PROJ-123

# No format at all
add SAML login
# ✖ Invalid commit message format.
```

---

## Branch Name Format

```
<type>/<jira-key>-<number>-<short-description>
```

All lowercase, words separated by hyphens.

### Valid Examples

```sh
feat/proj-123-add-saml-sso
fix/proj-456-null-crash-on-missing-user
hotfix/proj-789-critical-payment-failure
chore/proj-101-upgrade-dependencies
docs/proj-55-update-auth-guide
bugfix/proj-202-wrong-redirect-after-login
release/3.0.0
```

### Invalid Examples

```sh
# No type prefix
proj-123-add-saml
# ✖ Invalid branch name format.

# Uppercase
Feat/PROJ-123-AddSAML
# ✖ Invalid branch name format (must be lowercase).

# Unknown type
wip/proj-123-something
# ✖ "wip" is not a valid branch type.
```

---

## Git Reference

### Starting a New Feature

```sh
# 1. Pull latest changes
git checkout develop
git pull

# 2. Create a branch named after your Jira ticket
git checkout -b feat/proj-123-add-saml-sso

# 3. Do your work, then stage and commit
git add .
git commit -m "feat(auth): add SAML SSO integration PROJ-123"
# ↑ commit-msg hook validates the message and Jira reference

# 4. Push to remote
git push -u origin feat/proj-123-add-saml-sso
# ↑ pre-push hook validates the branch name and runs build
```

### Fixing a Bug

```sh
git checkout develop
git pull
git checkout -b fix/proj-456-null-crash-api

git add .
git commit -m "fix(api): prevent 500 on missing user PROJ-456"
git push -u origin fix/proj-456-null-crash-api
```

### Urgent Hotfix on Production

```sh
# Branch from main, not develop
git checkout main
git pull
git checkout -b hotfix/proj-789-payment-failure

git add .
git commit -m "fix(payment): prevent duplicate charge on retry PROJ-789"
git push -u origin hotfix/proj-789-payment-failure

# After merging to main, also sync to develop
git checkout develop
git merge hotfix/proj-789-payment-failure
```

### Staging & Committing

```sh
# Stage all changed files
git add .

# Stage a specific file
git add src/auth/saml.ts

# See what is staged and what is not
git status

# See the diff of staged files
git diff --staged

# Commit with a message
git commit -m "feat(auth): add SAML SSO integration PROJ-123"
```

### Syncing with Remote

```sh
# Push commits
git push

# Push a new branch for the first time
git push -u origin feat/proj-123-add-saml

# Pull latest changes
git pull

# Pull and rebase
git pull --rebase
```

### Branch Management

```sh
# List local branches
git branch

# List remote branches
git branch -r

# List all branches
git branch -a

# Switch to an existing branch
git checkout develop

# Delete a local branch
git branch -d feat/proj-123-add-saml

# Delete a remote branch
git push origin --delete feat/proj-123-add-saml
```

### Inspecting History

```sh
# Full commit log
git log

# Compact one-line log
git log --oneline

# Graph with all branches
git log --oneline --graph --all

# See a specific commit
git show <commit-hash>

# See who wrote each line
git blame src/auth/saml.ts
```

### Undoing Changes

```sh
# Unstage a file
git restore --staged src/auth/saml.ts

# Discard local changes
git restore src/auth/saml.ts

# Undo last commit, keep changes staged
git reset --soft HEAD~1

# Reverse a commit with a new commit
git revert <commit-hash>
```

### Other Useful Commands

```sh
# Clone a repository
git clone https://github.com/your-org/your-repo.git

# Check remote URL
git remote -v

# Stash uncommitted changes
git stash

# Restore stashed changes
git stash pop
```

### Shell Commands

```sh
cd projects/my-app   # Navigate into a folder
cd ..                # Go up one level
ls                   # List files and folders
ls -la               # List with details
mkdir src/components # Create a new folder
touch src/auth.ts    # Create a new empty file
rm src/old.ts        # Remove a file
rm -rf dist/         # Remove a folder and all its contents
pwd                  # Print current folder path
cp src/a.ts src/b.ts # Copy a file
mv src/a.ts src/b.ts # Move or rename a file
```

---

## Commit Types

| Type | When to Use | Example |
|------|-------------|---------|
| `feat` | Adding a brand new feature | `feat(auth): add SAML SSO PROJ-12` |
| `fix` | Fixing a bug | `fix(api): handle null user PROJ-34` |
| `chore` | Maintenance, no behavior change | `chore: upgrade dependencies` |
| `test` | Adding or updating tests | `test(auth): add SAML unit tests PROJ-12` |
| `style` | Formatting, no logic change | `style: format with prettier` |
| `refactor` | Restructure without behavior change | `refactor(db): extract repository` |
| `docs` | Documentation only | `docs: update auth guide PROJ-55` |
| `rename` | Rename a file or folder | `rename: LoginPage → AuthPage` |
| `move` | Move a file or folder | `move: utils → src/shared/utils` |
| `perf` | Performance improvement | `perf(db): add index on email` |
| `build` | Build system or dependency change | `build: add bundle analyzer` |
| `ci` | CI/CD configuration change | `ci: add deploy workflow` |
| `revert` | Revert a previous commit | `revert: feat(auth): add SAML PROJ-12` |

---

## Branch Types

| Branch | Purpose | Naming | Example |
|--------|---------|--------|---------|
| `main` | Always stable and deployable. Never commit directly. | — | `main` |
| `develop` | Collects finished features before a release. | — | `develop` |
| `feature/` | One branch per Jira ticket. Merged and deleted when done. | `feature/<key>-<description>` | `feature/proj-123-add-saml` |
| `fix/` or `bugfix/` | Non-urgent bug fixes. Opened from `develop`. | `fix/<key>-<description>` | `fix/proj-456-null-crash` |
| `hotfix/` | Urgent production fix. Opened from `main`. | `hotfix/<key>-<description>` | `hotfix/proj-789-payment-bug` |
| `release/` | Release preparation. Only bugfixes and version bumps. | `release/<version>` | `release/3.0.0` |
