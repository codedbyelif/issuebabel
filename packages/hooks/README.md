# @issuebabel/hooks

Husky git hook scripts for issuebabel. Once installed, these hooks run automatically on `git commit` and `git push` to validate commit messages, branch names, and execute lint/build checks — before the code ever leaves your machine.

---

## How It Works

Git hooks are scripts that run at specific points in the git workflow. issuebabel provides three hooks:

| Hook | Triggered by | What it does |
|------|-------------|--------------|
| `pre-commit` | `git commit` | Runs lint (and optionally build) before the commit is created |
| `commit-msg` | `git commit` | Validates the commit message format and issue reference |
| `pre-push` | `git push` | Validates the branch name and runs the build |

If any check fails, the git operation is **blocked** and a clear error is shown in the terminal. Nothing is committed or pushed until the issue is resolved.

---

## Installation

The easiest way is through the CLI:

```sh
npx issuebabel init
```

This automatically installs Husky, creates all three hook files, and generates `issuebabel.config.js`.

### Manual Installation

```sh
npm install --save-dev @issuebabel/hooks husky
npx husky install
```

Add to `package.json` so Husky reinstalls after every `npm install`:

```json
{
  "scripts": {
    "prepare": "husky install"
  }
}
```

---

## Hook Files

### `.husky/pre-commit`

Runs **before a commit is created**. Executes lint (and optionally build) on staged code.

```sh
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"
node_modules/.bin/issuebabel-pre-commit
```

**What it does:**
1. Reads your `issuebabel.config.js`
2. If `lint.command` is configured → runs it
3. If `build.runOn` is `'pre-commit'` → runs the build command
4. If any command fails → blocks the commit

---

### `.husky/commit-msg`

Runs **after you type your commit message** but before the commit is finalized. Validates the message format.

```sh
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"
node_modules/.bin/issuebabel-commit-msg "$1"
```

**What it does:**
1. Reads the commit message from the temp file Git provides
2. Skips validation for `Merge ...`, `Revert "..."`, and `Initial commit` messages
3. Validates the message against the Conventional Commits format
4. Checks that the configured issue reference is present (if `requireIssueRef: true`)
5. Warns if the message is over 100 characters
6. If invalid → blocks the commit and shows what is wrong

---

### `.husky/pre-push`

Runs **before commits are pushed to the remote**. Validates the branch name and runs the build.

```sh
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"
node_modules/.bin/issuebabel-pre-push
```

**What it does:**
1. Reads the current branch name
2. Skips validation for protected branches: `main`, `master`, `develop`, `staging`, `production`, `release/*`
3. Validates the branch name format and type
4. If `build.runOn` is `'pre-push'` (the default) → runs the build command
5. If any check fails → blocks the push

---

## Configuration

```js
// issuebabel.config.js
import { githubAdapter } from '@issuebabel/github';

export default {
  platform: 'github',
  adapter: githubAdapter,

  // Whether every commit must include an issue reference
  requireIssueRef: true,

  // Commit types accepted by the commit-msg hook
  commitTypes: [
    'feat', 'fix', 'chore', 'docs', 'style',
    'refactor', 'perf', 'test', 'build', 'ci', 'revert',
    'rename', 'move',
  ],

  // Branch rules checked by the pre-push hook
  branch: {
    requireIssueRef: false,
    allowedTypes: ['feat', 'fix', 'bugfix', 'hotfix', 'chore', 'docs', 'release'],
  },

  // Command run by the pre-commit hook
  lint: {
    command: 'npm run lint',
  },

  // Command run by the pre-push hook (or pre-commit if runOn is set)
  build: {
    command: 'npm run build',
    runOn: 'pre-push', // 'pre-push' | 'pre-commit'
  },
};
```

---

## Terminal Output Examples

### Successful commit

```
issuebabel — commit message validation

  feat(auth): add login page #123

✔ Commit message is valid.
```

### Blocked commit — missing issue reference

```
issuebabel — commit message validation

  feat(auth): add login page

✖ No issue reference found.
  Platform: github → #123
  Example: feat(auth): add login page #123

ℹ Fix the message and try again.
```

### Blocked commit — wrong type

```
✖ "wip" is not a valid commit type.
  Allowed types: feat, fix, chore, docs, style, refactor, perf, test, build, ci, revert
```

### Blocked push — invalid branch name

```
issuebabel — pre-push checks

ℹ Branch: AddLoginPage

✖ Invalid branch name format.
  Expected: <type>/<issue-ref>-<description>
  Example:  feat/123-add-login-page
  Types:    feat, fix, bugfix, hotfix, chore, docs, release
```

### Blocked push — build failed

```
ℹ Build: npm run build
[build output...]
✖ Build failed.
```

---

## Git Reference

### How the Hooks Fit Into Your Workflow

```sh
# 1. Make your changes
git add .

# 2. Commit — triggers pre-commit (lint) and commit-msg (message validation)
git commit -m "feat(auth): add login page #123"
#              └─ commit-msg hook checks this message

# 3. Push — triggers pre-push (branch name + build)
git push -u origin feat/123-add-login-page
#                    └─ pre-push hook checks this branch name
```

### Staging & Committing

```sh
# Stage all changed files
git add .

# Stage a specific file
git add src/auth/login.ts

# Check what is staged and what is not
git status

# See what changed in staged files
git diff --staged

# Commit — triggers commit-msg and pre-commit hooks
git commit -m "feat(auth): add login page #123"
```

### Syncing with Remote

```sh
# Push commits — triggers pre-push hook
git push

# Push a new branch for the first time
git push -u origin feat/123-add-login

# Pull latest changes from remote
git pull

# Pull and rebase to keep history clean
git pull --rebase
```

### Branch Management

```sh
# Create a new branch and switch to it
git checkout -b feat/123-add-login-page

# List local branches
git branch

# List remote branches
git branch -r

# List all branches (local + remote)
git branch -a

# Switch to an existing branch
git checkout main

# Delete a local branch after merging
git branch -d feat/123-add-login-page

# Delete a remote branch
git push origin --delete feat/123-add-login-page
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
# Unstage a file (keep changes in the working directory)
git restore --staged src/auth/login.ts

# Discard local changes to a file
git restore src/auth/login.ts

# Undo the last commit but keep the changes staged
git reset --soft HEAD~1

# Create a new commit that reverses a previous one
git revert <commit-hash>
```

### Other Useful Commands

```sh
# Clone a repository
git clone https://github.com/your-org/your-repo.git

# Check the remote URL
git remote -v

# Temporarily save uncommitted changes
git stash

# Re-apply stashed changes
git stash pop

# Merge a branch into the current branch
git merge feat/123-add-login-page
```

### Shell Commands

```sh
cd projects/my-app    # Navigate into a folder
cd ..                 # Go up one level
ls                    # List files and folders
ls -la                # List with details (permissions, size, date)
mkdir src/components  # Create a new folder
touch src/Button.ts   # Create a new empty file
rm src/OldButton.ts   # Remove a file
rm -rf dist/          # Remove a folder and all its contents
pwd                   # Print the current folder path
cp src/a.ts src/b.ts  # Copy a file
mv src/a.ts src/b.ts  # Move or rename a file
```

---

## Commit Types

| Type | When to Use | Example |
|------|-------------|---------|
| `feat` | Adding a brand new feature | `feat(auth): add login page #12` |
| `fix` | Fixing a bug | `fix(api): handle null response #34` |
| `chore` | Maintenance that doesn't change app behavior | `chore: upgrade eslint to v9` |
| `test` | Adding or updating tests | `test(auth): add login unit tests` |
| `style` | Formatting, whitespace — no logic change | `style: format files with prettier` |
| `refactor` | Restructuring code without changing behavior | `refactor(db): extract query builder` |
| `docs` | Documentation changes only | `docs: add hook configuration guide` |
| `rename` | Renaming a file or folder | `rename: LoginPage → AuthPage` |
| `move` | Moving a file or folder | `move: utils → src/shared/utils` |
| `perf` | Performance improvements | `perf(db): add index on users.email` |
| `build` | Build system or dependency changes | `build: add webpack bundle analyzer` |
| `ci` | CI/CD configuration changes | `ci: add GitHub Actions workflow` |
| `revert` | Reverting a previous commit | `revert: feat(auth): add login #12` |

---

## Branch Types

| Branch | Purpose | Naming | Example |
|--------|---------|--------|---------|
| `main` | Always stable and deployable. The source of truth. Never commit directly. | — | `main` |
| `develop` | Collects finished features before a release. Optional but recommended. | — | `develop` |
| `feature/` | One branch per feature. Opened from `develop`, merged back and deleted. | `feature/<issue>-<description>` | `feature/123-add-login` |
| `fix/` or `bugfix/` | Non-urgent bug fixes. Opened from `develop`. | `fix/<issue>-<description>` | `fix/456-null-crash` |
| `hotfix/` | Urgent production fixes. Opened from `main`, merged to both `main` and `develop`. | `hotfix/<issue>-<description>` | `hotfix/789-payment-crash` |
| `release/` | Release preparation. Only bugfixes and version bumps. | `release/<version>` | `release/2.1.0` |
