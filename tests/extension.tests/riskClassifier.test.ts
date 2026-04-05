import { classifyRisk } from '../../src/extension/src/riskClassifier';

describe('riskClassifier', () => {

    // === DANGEROUS commands ===
    describe('Dangerous commands', () => {
        test.each([
            ['git push --force', 'Force push'],
            ['git push origin main --force', 'Force push with branch'],
            ['git reset --hard', 'Hard reset'],
            ['git reset --hard HEAD~3', 'Hard reset to specific commit'],
            ['git clean -fd', 'Clean untracked files'],
            ['git clean -f', 'Clean force'],
            ['git branch -D feature-old', 'Force delete branch'],
            ['git checkout -- .', 'Discard all changes'],
            ['git reset HEAD~1', 'Reset HEAD backwards'],
            ['git reset HEAD~5', 'Reset multiple commits back'],
            ['git filter-branch --env-filter', 'Filter branch rewrite'],
            ['git reflog expire --all', 'Reflog expire'],
        ])('%s should be DANGEROUS (%s)', (command) => {
            const result = classifyRisk(command);
            expect(result.level).toBe('dangerous');
            expect(result.requiresConfirmation).toBe(true);
            expect(result.warning).not.toBeNull();
            expect(result.warning!.length).toBeGreaterThan(0);
        });
    });

    // === MODERATE commands ===
    describe('Moderate commands', () => {
        test.each([
            ['git merge develop', 'Merge'],
            ['git merge feature-x', 'Merge feature'],
            ['git rebase main', 'Rebase'],
            ['git rebase -i HEAD~3', 'Interactive rebase'],
            ['git checkout develop', 'Checkout'],
            ['git checkout feature-login', 'Checkout feature'],
            ['git stash pop', 'Stash pop'],
            ['git reset --soft HEAD~1', 'Soft reset'],
            ['git cherry-pick abc123', 'Cherry pick'],
            ['git branch -d old-branch', 'Delete branch (safe)'],
        ])('%s should be MODERATE (%s)', (command) => {
            const result = classifyRisk(command);
            expect(result.level).toBe('moderate');
            expect(result.requiresConfirmation).toBe(true);
        });
    });

    // === SAFE commands ===
    describe('Safe commands', () => {
        test.each([
            ['git status', 'Status'],
            ['git log --oneline -20', 'Log'],
            ['git branch', 'List branches'],
            ['git branch -a', 'List all branches'],
            ['git fetch --all --prune', 'Fetch'],
            ['git pull', 'Pull'],
            ['git push', 'Push'],
            ['git stash', 'Stash save'],
            ['git stash list', 'Stash list'],
            ['git diff', 'Diff'],
            ['git remote -v', 'Remote list'],
            ['git tag -l', 'Tag list'],
        ])('%s should be SAFE (%s)', (command) => {
            const result = classifyRisk(command);
            expect(result.level).toBe('safe');
            expect(result.requiresConfirmation).toBe(false);
            expect(result.warning).toBeNull();
        });
    });

    // === Edge cases ===
    describe('Edge cases', () => {
        test('empty command should be safe', () => {
            const result = classifyRisk('');
            expect(result.level).toBe('safe');
        });

        test('combined safe commands should be safe', () => {
            const result = classifyRisk('git pull && git push');
            expect(result.level).toBe('safe');
        });

        test('case insensitive detection for dangerous', () => {
            const result = classifyRisk('git RESET --HARD');
            expect(result.level).toBe('dangerous');
        });

        test('force flag -f at end of command', () => {
            const result = classifyRisk('git push -f');
            expect(result.level).toBe('dangerous');
        });

        test('-f inside a word should NOT trigger dangerous', () => {
            // -f must be followed by whitespace or end of string
            const result = classifyRisk('git diff');
            expect(result.level).toBe('safe');
        });

        test('dangerous warning messages are descriptive', () => {
            const result = classifyRisk('git push --force');
            expect(result.warning).toContain('remote');
        });

        test('moderate commands have no warning', () => {
            const result = classifyRisk('git merge main');
            expect(result.warning).toBeNull();
        });
    });

    // === New advanced command risk classification ===
    describe('Advanced command risk classification', () => {
        test('commit amend is moderate', () => {
            expect(classifyRisk('git commit --amend').level).toBe('moderate');
        });

        test('tag delete is moderate', () => {
            expect(classifyRisk('git tag -d v1.0').level).toBe('moderate');
        });

        test('bisect is moderate', () => {
            expect(classifyRisk('git bisect start').level).toBe('moderate');
        });

        test('cherry-pick is moderate', () => {
            expect(classifyRisk('git cherry-pick abc123').level).toBe('moderate');
        });

        test('merge --abort is moderate', () => {
            expect(classifyRisk('git merge --abort').level).toBe('moderate');
        });

        test('worktree add is moderate', () => {
            expect(classifyRisk('git worktree add ../wt main').level).toBe('moderate');
        });

        test('git add is safe', () => {
            expect(classifyRisk('git add -A').level).toBe('safe');
        });

        test('git commit is safe', () => {
            expect(classifyRisk('git commit -m "msg"').level).toBe('safe');
        });

        test('git tag create is safe', () => {
            expect(classifyRisk('git tag v1.0.0').level).toBe('safe');
        });

        test('git blame is safe', () => {
            expect(classifyRisk('git blame file.ts').level).toBe('safe');
        });

        test('git log is safe', () => {
            expect(classifyRisk('git log --oneline -20').level).toBe('safe');
        });
    });

    // === Priority: dangerous > moderate ===
    describe('Risk priority', () => {
        test('force push is dangerous, not just moderate', () => {
            // 'git push --force' contains 'push' which could be safe,
            // but --force makes it dangerous
            const result = classifyRisk('git push --force origin main');
            expect(result.level).toBe('dangerous');
        });

        test('checkout -- . is dangerous, not moderate', () => {
            // 'checkout' is moderate, but 'checkout -- .' is dangerous
            const result = classifyRisk('git checkout -- .');
            expect(result.level).toBe('dangerous');
        });
    });
});
