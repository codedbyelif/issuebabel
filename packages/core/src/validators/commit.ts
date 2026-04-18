import type { IssueBabelConfig, ParsedCommit, ValidationResult } from '../types.js';

const DEFAULT_TYPES = [
  'feat','fix','chore','docs','style',
  'refactor','perf','test','build','ci','revert',
];

// type(scope)!: description
const COMMIT_REGEX = /^(?<type>[a-z]+)(?:\((?<scope>[^)]+)\))?(?<breaking>!)?:\s(?<description>.+)$/;

export function parseCommitMessage(raw: string): ParsedCommit | null {
  const firstLine = raw.split('\n')[0].trim();
  const match = firstLine.match(COMMIT_REGEX);
  if (!match?.groups) return null;

  const { type, scope, breaking, description } = match.groups;
  return { type, scope, description: description.trim(), breaking: breaking === '!', raw: firstLine };
}

export function validateCommitMessage(raw: string, config: IssueBabelConfig): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const firstLine = raw.split('\n')[0].trim();

  if (!firstLine) return { valid: false, errors: ['Commit mesajı boş olamaz.'], warnings };

  const parsed = parseCommitMessage(firstLine);
  const allowedTypes = config.commitTypes ?? DEFAULT_TYPES;
  const adapter = config.adapter;

  if (!parsed) {
    const example = adapter ? `feat(scope): description ${adapter.example}` : 'feat(scope): description #123';
    errors.push(
      `Geçersiz format.\n  Beklenen: <type>(<scope>): <description> [issue-ref]\n  Örnek:    ${example}\n  Tipler:   ${allowedTypes.join(', ')}`,
    );
    return { valid: false, errors, warnings };
  }

  if (!allowedTypes.includes(parsed.type)) {
    errors.push(`"${parsed.type}" geçerli bir commit tipi değil.\n  Geçerli tipler: ${allowedTypes.join(', ')}`);
  }

  if ((config.requireIssueRef ?? true) && adapter) {
    const ref = adapter.extractIssueRef(firstLine);
    if (!ref) {
      errors.push(
        `Issue referansı bulunamadı.\n  Platform: ${adapter.name} → ${adapter.example}\n  Örnek: feat(scope): description ${adapter.example}`,
      );
    }
  }

  if (firstLine.length > 100) {
    warnings.push(`Commit başlığı 100 karakterden uzun (${firstLine.length} karakter).`);
  }

  return { valid: errors.length === 0, errors, warnings };
}
