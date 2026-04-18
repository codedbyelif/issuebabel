import { existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { readFile } from 'node:fs/promises';
import type { IssueBabelConfig } from './types.js';

const CONFIG_FILES = [
  'issuebabel.config.js',
  'issuebabel.config.mjs',
  'issuebabel.config.cjs',
];

export async function loadConfig(cwd: string = process.cwd()): Promise<IssueBabelConfig> {
  for (const fileName of CONFIG_FILES) {
    const filePath = join(cwd, fileName);
    if (existsSync(filePath)) {
      const mod = await import(resolve(filePath));
      return mod.default ?? mod;
    }
  }

  const pkgPath = join(cwd, 'package.json');
  if (existsSync(pkgPath)) {
    const pkg = JSON.parse(await readFile(pkgPath, 'utf-8')) as Record<string, unknown>;
    if (pkg.issuebabel) return pkg.issuebabel as IssueBabelConfig;
  }

  throw new Error(
    'issuebabel config bulunamadı.\n  "issuebabel init" ile oluşturun.',
  );
}

export function defaultConfig(): IssueBabelConfig {
  return {
    platform: 'github',
    requireIssueRef: true,
    commitTypes: [
      'feat','fix','chore','docs','style',
      'refactor','perf','test','build','ci','revert',
    ],
    branch: {
      requireIssueRef: false,
      allowedTypes: [
        'feat','fix','chore','docs','refactor',
        'perf','test','build','ci','hotfix','release',
      ],
    },
  };
}
