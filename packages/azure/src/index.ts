import type { PlatformAdapter } from '@issuebabel/core';

// Azure DevOps work item format: AB#123
const PATTERN = /AB#\d+/;

export const azureAdapter: PlatformAdapter = {
  name: 'azure',
  issuePattern: PATTERN,
  extractIssueRef: (text) => text.match(PATTERN)?.[0],
  validateIssueRef: (ref) => /^AB#\d+$/.test(ref),
  example: 'AB#123',
};
