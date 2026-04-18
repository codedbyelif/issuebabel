#!/usr/bin/env node
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';
import { loadConfig, defaultConfig, validateCommitMessage, validateBranchName, logger } from '@issuebabel/core';

const HOOK_SCRIPTS: Record<string, string> = {
  'commit-msg': `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"
node_modules/.bin/issuebabel-commit-msg "$1"
`,
  'pre-push': `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"
node_modules/.bin/issuebabel-pre-push
`,
  'pre-commit': `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"
node_modules/.bin/issuebabel-pre-commit
`,
};

// ─── init ────────────────────────────────────────────────────────────────────

async function cmdInit(): Promise<void> {
  logger.banner('kurulum başlatılıyor');
  const cwd = process.cwd();

  // 1. Config
  const configPath = join(cwd, 'issuebabel.config.js');
  if (existsSync(configPath)) {
    logger.warn('issuebabel.config.js zaten var, atlanıyor.');
  } else {
    const platform = detectPlatform();
    writeFileSync(configPath, buildConfigTemplate(platform));
    logger.success(`issuebabel.config.js oluşturuldu  (platform: ${platform})`);
  }

  // 2. Husky
  if (!existsSync(join(cwd, 'node_modules', 'husky'))) {
    logger.info('Husky yükleniyor...');
    try {
      execSync('npm install --save-dev husky', { stdio: 'inherit', cwd });
      execSync('npx husky install', { stdio: 'inherit', cwd });
    } catch {
      logger.error('Husky kurulamadı. Manuel olarak: npm install --save-dev husky');
      process.exit(1);
    }
  }

  // 3. Hook dosyaları
  const huskyDir = join(cwd, '.husky');
  mkdirSync(huskyDir, { recursive: true });

  for (const [name, content] of Object.entries(HOOK_SCRIPTS)) {
    const hookPath = join(huskyDir, name);
    if (existsSync(hookPath)) {
      logger.warn(`.husky/${name} zaten var, atlanıyor.`);
    } else {
      writeFileSync(hookPath, content, { mode: 0o755 });
      logger.success(`.husky/${name} oluşturuldu.`);
    }
  }

  // 4. prepare script
  addPrepareScript(cwd);

  console.log('');
  logger.success('Kurulum tamamlandı! issuebabel.config.js dosyasını düzenleyin.');
}

function detectPlatform(): string {
  try {
    const remote = execSync('git remote get-url origin 2>/dev/null', { encoding: 'utf-8' }).trim();
    if (remote.includes('github.com')) return 'github';
    if (remote.includes('dev.azure.com') || remote.includes('visualstudio.com')) return 'azure';
  } catch { /* git remote yok */ }
  return 'github';
}

function buildConfigTemplate(platform: string): string {
  const adapterImports: Record<string, string> = {
    github: `import { githubAdapter } from '@issuebabel/github';`,
    jira:   `import { createJiraAdapter } from '@issuebabel/jira';`,
    linear: `import { createLinearAdapter } from '@issuebabel/linear';`,
    azure:  `import { azureAdapter } from '@issuebabel/azure';`,
  };

  const adapterUsage: Record<string, string> = {
    github: `  adapter: githubAdapter,`,
    jira:   `  adapter: createJiraAdapter('PROJ'), // Jira proje key'inizi girin`,
    linear: `  adapter: createLinearAdapter('ENG'), // Linear takım key'inizi girin`,
    azure:  `  adapter: azureAdapter,`,
  };

  return `// issuebabel konfigürasyonu
${adapterImports[platform] ?? adapterImports.github}

/** @type {import('@issuebabel/core').IssueBabelConfig} */
export default {
  platform: '${platform}',
${adapterUsage[platform] ?? adapterUsage.github}
  requireIssueRef: true,
  commitTypes: ['feat', 'fix', 'chore', 'docs', 'style', 'refactor', 'perf', 'test', 'build', 'ci', 'revert'],
  branch: {
    requireIssueRef: false,
    allowedTypes: ['feat', 'fix', 'chore', 'docs', 'refactor', 'perf', 'test', 'build', 'ci', 'hotfix', 'release'],
  },
  lint: {
    command: 'npm run lint',
  },
  build: {
    command: 'npm run build',
    runOn: 'pre-push',
  },
};
`;
}

function addPrepareScript(cwd: string): void {
  const pkgPath = join(cwd, 'package.json');
  if (!existsSync(pkgPath)) return;
  try {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8')) as Record<string, unknown>;
    const scripts = (pkg.scripts ?? {}) as Record<string, string>;
    if (!scripts.prepare) {
      scripts.prepare = 'husky install';
      pkg.scripts = scripts;
      writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
      logger.success('package.json\'a "prepare": "husky install" eklendi.');
    }
  } catch {
    logger.warn('package.json güncellenemedi. Manuel ekleyin: "prepare": "husky install"');
  }
}

// ─── validate-commit ─────────────────────────────────────────────────────────

async function cmdValidateCommit(message: string): Promise<void> {
  let config;
  try { config = await loadConfig(); } catch { config = defaultConfig(); }
  const result = validateCommitMessage(message, config);
  for (const w of result.warnings) logger.warn(w);
  if (!result.valid) { for (const e of result.errors) logger.error(e); process.exit(1); }
  logger.success('Commit mesajı geçerli.');
}

// ─── validate-branch ─────────────────────────────────────────────────────────

async function cmdValidateBranch(name: string): Promise<void> {
  let config;
  try { config = await loadConfig(); } catch { config = defaultConfig(); }
  const result = validateBranchName(name, config);
  for (const w of result.warnings) logger.warn(w);
  if (!result.valid) { for (const e of result.errors) logger.error(e); process.exit(1); }
  logger.success('Branch adı geçerli.');
}

// ─── help ────────────────────────────────────────────────────────────────────

function showHelp(): void {
  console.log(`
issuebabel — platform-agnostic commit & branch validator

KULLANIM:
  issuebabel <komut> [argüman]

KOMUTLAR:
  init                       Projeye issuebabel ekle (config + husky hook'ları)
  validate-commit <mesaj>    Commit mesajını doğrula
  validate-branch <branch>   Branch adını doğrula
  help                       Bu metni göster

ÖRNEKLER:
  issuebabel init
  issuebabel validate-commit "feat(auth): add login #123"
  issuebabel validate-branch "feat/123-add-login"
`);
}

// ─── main ────────────────────────────────────────────────────────────────────

const [, , command, ...args] = process.argv;

switch (command) {
  case 'init':           await cmdInit(); break;
  case 'validate-commit':
    if (!args[0]) { logger.error('Commit mesajı belirtilmedi.'); process.exit(1); }
    await cmdValidateCommit(args.join(' '));
    break;
  case 'validate-branch':
    if (!args[0]) { logger.error('Branch adı belirtilmedi.'); process.exit(1); }
    await cmdValidateBranch(args[0]);
    break;
  default: showHelp();
}
