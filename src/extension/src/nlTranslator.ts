import * as vscode from 'vscode';
import { patterns } from './gitPatterns';
import { RepoContext, Translation } from './types';

export async function translateNL(input: string, ctx: RepoContext): Promise<Translation> {
    // TIER 1: Regex pattern matching (instant, offline)
    const tier1 = matchPattern(input, ctx);
    if (tier1) { return { ...tier1, tier: 'regex' }; }

    // TIER 2: Fuzzy keyword matching (fast, offline)
    const tier2 = fuzzyMatch(input, ctx);
    if (tier2) { return { ...tier2, tier: 'fuzzy' }; }

    // TIER 3: VS Code Language Model API (requires Copilot)
    try {
        const tier3 = await llmTranslate(input, ctx);
        if (tier3) { return { ...tier3, tier: 'llm' }; }
    } catch {
        // LLM unavailable — return best-effort suggestion
    }

    return {
        command: '',
        explanation: `Could not understand: "${input}". Try something like "switch to main" or "pull latest".`,
        tier: 'none'
    };
}

function matchPattern(input: string, ctx: RepoContext): Omit<Translation, 'tier'> | null {
    const text = input.trim().toLowerCase();
    for (const p of patterns) {
        const match = text.match(p.regex);
        if (match) {
            const cmd = typeof p.command === 'function' ? p.command(match, ctx) : p.command;
            return { command: cmd, explanation: p.explanation(match, ctx) };
        }
    }
    return null;
}

function fuzzyMatch(input: string, ctx: RepoContext): Omit<Translation, 'tier'> | null {
    const text = input.trim().toLowerCase();
    const words = text.split(/\s+/);

    // Find branch name in input by checking against actual branches
    const branchRef = ctx.branches.find(b =>
        text.includes(b.toLowerCase()) ||
        text.includes(b.replace('origin/', '').toLowerCase())
    );

    // Fuzzy intent detection
    if (words.some(w => ['switch', 'checkout', 'go', 'change'].includes(w)) && branchRef) {
        return { command: `git checkout ${branchRef}`, explanation: `Switch to branch ${branchRef}` };
    }
    if (words.some(w => ['pull', 'update', 'download', 'get'].includes(w)) && words.some(w => ['latest', 'changes', 'new', 'recent'].includes(w))) {
        return { command: 'git pull', explanation: 'Pull latest changes from remote' };
    }
    if (words.some(w => ['push', 'upload', 'send'].includes(w))) {
        return { command: 'git push', explanation: 'Push local commits to remote' };
    }
    if (words.some(w => ['stash', 'save', 'park'].includes(w)) && words.some(w => ['changes', 'work', 'everything'].includes(w))) {
        return { command: 'git stash', explanation: 'Stash uncommitted changes' };
    }
    if (words.some(w => ['undo', 'revert', 'rollback'].includes(w)) && words.some(w => ['commit', 'last'].includes(w))) {
        return { command: 'git reset --soft HEAD~1', explanation: 'Undo last commit, keep changes staged' };
    }
    if (words.some(w => ['merge'].includes(w)) && branchRef) {
        return { command: `git merge ${branchRef}`, explanation: `Merge ${branchRef} into ${ctx.currentBranch}` };
    }

    return null;
}

async function llmTranslate(input: string, ctx: RepoContext): Promise<Omit<Translation, 'tier'> | null> {
    const models = await vscode.lm.selectChatModels({ vendor: 'copilot', family: 'gpt-4o-mini' });
    if (models.length === 0) { return null; }

    const model = models[0];
    const prompt = `You are a Git command translator. Given the user's natural language request and the repository context, return ONLY a JSON object with these fields:
- "command": the exact git CLI command(s) to run (use && for multiple commands)
- "explanation": one-sentence plain English explanation of what the command does
- "alternatives": array of {command, description} for safer alternatives (if applicable)

Repository context:
- Current branch: ${ctx.currentBranch}
- Available branches: ${ctx.branches.slice(0, 30).join(', ')}
- Has uncommitted changes: ${ctx.hasUncommittedChanges}
${ctx.hasUncommittedChanges ? `- Status: ${ctx.statusSummary.slice(0, 200)}` : ''}

RULES:
- Only generate git commands. Never generate non-git shell commands.
- If the request is ambiguous, pick the safest interpretation.
- If the request doesn't make sense as a git operation, set command to empty string.
- Return ONLY valid JSON. No markdown, no backticks, no explanation outside JSON.

User request: "${input}"`;

    const messages = [vscode.LanguageModelChatMessage.User(prompt)];
    const response = await model.sendRequest(messages, {}, new vscode.CancellationTokenSource().token);

    let result = '';
    for await (const chunk of response.text) { result += chunk; }

    try {
        const cleaned = result.replace(/```json\s*/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleaned);
    } catch {
        return null;
    }
}

export async function getAutocompleteSuggestions(partial: string, _cwd: string): Promise<any[]> {
    const suggestions: any[] = [];
    const text = partial.toLowerCase();

    const commands = [
        { text: 'switch to ', type: 'action', description: 'Switch to a branch' },
        { text: 'pull latest', type: 'action', description: 'Pull from remote' },
        { text: 'push changes', type: 'action', description: 'Push to remote' },
        { text: 'stash my changes', type: 'action', description: 'Stash uncommitted work' },
        { text: 'stash and go to ', type: 'action', description: 'Stash then switch branch' },
        { text: 'merge ', type: 'action', description: 'Merge a branch' },
        { text: 'create branch ', type: 'action', description: 'Create new branch' },
        { text: 'delete branch ', type: 'action', description: 'Delete a branch' },
        { text: 'undo last commit', type: 'action', description: 'Undo the last commit' },
        { text: 'fetch all', type: 'action', description: 'Fetch from all remotes' },
        { text: 'rebase onto ', type: 'action', description: 'Rebase current branch' },
        { text: 'show log', type: 'action', description: 'Show commit history' },
        { text: 'what changed', type: 'action', description: 'Show diff of changes' },
        // === New advanced commands ===
        { text: 'stage all', type: 'action', description: 'Stage all changes' },
        { text: 'stage ', type: 'action', description: 'Stage a file' },
        { text: 'unstage all', type: 'action', description: 'Unstage all changes' },
        { text: 'unstage ', type: 'action', description: 'Unstage a file' },
        { text: 'commit message ', type: 'action', description: 'Commit with message' },
        { text: 'commit all message ', type: 'action', description: 'Stage all and commit' },
        { text: 'amend commit', type: 'action', description: 'Amend last commit' },
        { text: 'cherry-pick ', type: 'action', description: 'Cherry-pick a commit' },
        { text: 'blame ', type: 'action', description: 'Show file blame' },
        { text: 'tag ', type: 'action', description: 'Create a tag' },
        { text: 'delete tag ', type: 'action', description: 'Delete a tag' },
        { text: 'abort merge', type: 'action', description: 'Abort current merge' },
        { text: 'abort rebase', type: 'action', description: 'Abort current rebase' },
        { text: 'continue merge', type: 'action', description: 'Continue after conflicts' },
        { text: 'continue rebase', type: 'action', description: 'Continue rebase' },
        { text: 'discard all changes', type: 'action', description: 'Reset working directory' },
        { text: 'squash last ', type: 'action', description: 'Squash N commits' },
        { text: 'bisect start', type: 'action', description: 'Start bisect' },
        { text: 'bisect good', type: 'action', description: 'Mark commit good' },
        { text: 'bisect bad', type: 'action', description: 'Mark commit bad' },
        { text: 'bisect reset', type: 'action', description: 'End bisect' },
        { text: 'show stash', type: 'action', description: 'Show stash contents' },
        { text: 'worktree ', type: 'action', description: 'Create worktree' },
        { text: 'list worktrees', type: 'action', description: 'List worktrees' },
        { text: 'show remote url', type: 'action', description: 'Show remote URLs' },
        { text: 'sync', type: 'action', description: 'Pull then push' },
        { text: 'hard reset', type: 'action', description: 'Hard reset (destructive!)' },
        { text: 'clean', type: 'action', description: 'Remove untracked files' },
    ];

    suggestions.push(...commands.filter(c => c.text.startsWith(text) && c.text !== text));
    return suggestions;
}
