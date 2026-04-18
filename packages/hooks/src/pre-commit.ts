#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { loadConfig, defaultConfig, logger } from '@issuebabel/core';

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

  logger.banner('pre-commit kontrolleri');
  let failed = false;

  if (config.lint) {
    if (!run(config.lint.command, 'Lint')) failed = true;
    console.log('');
  }

  if (config.build?.runOn === 'pre-commit') {
    if (!run(config.build.command, 'Build')) failed = true;
    console.log('');
  }

  if (failed) {
    logger.error('Pre-commit kontrolleri başarısız.');
    process.exit(1);
  }

  logger.success('Tüm pre-commit kontrolleri geçti.');
}

main().catch((err: unknown) => {
  logger.error(String(err));
  process.exit(1);
});
