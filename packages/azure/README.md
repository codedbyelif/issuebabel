# @issuebabel/azure

Azure DevOps work item adapter for issuebabel. Detects and validates the `AB#123` format in commit messages and branch names.

Use this package if your team tracks work in **Azure DevOps Boards**. Azure DevOps uses `AB#` as the prefix for work item references, and this adapter ensures every commit and branch follows that convention.

---

## Installation

```sh
npm install @issuebabel/core @issuebabel/azure
```

---

## How It Works

Azure DevOps uses `AB#NUMBER` as its work item reference format (e.g. `AB#123`). This adapter teaches issuebabel to:

- Detect `AB#123` anywhere in a commit message
- Validate the format against the `AB#` prefix
- Show a clear error if the reference is missing

For example, the following commit is **valid**:

```
feat(auth): add Azure AD SSO AB#123
```

The following commit is **blocked**:

```
feat(auth): add Azure AD SSO
# ✖ No issue reference found. Expected format: AB#123
```

---

## Quick Setup

```sh
npx issuebabel init
```

The platform is auto-detected from your git remote. If you use Azure DevOps repos (`dev.azure.com` or `visualstudio.com`), it will be set automatically.

---

## Manual Setup

### 1. Install packages

```sh
npm install --save-dev @issuebabel/core @issuebabel/azure @issuebabel/hooks husky
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
import { azureAdapter } from '@issuebabel/azure';

export default {
  platform: 'azure',
  adapter: azureAdapter,

  // Block commits that don't include an Azure work item reference
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
import { azureAdapter } from '@issuebabel/azure';
import { validateCommitMessage, validateBranchName } from '@issuebabel/core';

const config = {
  platform: 'azure' as const,
  adapter: azureAdapter,
  requireIssueRef: true,
};

// Validate a commit message
const result = validateCommitMessage('feat(auth): add Azure AD SSO AB#123', config);
console.log(result.valid);   // true
console.log(result.errors);  // []

// Validate a branch name
const branch = validateBranchName('feat/123-add-azure-sso', config);
console.log(branch.valid);   // true
```

---

## Issue Ref Format

| Format | Example  | Valid |
|--------|----------|-------|
| `AB#N` | `AB#1`   | ✔ |
| `AB#N` | `AB#123` | ✔ |
| `AB#N` | `AB#9999`| ✔ |
| `#N`   | `#123`   | ✖ (GitHub format) |
| `AB-N` | `AB-123` | ✖ (Jira-style, not Azure) |
| No prefix | `123` | ✖ |

---

## Commit Message Format

```
<type>(<scope>): <description> AB#<work-item-number>
```

The work item reference can appear anywhere in the message — beginning, middle, or end.

### Valid Examples

```sh
feat(auth): add Azure Active Directory SSO AB#123
fix(api): handle timeout on blob storage calls AB#456
chore: upgrade Azure SDK to v5 AB#789
feat!: migrate from REST to Graph API (breaking) AB#99
refactor(infra): extract Azure resource provisioning AB#200
test(auth): add unit tests for Azure AD token flow AB#123
docs: document Azure AD app registration steps AB#55
perf(storage): use batch operations for blob uploads AB#301
```

### Invalid Examples

```sh
# Missing work item reference
feat(auth): add Azure AD SSO
# ✖ No issue reference found. Expected: AB#123

# GitHub format used
feat(auth): add Azure AD SSO #123
# ✖ No issue reference found. Expected: AB#123

# Jira format used
feat(auth): add Azure AD SSO PROJ-123
# ✖ No issue reference found. Expected: AB#123

# No commit format at all
add Azure AD SSO
# ✖ Invalid commit message format.
```

---

## Branch Name Format

```
<type>/<work-item-number>-<short-description>
```

All lowercase, words separated by hyphens. Since `AB#123` contains `#` which is not valid in branch names, use just the number in the branch name.

### Valid Examples

```sh
feat/123-add-azure-ad-sso
fix/456-blob-storage-timeout
hotfix/789-critical-auth-failure
chore/101-upgrade-azure-sdk
docs/55-azure-ad-app-registration
bugfix/202-wrong-tenant-redirect
release/5.0.0
```

### Invalid Examples

```sh
# No type prefix
123-add-sso
# ✖ Invalid branch name format.

# Using AB# in branch name (# is invalid in git branch names)
feat/AB#123-add-sso
# ✖ Invalid branch name format.

# Uppercase
Feat/123-AddSSO
# ✖ Invalid branch name format (must be lowercase).

# Unknown type
wip/123-something
# ✖ "wip" is not a valid branch type.
```

---

## Git Reference

### Starting a New Feature

```sh
# 1. Pull the latest state of your main branch
git checkout main
git pull

# 2. Create a branch named after your Azure work item
git checkout -b feat/123-add-azure-ad-sso

# 3. Make your changes, stage and commit
git add .
git commit -m "feat(auth): add Azure Active Directory SSO AB#123"
# ↑ commit-msg hook validates the message and AB# reference

# 4. Push to remote
git push -u origin feat/123-add-azure-ad-sso
# ↑ pre-push hook validates the branch name and runs build
```

### Fixing a Bug

```sh
git checkout develop
git pull
git checkout -b fix/456-blob-storage-timeout

git add .
git commit -m "fix(api): handle timeout on blob storage calls AB#456"
git push -u origin fix/456-blob-storage-timeout
```

### Urgent Hotfix on Production

```sh
# Always branch from main for hotfixes
git checkout main
git pull
git checkout -b hotfix/789-critical-auth-failure

git add .
git commit -m "fix(auth): fix infinite redirect loop in Azure AD flow AB#789"
git push -u origin hotfix/789-critical-auth-failure

# After merging to main, also sync to develop
git checkout develop
git merge hotfix/789-critical-auth-failure
```

### Staging & Committing

```sh
git add .                              # Stage all changes
git add src/auth/azure-ad.ts           # Stage a specific file
git status                             # See staged vs unstaged
git diff --staged                      # See diff of staged files
git commit -m "feat(auth): add Azure AD SSO AB#123"
```

### Syncing with Remote

```sh
git push                               # Push to remote (triggers pre-push hook)
git push -u origin feat/123-add-sso    # Push new branch for the first time
git pull                               # Pull latest changes
git pull --rebase                      # Pull and rebase
```

### Branch Management

```sh
git branch                             # List local branches
git branch -r                          # List remote branches
git branch -a                          # List all branches
git checkout develop                   # Switch to a branch
git branch -d feat/123-add-sso         # Delete a local branch
git push origin --delete feat/123-add-sso  # Delete a remote branch
```

### Inspecting History

```sh
git log                                # Full commit history
git log --oneline                      # Compact one-line history
git log --oneline --graph --all        # Branch graph
git show <commit-hash>                 # See a specific commit
git blame src/auth/azure-ad.ts         # See who wrote each line
```

### Undoing Changes

```sh
git restore --staged src/auth/azure-ad.ts  # Unstage a file
git restore src/auth/azure-ad.ts           # Discard local changes
git reset --soft HEAD~1                    # Undo last commit, keep changes
git revert <commit-hash>                   # Reverse a commit with a new commit
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
cd projects/my-app       # Navigate into a folder
cd ..                    # Go up one level
ls                       # List files and folders
ls -la                   # List with details
mkdir src/auth           # Create a new folder
touch src/auth/azure.ts  # Create a new empty file
rm src/auth/old.ts       # Remove a file
rm -rf dist/             # Remove a folder and all its contents
pwd                      # Print current folder path
cp src/a.ts src/b.ts     # Copy a file
mv src/a.ts src/b.ts     # Move or rename a file
```

---

## Commit Types

| Type | When to Use | Example |
|------|-------------|---------|
| `feat` | Adding a brand new feature | `feat(auth): add Azure AD SSO AB#12` |
| `fix` | Fixing a bug | `fix(api): blob timeout AB#34` |
| `chore` | Maintenance, no behavior change | `chore: upgrade Azure SDK` |
| `test` | Adding or updating tests | `test(auth): Azure AD token tests AB#12` |
| `style` | Formatting, no logic change | `style: format with prettier` |
| `refactor` | Restructure without behavior change | `refactor(infra): extract provisioning` |
| `docs` | Documentation only | `docs: Azure AD setup guide AB#55` |
| `rename` | Rename a file or folder | `rename: AzureAuth → AzureADAuth` |
| `move` | Move a file or folder | `move: utils → src/shared/utils` |
| `perf` | Performance improvement | `perf(storage): batch blob uploads` |
| `build` | Build system or dependency change | `build: add Azure pipeline task` |
| `ci` | CI/CD configuration change | `ci: add Azure DevOps deploy stage` |
| `revert` | Revert a previous commit | `revert: feat(auth): add Azure AD SSO AB#12` |

---

## Branch Types

| Branch | Purpose | Naming | Example |
|--------|---------|--------|---------|
| `main` | Always stable and deployable. Never commit directly. | — | `main` |
| `develop` | Collects finished features before a release. | — | `develop` |
| `feature/` | One branch per work item. Merged and deleted when done. | `feature/<id>-<desc>` | `feature/123-add-azure-sso` |
| `fix/` or `bugfix/` | Non-urgent bug fixes. Opened from `develop`. | `fix/<id>-<desc>` | `fix/456-blob-timeout` |
| `hotfix/` | Urgent production fix. Opened from `main`. | `hotfix/<id>-<desc>` | `hotfix/789-auth-failure` |
| `release/` | Release preparation. Only bugfixes and version bumps. | `release/<version>` | `release/5.0.0` |
