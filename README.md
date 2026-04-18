# issuebabel

Platform-agnostic commit message & branch name validator with Husky integration.

Her issue tracker'ın farklı format kullandığı monorepo ve multi-team projelerde tutarlı commit/branch kuralları uygulamak için tasarlanmıştır.

---

## Paketler

| Paket | Açıklama | Versiyon |
|-------|----------|---------|
| [`@issuebabel/core`](./packages/core) | Validasyon motoru, tipler, config loader | 0.1.0 |
| [`@issuebabel/github`](./packages/github) | GitHub adaptörü — `#123` | 0.1.0 |
| [`@issuebabel/jira`](./packages/jira) | Jira adaptörü — `PROJ-123` | 0.1.0 |
| [`@issuebabel/linear`](./packages/linear) | Linear adaptörü — `ENG-123` | 0.1.0 |
| [`@issuebabel/azure`](./packages/azure) | Azure DevOps adaptörü — `AB#123` | 0.1.0 |
| [`@issuebabel/hooks`](./packages/hooks) | Husky hook scriptleri | 0.1.0 |
| [`@issuebabel/cli`](./packages/cli) | CLI — `issuebabel init` | 0.1.0 |

---

## Hızlı Başlangıç

```sh
npm install --save-dev @issuebabel/cli
npx issuebabel init
```

`init` komutu:
- `issuebabel.config.js` oluşturur (git remote'dan platform otomatik algılanır)
- Husky'yi kurar ve `.husky/` hook dosyalarını oluşturur

---

## Platform Seçimi

### GitHub

```sh
npm install --save-dev @issuebabel/core @issuebabel/github @issuebabel/hooks
```

```js
import { githubAdapter } from '@issuebabel/github';
export default { platform: 'github', adapter: githubAdapter };
```

### Jira

```sh
npm install --save-dev @issuebabel/core @issuebabel/jira @issuebabel/hooks
```

```js
import { createJiraAdapter } from '@issuebabel/jira';
export default { platform: 'jira', adapter: createJiraAdapter('PROJ') };
```

### Linear

```sh
npm install --save-dev @issuebabel/core @issuebabel/linear @issuebabel/hooks
```

```js
import { createLinearAdapter } from '@issuebabel/linear';
export default { platform: 'linear', adapter: createLinearAdapter('ENG') };
```

### Azure DevOps

```sh
npm install --save-dev @issuebabel/core @issuebabel/azure @issuebabel/hooks
```

```js
import { azureAdapter } from '@issuebabel/azure';
export default { platform: 'azure', adapter: azureAdapter };
```

---

## Commit Formatı

```
<type>(<scope>): <description> <issue-ref>
```

| Platform | Format | Örnek |
|----------|--------|-------|
| GitHub | `#N` | `feat(auth): add login #123` |
| Jira | `KEY-N` | `fix(api): crash PROJ-456` |
| Linear | `KEY-N` | `perf(db): optimize ENG-789` |
| Azure | `AB#N` | `chore: update deps AB#42` |

### Commit Types

| Type | When to Use | Example |
|------|-------------|---------|
| `feat` | Adding a brand new feature | `feat(auth): add login page #123` |
| `fix` | Fixing a bug | `fix(api): handle null response #456` |
| `chore` | Maintenance that doesn't change app behavior | `chore: upgrade eslint to v9` |
| `test` | Adding or updating tests | `test(auth): add login unit tests` |
| `style` | Formatting, whitespace — no logic change | `style: format files with prettier` |
| `refactor` | Restructuring code without changing behavior | `refactor(db): extract query builder` |
| `docs` | Documentation changes only | `docs: update README` |
| `rename` | Renaming a file or folder | `rename: LoginPage → AuthPage` |
| `move` | Moving a file or folder | `move: utils → src/shared/utils` |
| `perf` | Performance improvements | `perf(db): add index on users.email` |
| `build` | Build system or dependency changes | `build: add webpack bundle analyzer` |
| `ci` | CI/CD configuration changes | `ci: add GitHub Actions deploy workflow` |
| `revert` | Reverting a previous commit | `revert: feat(auth): add login #123` |

### Breaking Change

```
feat!: remove deprecated auth endpoint #123
```

---

## Branch Formatı

```
<type>/<issue-ref>-<description>
```

```
feat/123-add-login-page
fix/PROJ-456-null-pointer
hotfix/AB-789-critical-bug
chore/update-deps
```

### Branch Types

| Branch | Purpose | Naming | Example |
|--------|---------|--------|---------|
| `main` | Always stable and deployable. The source of truth. Never commit directly. | — | `main` |
| `develop` | Collects finished features before a release. Optional but recommended. | — | `develop` |
| `feature/` | One branch per feature. Opened from `develop`, merged back and deleted when done. | `feature/<issue>-<description>` | `feature/123-add-login` |
| `fix/` or `bugfix/` | For fixing a non-critical bug. Opened from `develop`. | `fix/<issue>-<description>` | `fix/456-null-crash` |
| `hotfix/` | Urgent production fixes. Opened directly from `main`, merged to both `main` and `develop`. | `hotfix/<issue>-<description>` | `hotfix/789-payment-crash` |
| `release/` | Release preparation. Only bugfixes and version bumps allowed. | `release/<version>` | `release/2.1.0` |

`main`, `master`, `develop`, `staging`, `production`, `release/*` are always allowed regardless of config.

---

## Hook'lar

| Hook | Çalışma Zamanı | Ne Yapar |
|------|---------------|----------|
| `commit-msg` | Her commit | Mesaj formatı + issue ref |
| `pre-push` | Her push | Branch adı + build |
| `pre-commit` | Her commit öncesi | Lint + (opsiyonel) build |

---

## Geliştirme

```sh
git clone https://github.com/issuebabel/issuebabel
cd issuebabel
npm install
npm run build
npm test
```

---

## Lisans

MIT
