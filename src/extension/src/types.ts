export interface RepoContext {
    currentBranch: string;
    branches: string[];
    hasUncommittedChanges: boolean;
    statusSummary: string;
}

export interface Translation {
    command: string;
    explanation: string;
    tier: string;
    risk?: string;
    requiresConfirmation?: boolean;
    warning?: string;
    alternatives?: { command: string; description: string }[];
}

export interface RiskResult {
    level: 'safe' | 'moderate' | 'dangerous';
    requiresConfirmation: boolean;
    warning: string | null;
}

export interface GitPattern {
    regex: RegExp;
    command: string | ((match: RegExpMatchArray, ctx: RepoContext) => string);
    explanation: (match: RegExpMatchArray, ctx: RepoContext) => string;
}
