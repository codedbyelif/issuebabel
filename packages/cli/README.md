# @issuebabel/cli

The issuebabel command-line tool. Sets up issuebabel in any project with a single command, and lets you validate commit messages and branch names directly from the terminal.

---

## Installation

Install as a dev dependency in your project:

```sh
npm install --save-dev @issuebabel/cli
```

Or install globally to use across all your projects:

```sh
npm install -g @issuebabel/cli
```

---

## Commands

### `issuebabel init`

The main setup command. Run this once in any project to fully configure issuebabel.

```sh
issuebabel init
```

**What it does, step by step:**

1. **Detects your platform** — reads your `git remote get-url origin` and automatically selects `github`, `azure`, or defaults to `github`
2. **Creates `issuebabel.config.js`** — generates a ready-to-use config file with the correct platform adapter pre-filled
3. **Installs Husky** — if Husky is not already installed, runs `npm install --save-dev husky` and `npx husky install`
4. **Creates hook files** — writes `.husky/commit-msg`, `.husky/pre-push`, and `.husky/pre-commit` with the correct content
5. **Updates `package.json`** — adds `"prepare": "husky install"` to scripts so Husky reinstalls after `npm install`

**Example output:**

```
issuebabel — starting setup

✔ issuebabel.config.js created  (platform: github)
✔ Husky installed.
✔ .husky/commit-msg created.
✔ .husky/pre-push created.
✔ .husky/pre-commit created.
✔ Added "prepare": "husky install" to package.json.

✔ Setup complete! Edit issuebabel.config.js to configure your project.
```

---

### `issuebabel validate-commit <message>`

Validates a commit message against your `issuebabel.config.js` without actually making a commit. Useful for testing your config or checking a message before committing.

```sh
issuebabel validate-commit "feat(auth): add login page #123"
```

**Output on success:**

```
✔ Commit message is valid.
```

**Output on failure:**

```
✖ No issue reference found.
  Platform: github → #123
  Example: feat(auth): add login page #123
```

**More examples:**

```sh
# Valid — all checks pass
issuebabel validate-commit "feat(auth): add OAuth2 login #123"

# Invalid — missing issue reference
issuebabel validate-commit "feat(auth): add OAuth2 login"

# Invalid — wrong commit type
issuebabel validate-commit "wip: add some stuff #123"

# Invalid — no format at all
issuebabel validate-commit "added login"

# Warning — message too long (over 100 characters)
issuebabel validate-commit "feat(auth): add a very long commit message that exceeds the recommended character limit #123"
```

---

### `issuebabel validate-branch <branch-name>`

Validates a branch name against your `issuebabel.config.js` without switching branches. Useful for checking a branch name before creating it.

```sh
issuebabel validate-branch "feat/123-add-login-page"
```

**Output on success:**

```
✔ Branch name is valid.
```

**Output on failure:**

```
✖ Invalid branch name format.
  Expected: <type>/<issue-ref>-<description>
  Example:  feat/123-add-login-page
  Types:    feat, fix, bugfix, hotfix, chore, docs, release
```

**More examples:**

```sh
# Valid
issuebabel validate-branch "feat/123-add-login"
issuebabel validate-branch "fix/456-null-crash"
issuebabel validate-branch "hotfix/789-payment-bug"
issuebabel validate-branch "main"       # always valid
issuebabel validate-branch "develop"    # always valid
issuebabel validate-branch "release/2.0.0"  # always valid

# Invalid
issuebabel validate-branch "AddLoginPage"        # no type, no slash
issuebabel validate-branch "wip/add-something"  # unknown type
issuebabel validate-branch "Feat/123-Login"     # uppercase
```

---

### `issuebabel help`

Shows available commands and examples.

```sh
issuebabel help
```

---

## Generated Config File

When you run `issuebabel init`, it creates an `issuebabel.config.js` tailored to your platform. Here is a full example with all available options explained:

```js
// issuebabel.config.js
import { githubAdapter } from '@issuebabel/github';
// For Jira:   import { createJiraAdapter } from '@issuebabel/jira';
// For Linear: import { createLinearAdapter } from '@issuebabel/linear';
// For Azure:  import { azureAdapter } from '@issuebabel/azure';

export default {
  // Which platform you are using
  platform: 'github',

  // The adapter that knows how to detect your issue reference format
  adapter: githubAdapter,
  // adapter: createJiraAdapter('PROJ'),
  // adapter: createLinearAdapter('ENG'),
  // adapter: azureAdapter,

  // If true, every commit message must include an issue reference
  // If false, missing references are allowed (useful for chore/docs commits)
  requireIssueRef: true,

  // The list of commit types your team allows
  // These are validated by the commit-msg hook
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
    'ci',       // CI/CD configuration
    'revert',   // revert a previous commit
    'rename',   // rename a file or directory
    'move',     // move a file or directory
  ],

  // Branch name rules checked by the pre-push hook
  branch: {
    // If true, branches without an issue reference are blocked
    // If false, a warning is shown but the push is not blocked
    requireIssueRef: false,

    // The list of branch type prefixes your team allows
    allowedTypes: [
      'feat',
      'fix',
      'bugfix',
      'hotfix',
      'chore',
      'docs',
      'refactor',
      'perf',
      'test',
      'build',
      'ci',
      'release',
    ],
  },

  // Lint command — runs before every commit (pre-commit hook)
  lint: {
    command: 'npm run lint',
  },

  // Build command
  build: {
    command: 'npm run build',
    // 'pre-push'   → runs on git push (default, recommended)
    // 'pre-commit' → runs on git commit (slower, catches issues earlier)
    runOn: 'pre-push',
  },
};
```

---

## Supported Platforms

| Package | Format | Example |
|---------|--------|---------|
| [`@issuebabel/github`](../github) | `#N` | `#123` |
| [`@issuebabel/jira`](../jira) | `KEY-N` | `PROJ-123` |
| [`@issuebabel/linear`](../linear) | `KEY-N` | `ENG-123` |
| [`@issuebabel/azure`](../azure) | `AB#N` | `AB#123` |

---

## Git Reference

### Starting a New Feature

```sh
# 1. Run setup once (only needed the first time)
issuebabel init

# 2. Pull the latest state of main
git checkout main
git pull

# 3. Create your feature branch
git checkout -b feat/123-add-login-page

# 4. Make your changes, stage them
git add .

# 5. Commit — hooks run automatically
git commit -m "feat(auth): add login page #123"
# pre-commit: runs npm run lint
# commit-msg: validates "feat(auth): add login page #123"

# 6. Push — hook runs automatically
git push -u origin feat/123-add-login-page
# pre-push: validates branch name "feat/123-add-login-page" + runs npm run build
```

### Fixing a Bug

```sh
git checkout develop
git pull
git checkout -b fix/456-null-crash-api

git add .
git commit -m "fix(api): prevent crash on null response #456"
git push -u origin fix/456-null-crash-api
```

### Urgent Hotfix on Production

```sh
# Hotfixes always branch from main, not develop
git checkout main
git pull
git checkout -b hotfix/789-payment-crash

git add .
git commit -m "fix(payment): prevent duplicate charge on retry #789"
git push -u origin hotfix/789-payment-crash

# After the PR is merged to main, sync develop too
git checkout develop
git merge hotfix/789-payment-crash
```

### Staging & Committing

```sh
git add .                         # Stage all changed files
git add src/auth/login.ts         # Stage a specific file
git status                        # See what is staged and what is not
git diff --staged                 # See the diff of staged files
git commit -m "feat(auth): add login page #123"
```

### Syncing with Remote

```sh
git push                          # Push to remote (triggers pre-push hook)
git push -u origin feat/123-add-login  # Push a new branch for the first time
git pull                          # Pull latest changes
git pull --rebase                 # Pull and rebase to avoid a merge commit
```

### Branch Management

```sh
git checkout -b feat/123-add-login  # Create a new branch and switch to it
git checkout main                   # Switch to an existing branch
git branch                          # List local branches
git branch -r                       # List remote branches
git branch -a                       # List all branches
git branch -d feat/123-add-login    # Delete a local branch
git push origin --delete feat/123-add-login  # Delete a remote branch
git merge feat/123-add-login        # Merge a branch into the current one
```

### Inspecting History

```sh
git log                             # Full commit history
git log --oneline                   # Compact one-line history
git log --oneline --graph --all     # Branch graph
git show <commit-hash>              # See a specific commit
git blame src/auth/login.ts         # See who wrote each line
```

### Undoing Changes

```sh
git restore --staged src/auth/login.ts  # Unstage a file
git restore src/auth/login.ts           # Discard local changes
git reset --soft HEAD~1                 # Undo last commit, keep changes staged
git revert <commit-hash>                # Reverse a commit with a new commit
```

### Other Useful Commands

```sh
git clone <url>     # Clone a repository
git remote -v       # Check the remote URL
git stash           # Temporarily save uncommitted changes
git stash pop       # Restore stashed changes
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
rm -rf dist/          # Remove a folder and all contents
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
| `docs` | Documentation changes only | `docs: add CLI usage examples` |
| `rename` | Renaming a file or folder | `rename: LoginPage → AuthPage` |
| `move` | Moving a file or folder | `move: utils → src/shared/utils` |
| `perf` | Performance improvements | `perf(db): add index on users.email` |
| `build` | Build system or dependency changes | `build: add webpack bundle analyzer` |
| `ci` | CI/CD configuration changes | `ci: add GitHub Actions deploy workflow` |
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
