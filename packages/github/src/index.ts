import type { PlatformAdapter } from '@issuebabel/core';

// GitHub issue format: #123
const PATTERN = /#\d+/;

export const githubAdapter: PlatformAdapter = {
  name: 'github',
  issuePattern: PATTERN,
  extractIssueRef: (text) => text.match(PATTERN)?.[0],
  validateIssueRef: (ref) => /^#\d+$/.test(ref),
  example: '#123',
};
