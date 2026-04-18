#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { loadConfig, defaultConfig, validateBranchName, logger } from '@issuebabel/core';

function currentBranch(): string {
  return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
}

function run(command: string, label: string): boolean {
  logger.info(`${label}: ${command}`);
  try {
    execSync(command, { stdio: 'inherit' });
    logger.success(`${label} başarılı.`);
    return true;
  } catch {
    logger.error(`${label} başarısız.`);
    return false;
  }
}

async function main(): Promise<void> {
  let config;
  try {
    config = await loadConfig();
  } catch {
    logger.warn('Config bulunamadı, varsayılan ayarlar kullanılıyor.');
    config = defaultConfig();
  }

  logger.banner('pre-push kontrolleri');

  // 1. Branch adı doğrula
  const branch = currentBranch();
  logger.info(`Branch: ${branch}`);

  const branchResult = validateBranchName(branch, config);
  for (const w of branchResult.warnings) logger.warn(w);
  if (!branchResult.valid) {
    for (const e of branchResult.errors) logger.error(e);
    process.exit(1);
  }
  logger.success('Branch adı geçerli.');
  console.log('');

  // 2. Build kontrolü
  if (config.build && config.build.runOn !== 'pre-commit') {
    if (!run(config.build.command, 'Build')) process.exit(1);
    console.log('');
  }

  logger.success('Tüm pre-push kontrolleri geçti.');
}

main().catch((err: unknown) => {
  logger.error(String(err));
  process.exit(1);
});
