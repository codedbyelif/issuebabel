import type { IssueBabelConfig, ParsedBranch, ValidationResult } from '../types.js';

const DEFAULT_BRANCH_TYPES = [
  'feat','fix','chore','docs','refactor',
  'perf','test','build','ci','hotfix','release',
];

const PROTECTED = ['main', 'master', 'develop', 'staging', 'production'];

// type/rest  (küçük harf, rakam, nokta, tire, slash)
const BRANCH_REGEX = /^(?<type>[a-z]+)\/(?<rest>[a-z0-9._/-]+)$/;

export function parseBranchName(raw: string): ParsedBranch | null {
  const match = raw.match(BRANCH_REGEX);
  if (!match?.groups) return null;
  const { type, rest } = match.groups;
  return { type, description: rest, raw };
}

export function validateBranchName(branchName: string, config: IssueBabelConfig): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const allowedTypes = config.branch?.allowedTypes ?? DEFAULT_BRANCH_TYPES;

  if (PROTECTED.includes(branchName) || branchName.startsWith('release/')) {
    return { valid: true, errors, warnings };
  }

  const parsed = parseBranchName(branchName);
  if (!parsed) {
    errors.push(
      `Geçersiz branch adı formatı.\n  Beklenen: <type>/<issue-ref>-<description>\n  Örnek:    feat/123-add-login\n  Tipler:   ${allowedTypes.join(', ')}`,
    );
    return { valid: false, errors, warnings };
  }

  if (!allowedTypes.includes(parsed.type)) {
    errors.push(`"${parsed.type}" geçerli bir branch tipi değil.\n  Geçerli tipler: ${allowedTypes.join(', ')}`);
  }

  const adapter = config.adapter;
  if (config.branch?.requireIssueRef && adapter) {
    const ref = adapter.extractIssueRef(branchName);
    if (!ref) {
      warnings.push(`Branch adında issue referansı bulunamadı.\n  Önerilen: feat/${adapter.example}-description`);
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}
