export type Platform = 'github' | 'jira' | 'linear' | 'azure' | 'custom';

export interface PlatformAdapter {
  name: Platform;
  issuePattern: RegExp;
  extractIssueRef(text: string): string | undefined;
  validateIssueRef(ref: string): boolean;
  example: string;
}

export interface IssueBabelConfig {
  platform: Platform;
  adapter?: PlatformAdapter;
  commitTypes?: string[];
  requireIssueRef?: boolean;
  branch?: {
    requireIssueRef?: boolean;
    allowedTypes?: string[];
  };
  build?: {
    command: string;
    runOn?: 'pre-push' | 'pre-commit';
  };
  lint?: {
    command: string;
  };
}

export interface ParsedCommit {
  type: string;
  scope?: string;
  description: string;
  issueRef?: string;
  breaking: boolean;
  raw: string;
}

export interface ParsedBranch {
  type: string;
  issueRef?: string;
  description: string;
  raw: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}
