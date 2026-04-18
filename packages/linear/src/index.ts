import type { PlatformAdapter } from '@issuebabel/core';

// Linear issue format: ENG-123  (takım key büyük/küçük harf fark etmez)
export function createLinearAdapter(teamKey: string): PlatformAdapter {
  const key = teamKey.toUpperCase();
  const pattern = new RegExp(`\\b${key}-\\d+\\b`, 'i');
  return {
    name: 'linear',
    issuePattern: pattern,
    extractIssueRef: (text) => text.match(pattern)?.[0]?.toUpperCase(),
    validateIssueRef: (ref) => pattern.test(ref),
    example: `${key}-123`,
  };
}
