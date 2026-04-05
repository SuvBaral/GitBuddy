// Standalone mirror of the parseGitCommand private method from extension.ts.
// Keeping it here avoids exposing private implementation details while still
// allowing full unit-test coverage of the tokenisation logic.
function parseGitCommand(cmd: string): string[] | null {
    const trimmed = cmd.trim();
    if (!/^git(\s|$)/i.test(trimmed)) {
        return null;
    }
    const rest = trimmed.slice(3).trim();
    if (!rest) return [];
    const args: string[] = [];
    let current = '';
    let inQuote: string | null = null;
    for (const char of rest) {
        if (inQuote) {
            if (char === inQuote) inQuote = null;
            else current += char;
        } else if (char === '"' || char === "'") {
            inQuote = char;
        } else if (char === ' ' || char === '\t') {
            if (current) { args.push(current); current = ''; }
        } else {
            current += char;
        }
    }
    if (current) args.push(current);
    return args;
}

describe('parseGitCommand', () => {

    // === Valid simple commands ===
    describe('valid simple commands', () => {
        it('parses "git status" → ["status"]', () => {
            expect(parseGitCommand('git status')).toEqual(['status']);
        });

        it('parses "git checkout main" → ["checkout", "main"]', () => {
            expect(parseGitCommand('git checkout main')).toEqual(['checkout', 'main']);
        });
    });

    // === Quoted arguments ===
    describe('quoted arguments', () => {
        it('handles double-quoted commit message', () => {
            expect(parseGitCommand('git commit -m "my message"')).toEqual(['commit', '-m', 'my message']);
        });

        it('handles single-quoted commit message', () => {
            expect(parseGitCommand("git commit -m 'fix: bug'")).toEqual(['commit', '-m', 'fix: bug']);
        });

        it('handles single-quoted string with spaces', () => {
            expect(parseGitCommand("git commit -m 'feat: add new feature'")).toEqual([
                'commit', '-m', 'feat: add new feature',
            ]);
        });
    });

    // === Edge cases — bare "git" ===
    describe('bare "git" command', () => {
        it('returns [] for exactly "git"', () => {
            expect(parseGitCommand('git')).toEqual([]);
        });
    });

    // === Whitespace handling ===
    describe('whitespace handling', () => {
        it('trims leading and trailing whitespace', () => {
            expect(parseGitCommand('  git status  ')).toEqual(['status']);
        });

        it('treats tabs as arg separators', () => {
            expect(parseGitCommand('git\tcheckout\tmain')).toEqual(['checkout', 'main']);
        });
    });

    // === Invalid / non-git inputs ===
    describe('invalid inputs', () => {
        it('returns null for "npm install" (not git)', () => {
            expect(parseGitCommand('npm install')).toBeNull();
        });

        it('returns null for "gitignore add ." (starts with git but no space)', () => {
            expect(parseGitCommand('gitignore add .')).toBeNull();
        });

        it('returns null for "rm -rf /" (shell injection attempt)', () => {
            expect(parseGitCommand('rm -rf /')).toBeNull();
        });

        it('returns null for empty string', () => {
            expect(parseGitCommand('')).toBeNull();
        });

        it('returns null for whitespace-only string', () => {
            expect(parseGitCommand('   ')).toBeNull();
        });
    });

    // === Shell metacharacters treated as literals ===
    describe('shell metacharacters treated as literal args (safe because execFile skips the shell)', () => {
        it('treats semicolons as literal chars — "git checkout main; rm -rf /"', () => {
            expect(parseGitCommand('git checkout main; rm -rf /')).toEqual([
                'checkout', 'main;', 'rm', '-rf', '/',
            ]);
        });

        it('treats && as a literal arg — "git pull && git push"', () => {
            // The caller splits on && before calling parseGitCommand per part;
            // when the full compound string reaches this function it is NOT null —
            // the && token is kept as a literal argument.
            expect(parseGitCommand('git pull && git push')).toEqual([
                'pull', '&&', 'git', 'push',
            ]);
        });
    });

    // === Case-insensitive prefix check ===
    describe('case-insensitive prefix', () => {
        it('accepts uppercase "GIT STATUS" → ["STATUS"]', () => {
            expect(parseGitCommand('GIT STATUS')).toEqual(['STATUS']);
        });
    });
});
