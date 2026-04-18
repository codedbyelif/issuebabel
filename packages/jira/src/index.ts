import type { PlatformAdapter } from '@issuebabel/core';

// Jira issue format: PROJ-123  (özelleştirilebilir proje key)
export function createJiraAdapter(projectKey: string): PlatformAdapter {
  const pattern = new RegExp(`\\b${projectKey}-\\d+\\b`);
  return {
    name: 'jira',
    issuePattern: pattern,
    extractIssueRef: (text) => text.match(pattern)?.[0],
    validateIssueRef: (ref) => pattern.test(ref),
    example: `${projectKey}-123`,
  };
}
