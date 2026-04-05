import { RiskResult } from './types';

export function classifyRisk(command: string): RiskResult {
    const cmd = command.toLowerCase();

    // DANGEROUS — force, hard reset, destructive
    // Note: some patterns use original `command` to preserve case sensitivity (e.g. -D vs -d)
    const dangerous: { pattern: RegExp; useOriginal?: boolean; warning: string }[] = [
        { pattern: /--force|-f(?:\s|$)/, warning: 'Force operation — may overwrite remote history' },
        { pattern: /reset\s+--hard/, warning: 'Hard reset — permanently discards uncommitted changes' },
        { pattern: /clean\s+-[fd]/i, warning: 'Clean — permanently deletes untracked files' },
        { pattern: /branch\s+-D\s/, useOriginal: true, warning: 'Force delete — deletes branch even if not merged' },
        { pattern: /push.*--force/, warning: 'Force push — rewrites remote history, affects collaborators' },
        { pattern: /checkout\s+--\s+\./, warning: 'Discards ALL uncommitted changes — cannot be undone' },
        { pattern: /reset\s+head~/i, warning: 'Reset — moves HEAD backwards, may lose commits' },
        { pattern: /filter-branch/, warning: 'Rewrites repository history' },
        { pattern: /reflog\s+expire/, warning: 'Expires reflog entries — reduces recovery options' },
    ];

    for (const d of dangerous) {
        const target = d.useOriginal ? command : cmd;
        if (d.pattern.test(target)) {
            return { level: 'dangerous', requiresConfirmation: true, warning: d.warning };
        }
    }

    // MODERATE — merge, rebase, checkout, stash pop, commit amend, squash, bisect
    const moderate = [
        /merge\s/, /rebase\s/, /checkout\s/, /stash\s+pop/,
        /reset\s+--soft/, /cherry-pick/, /branch\s+-d\s/,
        /commit\s+--amend/, /tag\s+-d\s/, /bisect\s/,
        /worktree\s+add/, /merge\s+--abort/, /rebase\s+--abort/
    ];

    if (moderate.some(p => p.test(cmd))) {
        return { level: 'moderate', requiresConfirmation: true, warning: null };
    }

    // SAFE — read-only and low-risk operations
    return { level: 'safe', requiresConfirmation: false, warning: null };
}
