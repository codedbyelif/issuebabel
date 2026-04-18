# issuebabel

**Created and maintained by [codedbyelif](https://github.com/codedbyelif)**

> Platform-agnostic commit message & branch name validator with Husky integration.
> GitHub, Jira, Linear, Azure DevOps ve daha fazlasını destekler.

---

A monorepo toolkit that enforces consistent commit messages and branch naming conventions across your entire team — regardless of which issue tracker you use. Works via Husky git hooks, so validation happens automatically on every `git commit` and `git push`.

Her issue tracker'ın farklı format kullandığı monorepo ve çok ekipli projelerde tutarlı commit mesajı ve branch adlandırma kurallarını otomatik olarak uygulayan bir araç setidir. Husky git hook'ları aracılığıyla çalışır; her `git commit` ve `git push` işleminde doğrulama otomatik gerçekleşir.

---

## Packages / Paketler

| Package | Description | Açıklama | Version |
|---------|-------------|----------|---------|
| [`@issuebabel/core`](./packages/core) | Validation engine, types, config loader | Validasyon motoru, tipler, config yükleyici | 0.1.0 |
| [`@issuebabel/github`](./packages/github) | GitHub adapter — `#123` | GitHub adaptörü | 0.1.0 |
| [`@issuebabel/jira`](./packages/jira) | Jira adapter — `PROJ-123` | Jira adaptörü | 0.1.0 |
| [`@issuebabel/linear`](./packages/linear) | Linear adapter — `ENG-123` | Linear adaptörü | 0.1.0 |
| [`@issuebabel/azure`](./packages/azure) | Azure DevOps adapter — `AB#123` | Azure DevOps adaptörü | 0.1.0 |
| [`@issuebabel/hooks`](./packages/hooks) | Husky git hook scripts | Husky git hook scriptleri | 0.1.0 |
| [`@issuebabel/cli`](./packages/cli) | CLI — `issuebabel init` | Komut satırı aracı | 0.1.0 |

---

## File Structure / Dosya Yapısı

```
issuebabel/
│
├── package.json                          # Monorepo root — npm workspaces config
├── README.md                             # This file / Bu dosya
│
└── packages/
    │
    ├── core/                             # @issuebabel/core
    │   ├── src/
    │   │   ├── types.ts                  # TypeScript types & PlatformAdapter interface
    │   │   ├── logger.ts                 # Color-coded terminal output / Renkli terminal çıktısı
    │   │   ├── config.ts                 # Config loader (issuebabel.config.js / package.json)
    │   │   ├── index.ts                  # Public API exports
    │   │   └── validators/
    │   │       ├── commit.ts             # Commit message validator / Commit mesajı doğrulayıcı
    │   │       └── branch.ts             # Branch name validator / Branch adı doğrulayıcı
    │   ├── package.json
    │   ├── tsconfig.json
    │   └── README.md
    │
    ├── github/                           # @issuebabel/github
    │   ├── src/
    │   │   └── index.ts                  # GitHub adapter — detects #123
    │   ├── package.json
    │   ├── tsconfig.json
    │   └── README.md
    │
    ├── jira/                             # @issuebabel/jira
    │   ├── src/
    │   │   └── index.ts                  # Jira adapter — detects PROJ-123
    │   ├── package.json
    │   ├── tsconfig.json
    │   └── README.md
    │
    ├── linear/                           # @issuebabel/linear
    │   ├── src/
    │   │   └── index.ts                  # Linear adapter — detects ENG-123
    │   ├── package.json
    │   ├── tsconfig.json
    │   └── README.md
    │
    ├── azure/                            # @issuebabel/azure
    │   ├── src/
    │   │   └── index.ts                  # Azure DevOps adapter — detects AB#123
    │   ├── package.json
    │   ├── tsconfig.json
    │   └── README.md
    │
    ├── hooks/                            # @issuebabel/hooks
    │   ├── src/
    │   │   ├── commit-msg.ts             # Husky commit-msg hook script
    │   │   ├── pre-commit.ts             # Husky pre-commit hook script
    │   │   └── pre-push.ts              # Husky pre-push hook script
    │   ├── package.json
    │   ├── tsconfig.json
    │   └── README.md
    │
    └── cli/                              # @issuebabel/cli
        ├── src/
        │   └── index.ts                  # CLI — init, validate-commit, validate-branch
        ├── package.json
        ├── tsconfig.json
        └── README.md
```

---

## Quick Start / Hızlı Başlangıç

```sh
npm install --save-dev @issuebabel/cli
npx issuebabel init
```

The `init` command will automatically:
- Detect your platform from your git remote URL
- Create `issuebabel.config.js` in your project root
- Install Husky if not already present
- Create `.husky/commit-msg`, `.husky/pre-push`, `.husky/pre-commit`
- Add `"prepare": "husky install"` to your `package.json`

`init` komutu otomatik olarak:
- Git remote URL'inden platformu algılar
- Proje kökünde `issuebabel.config.js` oluşturur
- Husky kurulu değilse yükler
- `.husky/commit-msg`, `.husky/pre-push`, `.husky/pre-commit` dosyalarını oluşturur
- `package.json`'a `"prepare": "husky install"` ekler

---

## How It Works / Nasıl Çalışır

```
git commit -m "feat(auth): add login #123"
     │
     ├── pre-commit hook
     │       └── runs: npm run lint
     │
     └── commit-msg hook
             └── validates: type, scope, description, issue ref
                 ✔ valid → commit created
                 ✖ invalid → commit blocked, error shown

git push
     │
     └── pre-push hook
             ├── validates: branch name format and type
             └── runs: npm run build
                 ✔ all pass → push goes through
                 ✖ any fail → push blocked, error shown
```

---

## Platform Selection / Platform Seçimi

### GitHub

```sh
npm install --save-dev @issuebabel/core @issuebabel/github @issuebabel/hooks
```

```js
// issuebabel.config.js
import { githubAdapter } from '@issuebabel/github';

export default {
  platform: 'github',
  adapter: githubAdapter,
  requireIssueRef: true,
};
```

Issue ref format: `#123`
Example / Örnek: `feat(auth): add login page #123`

---

### Jira

```sh
npm install --save-dev @issuebabel/core @issuebabel/jira @issuebabel/hooks
```

```js
// issuebabel.config.js
import { createJiraAdapter } from '@issuebabel/jira';

export default {
  platform: 'jira',
  adapter: createJiraAdapter('PROJ'), // your Jira project key / Jira proje key'iniz
  requireIssueRef: true,
};
```

Issue ref format: `PROJ-123`
Example / Örnek: `fix(api): null crash PROJ-456`

---

### Linear

```sh
npm install --save-dev @issuebabel/core @issuebabel/linear @issuebabel/hooks
```

```js
// issuebabel.config.js
import { createLinearAdapter } from '@issuebabel/linear';

export default {
  platform: 'linear',
  adapter: createLinearAdapter('ENG'), // your Linear team key / Linear takım key'iniz
  requireIssueRef: true,
};
```

Issue ref format: `ENG-123`
Example / Örnek: `perf(db): optimize query ENG-789`

---

### Azure DevOps

```sh
npm install --save-dev @issuebabel/core @issuebabel/azure @issuebabel/hooks
```

```js
// issuebabel.config.js
import { azureAdapter } from '@issuebabel/azure';

export default {
  platform: 'azure',
  adapter: azureAdapter,
  requireIssueRef: true,
};
```

Issue ref format: `AB#123`
Example / Örnek: `chore: upgrade sdk AB#42`

---

## Commit Message Format / Commit Mesajı Formatı

```
<type>(<scope>): <description> <issue-ref>
  │       │            │            │
  │       │            │            └─ Issue reference (#123, PROJ-123, ENG-123, AB#123)
  │       │            └─ Short description in present tense / Kısa açıklama
  │       └─ Optional — affected area (auth, api, ui...) / Opsiyonel — etkilenen alan
  └─ Required — one of the commit types below / Zorunlu — aşağıdaki commit tiplerinden biri
```

### Platform Issue Reference Formats

| Platform | Format | Example / Örnek |
|----------|--------|---------|
| GitHub | `#N` | `feat(auth): add login #123` |
| Jira | `KEY-N` | `fix(api): crash PROJ-456` |
| Linear | `KEY-N` | `perf(db): optimize ENG-789` |
| Azure DevOps | `AB#N` | `chore: update deps AB#42` |

### Commit Types / Commit Tipleri

| Type | When to Use / Ne Zaman Kullanılır | Example / Örnek |
|------|----------------------------------|---------|
| `feat` | Adding a brand new feature / Yeni bir özellik eklendiğinde | `feat(auth): add login page #123` |
| `fix` | Fixing a bug / Hata düzeltildiğinde | `fix(api): handle null response #456` |
| `chore` | Maintenance, no behavior change / Davranış değiştirmeyen bakım işleri | `chore: upgrade eslint to v9` |
| `test` | Adding or updating tests / Test eklendiğinde veya güncellendiğinde | `test(auth): add login unit tests` |
| `style` | Formatting only, no logic change / Sadece biçimlendirme, mantık değişikliği yok | `style: format files with prettier` |
| `refactor` | Restructuring without behavior change / Davranış değiştirmeden kod yeniden düzenleme | `refactor(db): extract query builder` |
| `docs` | Documentation changes only / Sadece dokümantasyon değişiklikleri | `docs: update README` |
| `rename` | Renaming a file or folder / Dosya veya klasör yeniden adlandırma | `rename: LoginPage → AuthPage` |
| `move` | Moving a file or folder / Dosya veya klasör taşıma | `move: utils → src/shared/utils` |
| `perf` | Performance improvements / Performans iyileştirmeleri | `perf(db): add index on users.email` |
| `build` | Build system or dependency changes / Derleme sistemi veya bağımlılık değişiklikleri | `build: add webpack bundle analyzer` |
| `ci` | CI/CD configuration changes / CI/CD yapılandırma değişiklikleri | `ci: add GitHub Actions deploy workflow` |
| `revert` | Reverting a previous commit / Önceki bir commit'i geri alma | `revert: feat(auth): add login #123` |

### Breaking Change / Kırıcı Değişiklik

Add `!` after the type to mark a breaking change.
Kırıcı değişikliği işaretlemek için tipten sonra `!` ekleyin.

```
feat!: remove deprecated auth endpoint #123
feat(api)!: rename /users to /accounts PROJ-99
```

---

## Branch Name Format / Branch Adı Formatı

```
<type>/<issue-ref>-<short-description>
   │        │               │
   │        │               └─ Lowercase, hyphen-separated / Küçük harf, tire ile ayrılmış
   │        └─ Optional but recommended / Opsiyonel ama önerilir
   └─ Required — one of the branch types below / Zorunlu — aşağıdaki branch tiplerinden biri
```

```
feat/123-add-login-page
fix/PROJ-456-null-pointer-crash
hotfix/AB-789-critical-payment-bug
chore/update-all-dependencies
release/2.1.0
```

### Branch Types / Branch Tipleri

| Branch | Purpose / Amaç | Naming / İsimlendirme | Example / Örnek |
|--------|---------------|----------------------|---------|
| `main` | Always stable and deployable. Never commit directly. / Her zaman stabil ve yayınlanabilir. Doğrudan commit atılmaz. | — | `main` |
| `develop` | Collects finished features before a release. Optional. / Yayın öncesi tamamlanan özelliklerin toplandığı branch. İsteğe bağlı. | — | `develop` |
| `feature/` | One branch per feature. Merged and deleted when done. / Her özellik için bir branch. Tamamlanınca merge edilip silinir. | `feature/<issue>-<desc>` | `feature/123-add-login` |
| `fix/` or `bugfix/` | Non-urgent bug fixes. Opened from `develop`. / Acil olmayan hata düzeltmeleri. `develop`'tan açılır. | `fix/<issue>-<desc>` | `fix/456-null-crash` |
| `hotfix/` | Urgent production fixes. Opened from `main`. / Acil üretim hataları. Doğrudan `main`'den açılır. | `hotfix/<issue>-<desc>` | `hotfix/789-payment-crash` |
| `release/` | Release preparation. Only bugfixes allowed. / Sürüm hazırlığı. Sadece hata düzeltmelerine izin verilir. | `release/<version>` | `release/2.1.0` |

Protected branches — always valid regardless of config:
Korumalı branch'ler — config'den bağımsız olarak her zaman geçerlidir:

`main` `master` `develop` `staging` `production` `release/*`

---

## Hooks / Hook'lar

| Hook | Triggered by / Tetikleyen | What it does / Ne yapar |
|------|--------------------------|------------------------|
| `pre-commit` | `git commit` | Runs lint (and optionally build) / Lint çalıştırır (ve opsiyonel olarak build) |
| `commit-msg` | `git commit` | Validates commit message format and issue ref / Commit mesajı formatını ve issue ref'i doğrular |
| `pre-push` | `git push` | Validates branch name and runs build / Branch adını doğrular ve build çalıştırır |

---

## Full Config Reference / Tam Konfigürasyon Referansı

```js
// issuebabel.config.js
import { githubAdapter } from '@issuebabel/github';

export default {
  // Issue tracker platform
  platform: 'github', // 'github' | 'jira' | 'linear' | 'azure' | 'custom'

  // Platform adapter — handles issue ref detection
  adapter: githubAdapter,

  // Block commits without an issue reference / Issue ref olmayan commit'leri engelle
  // Default: true
  requireIssueRef: true,

  // Allowed commit types / İzin verilen commit tipleri
  commitTypes: [
    'feat', 'fix', 'chore', 'docs', 'style',
    'refactor', 'perf', 'test', 'build', 'ci',
    'revert', 'rename', 'move',
  ],

  // Branch name rules / Branch adı kuralları
  branch: {
    requireIssueRef: false,  // warn only / sadece uyarı
    allowedTypes: [
      'feat', 'fix', 'bugfix', 'hotfix',
      'chore', 'docs', 'refactor', 'perf',
      'test', 'build', 'ci', 'release',
    ],
  },

  // Runs on pre-commit / pre-commit'te çalışır
  lint: {
    command: 'npm run lint',
  },

  // Runs on pre-push by default / Varsayılan olarak pre-push'ta çalışır
  build: {
    command: 'npm run build',
    runOn: 'pre-push', // 'pre-push' | 'pre-commit'
  },
};
```

---

## Development / Geliştirme

```sh
# Clone the repository / Repoyu klonla
git clone https://github.com/codedbyelif/issuebabel
cd issuebabel

# Install dependencies / Bağımlılıkları yükle
npm install

# Build all packages / Tüm paketleri derle
npm run build

# Run tests / Testleri çalıştır
npm test
```

---

## License / Lisans

[MIT](./LICENSE) © [codedbyelif](https://github.com/codedbyelif)

---

<p align="center">
  Made with care by <a href="https://github.com/codedbyelif">codedbyelif</a>
</p>
