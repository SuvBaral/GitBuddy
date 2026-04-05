import { patterns } from '../../src/extension/src/gitPatterns';
import { RepoContext } from '../../src/extension/src/types';

const ctx: RepoContext = {
    currentBranch: 'develop',
    branches: ['main', 'develop', 'feature-login', 'origin/main', 'origin/develop'],
    hasUncommittedChanges: false,
    statusSummary: ''
};

function matchFirst(input: string): { command: string; explanation: string } | null {
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

describe('gitPatterns — Tier 1 Regex Matching', () => {

    // === Switch/Checkout ===
    describe('Switch/Checkout patterns', () => {
        test.each([
            ['switch to main', 'git checkout main'],
            ['go to develop', 'git checkout develop'],
            ['checkout feature-login', 'git checkout feature-login'],
            ['change to branch main', 'git checkout main'],
            ['switch to branch develop', 'git checkout develop'],
        ])('"%s" → %s', (input, expected) => {
            const result = matchFirst(input);
            expect(result).not.toBeNull();
            expect(result!.command).toBe(expected);
        });
    });

    // === Pull ===
    describe('Pull patterns', () => {
        test.each([
            ['pull', 'git pull'],
            ['pull latest', 'git pull'],
            ['get changes', 'git pull'],
            ['download new', 'git pull'],
            ['update', 'git pull'],
        ])('"%s" → %s', (input, expected) => {
            const result = matchFirst(input);
            expect(result).not.toBeNull();
            expect(result!.command).toBe(expected);
        });
    });

    // === Push ===
    describe('Push patterns', () => {
        test.each([
            ['push', 'git push'],
            ['push changes', 'git push'],
            ['upload commits', 'git push'],
            ['send my work', 'git push'],
        ])('"%s" → %s', (input, expected) => {
            const result = matchFirst(input);
            expect(result).not.toBeNull();
            expect(result!.command).toBe(expected);
        });
    });

    // === Fetch ===
    describe('Fetch patterns', () => {
        test.each([
            ['fetch', 'git fetch --all --prune'],
            ['fetch all', 'git fetch --all --prune'],
            ['refresh remotes', 'git fetch --all --prune'],
        ])('"%s" → %s', (input, expected) => {
            const result = matchFirst(input);
            expect(result).not.toBeNull();
            expect(result!.command).toBe(expected);
        });
    });

    // === Stash ===
    describe('Stash patterns', () => {
        test.each([
            ['stash', 'git stash'],
            ['stash changes', 'git stash'],
            ['save my work', 'git stash'],
            ['park changes', 'git stash'],
        ])('"%s" → %s', (input, expected) => {
            const result = matchFirst(input);
            expect(result).not.toBeNull();
            expect(result!.command).toBe(expected);
        });
    });

    // === Stash + Checkout combo ===
    describe('Stash + Checkout combo', () => {
        test('stash and switch', () => {
            const result = matchFirst('stash my changes and switch to main');
            expect(result).not.toBeNull();
            expect(result!.command).toBe('git stash && git checkout main');
        });

        test('stash then go to', () => {
            const result = matchFirst('stash changes then go to feature-login');
            expect(result).not.toBeNull();
            expect(result!.command).toBe('git stash && git checkout feature-login');
        });
    });

    // === Undo commit ===
    describe('Undo last commit', () => {
        test.each([
            ['undo last commit', 'git reset --soft HEAD~1'],
            ['undo commit', 'git reset --soft HEAD~1'],
            ['revert last commit', 'git reset --soft HEAD~1'],
            ['rollback commit', 'git reset --soft HEAD~1'],
        ])('"%s" → %s', (input, expected) => {
            const result = matchFirst(input);
            expect(result).not.toBeNull();
            expect(result!.command).toBe(expected);
        });
    });

    // === Merge ===
    describe('Merge patterns', () => {
        test('merge branch', () => {
            const result = matchFirst('merge main into current');
            expect(result).not.toBeNull();
            expect(result!.command).toBe('git merge main');
            expect(result!.explanation).toContain('develop'); // merging into current branch
        });
    });

    // === Rebase ===
    describe('Rebase patterns', () => {
        test('rebase onto', () => {
            const result = matchFirst('rebase onto main');
            expect(result).not.toBeNull();
            expect(result!.command).toBe('git rebase main');
        });

        test('rebase on', () => {
            const result = matchFirst('rebase on develop');
            expect(result).not.toBeNull();
            expect(result!.command).toBe('git rebase develop');
        });
    });

    // === Create branch ===
    describe('Create branch patterns', () => {
        test.each([
            ['create branch feature-new', 'git checkout -b feature-new'],
            ['new branch called bugfix', 'git checkout -b bugfix'],
            ['make a branch named hotfix', 'git checkout -b hotfix'],
        ])('"%s" → %s', (input, expected) => {
            const result = matchFirst(input);
            expect(result).not.toBeNull();
            expect(result!.command).toBe(expected);
        });
    });

    // === Delete branch ===
    describe('Delete branch patterns', () => {
        test.each([
            ['delete branch feature-old', 'git branch -d feature-old'],
            ['remove feature-login', 'git branch -d feature-login'],
        ])('"%s" → %s', (input, expected) => {
            const result = matchFirst(input);
            expect(result).not.toBeNull();
            expect(result!.command).toBe(expected);
        });
    });

    // === Status ===
    describe('Status patterns', () => {
        test.each([
            ['status', 'git status'],
            ['what changed', 'git status'],
            ["what's changed", 'git status'],
            ['show changes', 'git status'],
            ['diff', 'git status'],
        ])('"%s" → %s', (input, expected) => {
            const result = matchFirst(input);
            expect(result).not.toBeNull();
            expect(result!.command).toBe(expected);
        });
    });

    // === Log ===
    describe('Log patterns', () => {
        test.each([
            ['log', 'git log --oneline -20'],
            ['history', 'git log --oneline -20'],
            ['show commits', 'git log --oneline -20'],
        ])('"%s" → %s', (input, expected) => {
            const result = matchFirst(input);
            expect(result).not.toBeNull();
            expect(result!.command).toBe(expected);
        });
    });

    // === Sync ===
    describe('Sync patterns', () => {
        test('sync', () => {
            const result = matchFirst('sync');
            expect(result).not.toBeNull();
            expect(result!.command).toBe('git pull && git push');
        });
    });

    // === Discard changes ===
    describe('Discard changes patterns', () => {
        test.each([
            ['discard all changes', 'git checkout -- .'],
            ['throw away changes', 'git checkout -- .'],
            ['reset all modifications', 'git checkout -- .'],
        ])('"%s" → %s', (input, expected) => {
            const result = matchFirst(input);
            expect(result).not.toBeNull();
            expect(result!.command).toBe(expected);
        });
    });

    // === Apply stash ===
    describe('Apply stash patterns', () => {
        test.each([
            ['apply stash', 'git stash pop'],
            ['restore stash', 'git stash pop'],
            ['pop stash', 'git stash pop'],
        ])('"%s" → %s', (input, expected) => {
            const result = matchFirst(input);
            expect(result).not.toBeNull();
            expect(result!.command).toBe(expected);
        });
    });

    // === ADVANCED COMMANDS ===

    // === Cherry-pick ===
    describe('Cherry-pick patterns', () => {
        test.each([
            ['cherry-pick abc1234', 'git cherry-pick abc1234'],
            ['cherry pick abc1234def5', 'git cherry-pick abc1234def5'],
        ])('"%s" → %s', (input, expected) => {
            const result = matchFirst(input);
            expect(result).not.toBeNull();
            expect(result!.command).toBe(expected);
        });
    });

    // === Blame ===
    describe('Blame patterns', () => {
        test.each([
            ['blame src/main.ts', 'git blame src/main.ts'],
            ['who changed app.css', 'git blame app.css'],
            ['who wrote index.html', 'git blame index.html'],
        ])('"%s" → %s', (input, expected) => {
            const result = matchFirst(input);
            expect(result).not.toBeNull();
            expect(result!.command).toBe(expected);
        });
    });

    // === Tag ===
    describe('Tag patterns', () => {
        test.each([
            ['tag v1.0.0', 'git tag v1.0.0'],
            ['create tag release-2.0', 'git tag release-2.0'],
            ['delete tag v0.9', 'git tag -d v0.9'],
            ['remove tag old-release', 'git tag -d old-release'],
        ])('"%s" → %s', (input, expected) => {
            const result = matchFirst(input);
            expect(result).not.toBeNull();
            expect(result!.command).toBe(expected);
        });
    });

    // === Stage ===
    describe('Stage patterns', () => {
        test.each([
            ['stage all', 'git add -A'],
            ['add everything', 'git add -A'],
            ['stage src/main.ts', 'git add src/main.ts'],
            ['unstage all', 'git reset HEAD'],
            ['unstage src/main.ts', 'git reset HEAD src/main.ts'],
        ])('"%s" → %s', (input, expected) => {
            const result = matchFirst(input);
            expect(result).not.toBeNull();
            expect(result!.command).toBe(expected);
        });
    });

    // === Commit ===
    describe('Commit patterns', () => {
        test.each([
            ['commit message "fix bug"', 'git commit -m "fix bug"'],
            ['commit with message add feature', 'git commit -m "add feature"'],
            ['amend commit', 'git commit --amend --no-edit'],
        ])('"%s" → %s', (input, expected) => {
            const result = matchFirst(input);
            expect(result).not.toBeNull();
            expect(result!.command).toBe(expected);
        });
    });

    // === Bisect ===
    describe('Bisect patterns', () => {
        test.each([
            ['bisect start', 'git bisect start'],
            ['bisect good', 'git bisect good'],
            ['bisect bad', 'git bisect bad'],
            ['bisect reset', 'git bisect reset'],
        ])('"%s" → %s', (input, expected) => {
            const result = matchFirst(input);
            expect(result).not.toBeNull();
            expect(result!.command).toBe(expected);
        });
    });

    // === Worktree ===
    describe('Worktree patterns', () => {
        test('list worktrees', () => {
            const result = matchFirst('list worktrees');
            expect(result).not.toBeNull();
            expect(result!.command).toBe('git worktree list');
        });
    });

    // === Abort/Continue ===
    describe('Abort/Continue patterns', () => {
        test.each([
            ['abort merge', 'git merge --abort'],
            ['continue rebase', 'git rebase --continue'],
        ])('"%s" → %s', (input, expected) => {
            const result = matchFirst(input);
            expect(result).not.toBeNull();
            expect(result!.command).toBe(expected);
        });
    });

    // === Squash ===
    describe('Squash patterns', () => {
        test('squash last 3 commits', () => {
            const result = matchFirst('squash last 3 commits');
            expect(result).not.toBeNull();
            expect(result!.command).toBe('git reset --soft HEAD~3 && git commit');
        });
    });

    // === Remote URL ===
    describe('Remote URL patterns', () => {
        test('show remote url', () => {
            const result = matchFirst('show remote url');
            expect(result).not.toBeNull();
            expect(result!.command).toBe('git remote -v');
        });
    });

    // === Hard reset ===
    describe('Hard reset patterns', () => {
        test('hard reset', () => {
            const result = matchFirst('hard reset');
            expect(result).not.toBeNull();
            expect(result!.command).toBe('git reset --hard HEAD');
        });
    });

    // === Clean ===
    describe('Clean patterns', () => {
        test('clean', () => {
            const result = matchFirst('clean');
            expect(result).not.toBeNull();
            expect(result!.command).toBe('git clean -fd');
        });
    });

    // === Show stash ===
    describe('Show stash patterns', () => {
        test.each([
            ['show stash', 'git stash show -p stash@{0}'],
            ['show stash 2', 'git stash show -p stash@{2}'],
        ])('"%s" → %s', (input, expected) => {
            const result = matchFirst(input);
            expect(result).not.toBeNull();
            expect(result!.command).toBe(expected);
        });
    });

    // === No match ===
    describe('Non-matching inputs', () => {
        test.each([
            ['hello world'],
            ['what is git'],
            ['deploy to production'],
            ['run tests'],
            ['npm install'],
        ])('"%s" should not match any pattern', (input) => {
            const result = matchFirst(input);
            expect(result).toBeNull();
        });
    });

    // === Explanation ===
    describe('Explanations', () => {
        test('switch explanation includes branch name', () => {
            const result = matchFirst('switch to main');
            expect(result!.explanation).toContain('main');
        });

        test('merge explanation includes target branch', () => {
            const result = matchFirst('merge feature-login into current');
            expect(result!.explanation).toContain('feature-login');
        });
    });
});
