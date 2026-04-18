# @issuebabel/core

The core validation engine powering the entire issuebabel ecosystem. This package handles commit message validation, branch name validation, configuration loading, and defines the `PlatformAdapter` interface that all platform packages implement.

Every other issuebabel package (`@issuebabel/github`, `@issuebabel/jira`, etc.) depends on this package. You can also use `@issuebabel/core` directly if you want to build a custom integration without using the CLI or Husky hooks.

---

## Installation

```sh
npm install @issuebabel/core
```

---

## How It Works

issuebabel validates two things automatically on every git operation:

1. **Commit messages** — checked on every `git commit` via the `commit-msg` hook
2. **Branch names** — checked on every `git push` via the `pre-push` hook

Both are validated against your `issuebabel.config.js`. If a check fails, the git operation is blocked and a clear error message is shown in the terminal.

---

## Usage

```ts
import { validateCommitMessage, validateBranchName, loadConfig } from '@issuebabel/core';

const config = await loadConfig(); // reads issuebabel.config.js

// Validate a commit message
const commitResult = validateCommitMessage('feat(auth): add login page #123', config);

if (!commitResult.valid) {
  for (const error of commitResult.errors) {
    console.error(error);
  }
}

for (const warning of commitResult.warnings) {
  console.warn(warning); // e.g. commit message is too long
}

// Validate a branch name
const branchResult = validateBranchName('feat/123-add-login-page', config);

if (!branchResult.valid) {
  for (const error of branchResult.errors) {
    console.error(error);
  }
}
```

---

## Configuration

Place an `issuebabel.config.js` file in your project root. Alternatively, add an `"issuebabel"` key directly to your `package.json`.

### `issuebabel.config.js` (recommended)

```js
import { githubAdapter } from '@issuebabel/github';

export default {
  // Which issue tracker platform you are using
  platform: 'github',

  // The adapter for your platform — handles issue ref detection
  adapter: githubAdapter,

  // Whether every commit message must include an issue reference
  // Default: true
  requireIssueRef: true,

  // List of allowed commit types (Conventional Commits)
  commitTypes: [
    'feat',     // new feature
    'fix',      // bug fix
    'chore',    // maintenance, no behavior change
    'docs',     // documentation only
    'style',    // formatting, no logic change
    'refactor', // restructure without behavior change
    'perf',     // performance improvement
    'test',     // add or update tests
    'build',    // build system changes
    'ci',       // CI/CD configuration changes
    'revert',   // revert a previous commit
    'rename',   // rename a file or directory
    'move',     // move a file or directory
  ],

  // Branch name rules
  branch: {
    // Whether every branch name must include an issue reference
    // Default: false (warning only)
    requireIssueRef: false,

    // List of allowed branch type prefixes
    allowedTypes: [
      'feat',     // new feature branch
      'fix',      // bug fix branch
      'bugfix',   // alias for fix
      'hotfix',   // urgent fix from main
      'chore',    // maintenance
      'docs',     // documentation
      'refactor', // code restructure
      'perf',     // performance
      'test',     // testing
      'build',    // build changes
      'ci',       // CI changes
      'release',  // release branch
    ],
  },

  // Lint command — runs on every git commit (pre-commit hook)
  lint: {
    command: 'npm run lint',
  },

  // Build command — runs on git push by default (pre-push hook)
  build: {
    command: 'npm run build',
    runOn: 'pre-push', // 'pre-push' | 'pre-commit'
  },
};
```

### Via `package.json`

```json
{
  "issuebabel": {
    "platform": "github",
    "requireIssueRef": true,
    "commitTypes": ["feat", "fix", "chore", "docs"]
  }
}
```

---

## Custom Platform Adapter

Implement the `PlatformAdapter` interface to support any issue tracker not covered by the official packages:

```ts
import type { PlatformAdapter } from '@issuebabel/core';

const myAdapter: PlatformAdapter = {
  name: 'custom',

  // Regex pattern that matches your issue reference format
  issuePattern: /ISS-\d+/,

  // Extract the issue reference from a string (commit message or branch name)
  // Returns undefined if not found
  extractIssueRef: (text) => text.match(/ISS-\d+/)?.[0],

  // Validate that a string is a correctly formatted issue reference
  validateIssueRef: (ref) => /^ISS-\d+$/.test(ref),

  // Example shown in error messages
  example: 'ISS-123',
};
```

Then use it in your config:

```js
export default {
  platform: 'custom',
  adapter: myAdapter,
  requireIssueRef: true,
};
```

---

## Commit Message Format

issuebabel enforces the [Conventional Commits](https://www.conventionalcommits.org/) specification.

```
<type>(<scope>): <description> <issue-ref>
  │       │            │            │
  │       │            │            └─ Issue reference (#123, PROJ-123, etc.)
  │       │            └─ Short summary in present tense, no period at the end
  │       └─ Optional. The part of the codebase affected (auth, api, ui, ...)
  └─ Required. One of the allowed commit types
```

**Breaking change** — add `!` after the type:

```
feat!: remove deprecated auth endpoint #123
```

### Examples

```sh
# Feature with scope and issue ref
feat(auth): add OAuth2 login #123

# Bug fix without scope
fix: prevent crash on null user input #456

# Breaking change
feat(api)!: rename /users endpoint to /accounts PROJ-99

# Chore without issue ref (when requireIssueRef is false)
chore: update dependencies

# Docs update
docs: add API usage examples to README
```

---

## Branch Name Format

```
<type>/<issue-ref>-<short-description>
   │        │               │
   │        │               └─ Lowercase, words separated by hyphens
   │        └─ Optional but recommended — the issue number
   └─ Required. One of the allowed branch types
```

### Examples

```sh
feat/123-add-oauth2-login
fix/456-null-crash-on-empty-input
hotfix/789-critical-payment-bug
chore/update-dependencies
docs/improve-readme
```

**Protected branches** — always allowed regardless of config:
`main`, `master`, `develop`, `staging`, `production`, `release/*`

---

## Validation Result

Both `validateCommitMessage` and `validateBranchName` return a `ValidationResult`:

```ts
interface ValidationResult {
  valid: boolean;     // true if all checks passed
  errors: string[];   // blocking issues — the git operation will be prevented
  warnings: string[]; // non-blocking issues — shown but don't block the operation
}
```

---

## Git Reference

### Staging & Committing

```sh
# Stage all changed files
git add .

# Stage a specific file
git add src/auth/login.ts

# Commit staged changes with a message
git commit -m "feat(auth): add login page #123"
# ↑ This triggers the commit-msg hook (validates message format)
# ↑ This also triggers the pre-commit hook (runs lint/build if configured)

# Check what is staged and what is not
git status

# See what changed in staged files
git diff --staged
```

### Syncing with Remote

```sh
# Push your local commits to the remote branch
git push
# ↑ This triggers the pre-push hook (validates branch name + runs build)

# Push for the first time and set up tracking
git push -u origin feat/123-add-login

# Pull the latest changes from the remote
git pull

# Pull and rebase instead of merge
git pull --rebase
```

### Branch Management

```sh
# Create a new branch and switch to it immediately
git checkout -b feat/123-add-login-page

# Switch to an existing branch
git checkout main

# Push a new branch to the remote and set up tracking
git push -u origin feat/123-add-login-page

# List local branches
git branch

# List remote branches
git branch -r

# List all local and remote branches
git branch -a

# Delete a local branch after merging
git branch -d feat/123-add-login-page

# Merge a branch into the current branch
git merge feat/123-add-login-page
```

### Inspecting History

```sh
# See the commit history
git log

# See a compact one-line summary per commit
git log --oneline

# See commits with a graph of branches
git log --oneline --graph --all

# See what changed in a specific commit
git show <commit-hash>

# See who changed each line in a file
git blame src/auth/login.ts
```

### Undoing Changes

```sh
# Unstage a file (keep the changes in the working directory)
git restore --staged src/auth/login.ts

# Discard changes to a file in the working directory
git restore src/auth/login.ts

# Undo the last commit but keep the changes staged
git reset --soft HEAD~1

# Create a new commit that reverses a previous one
git revert <commit-hash>
```

### Other Useful Commands

```sh
# Clone a remote repository to your local machine
git clone <url>

# Check the remote URL of your repository
git remote -v

# Stash uncommitted changes temporarily
git stash

# Re-apply stashed changes
git stash pop
```

### Shell Commands

```sh
# Navigate into a directory
cd projects/my-app

# Go up one level
cd ..

# List files and folders in the current directory
ls

# List with details (permissions, size, date)
ls -la

# Create a new directory
mkdir src/components

# Create a new empty file
touch src/components/Button.ts

# Remove a file
rm src/components/OldButton.ts

# Remove a directory and all its contents
rm -rf dist/

# Print the current directory path
pwd

# Copy a file
cp src/Button.ts src/Button.backup.ts

# Move or rename a file
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
| `style` | Formatting, whitespace, semicolons — no logic change | `style: format files with prettier` |
| `refactor` | Restructuring code without changing behavior | `refactor(db): extract query builder` |
| `docs` | Documentation changes only | `docs: add API usage to README` |
| `rename` | Renaming a file or folder | `rename: LoginPage → AuthPage` |
| `move` | Moving a file or folder to a new location | `move: utils → src/shared/utils` |
| `perf` | Changes that improve performance | `perf(db): add index on users.email` |
| `build` | Changes to build system or dependencies | `build: add webpack bundle analyzer` |
| `ci` | Changes to CI/CD configuration | `ci: add GitHub Actions deploy workflow` |
| `revert` | Reverting a previous commit | `revert: feat(auth): add Google login #12` |

---

## Branch Types

| Branch | Purpose | Naming Convention | Example |
|--------|---------|-------------------|---------|
| `main` | The single source of truth. Always stable and deployable. Never commit directly. | — | `main` |
| `develop` | Collects finished features before a release. Optional but common in larger teams. | — | `develop` |
| `feature/` | One branch per feature or user story. Opened from `develop` (or `main`), merged back when done, then deleted. | `feature/<issue>-<description>` | `feature/123-add-login` |
| `fix/` or `bugfix/` | For fixing a known bug that is not urgent. Opened from `develop`. | `fix/<issue>-<description>` | `fix/456-null-crash` |
| `hotfix/` | For urgent, critical bugs in production. Opened directly from `main` and merged back to both `main` and `develop`. | `hotfix/<issue>-<description>` | `hotfix/789-payment-crash` |
| `release/` | Prepares a new version for deployment. Only bug fixes and version bumps go here. | `release/<version>` | `release/2.1.0` |
