#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { loadConfig, defaultConfig, validateCommitMessage, logger } from '@issuebabel/core';

const SKIP_PATTERNS = [/^Merge /, /^Revert "/, /^Initial commit/];

async function run(): Promise<void> {
  const commitMsgFile = process.argv[2];
  if (!commitMsgFile) {
    logger.error('commit-msg hook: dosya yolu belirtilmedi.');
    process.exit(1);
  }

  const raw = readFileSync(commitMsgFile, 'utf-8').trim();

  if (SKIP_PATTERNS.some((p) => p.test(raw))) process.exit(0);

  let config;
  try {
    config = await loadConfig();
  } catch {
    logger.warn('Config bulunamadı, varsayılan ayarlar kullanılıyor.');
    config = defaultConfig();
  }

  logger.banner('commit mesajı doğrulanıyor');
  logger.dim(`  ${raw.split('\n')[0]}`);
  console.log('');

  const result = validateCommitMessage(raw, config);

  for (const w of result.warnings) logger.warn(w);

  if (!result.valid) {
    for (const e of result.errors) logger.error(e);
    console.log('');
    logger.info('Commit mesajını düzeltip tekrar deneyin.');
    process.exit(1);
  }

  logger.success('Commit mesajı geçerli.');
}

run().catch((err: unknown) => {
  logger.error(String(err));
  process.exit(1);
});
