import { translateNL, getAutocompleteSuggestions } from '../../src/extension/src/nlTranslator';
import { RepoContext } from '../../src/extension/src/types';

const ctx: RepoContext = {
    currentBranch: 'develop',
    branches: ['main', 'develop', 'feature-login', 'feature-api', 'origin/main', 'origin/develop'],
    hasUncommittedChanges: true,
    statusSummary: 'M src/app.ts\nA src/new-file.ts'
};

describe('translateNL — 3-Tier Translation', () => {

    // === Tier 1: Regex matches ===
    describe('Tier 1: Regex pattern matching', () => {
        test('switch to main → regex tier', async () => {
            const result = await translateNL('switch to main', ctx);
            expect(result.tier).toBe('regex');
            expect(result.command).toBe('git checkout main');
        });

        test('pull latest → regex tier', async () => {
            const result = await translateNL('pull latest', ctx);
            expect(result.tier).toBe('regex');
            expect(result.command).toBe('git pull');
        });

        test('push → regex tier', async () => {
            const result = await translateNL('push', ctx);
            expect(result.tier).toBe('regex');
            expect(result.command).toBe('git push');
        });

        test('stash → regex tier', async () => {
            const result = await translateNL('stash', ctx);
            expect(result.tier).toBe('regex');
            expect(result.command).toBe('git stash');
        });

        test('undo last commit → regex tier', async () => {
            const result = await translateNL('undo last commit', ctx);
            expect(result.tier).toBe('regex');
            expect(result.command).toBe('git reset --soft HEAD~1');
        });

        test('create branch feature-new → regex tier', async () => {
            const result = await translateNL('create branch feature-new', ctx);
            expect(result.tier).toBe('regex');
            expect(result.command).toBe('git checkout -b feature-new');
        });

        test('sync → regex tier', async () => {
            const result = await translateNL('sync', ctx);
            expect(result.tier).toBe('regex');
            expect(result.command).toBe('git pull && git push');
        });

        test('stash and switch to main → regex tier combo', async () => {
            const result = await translateNL('stash my changes and switch to main', ctx);
            expect(result.tier).toBe('regex');
            expect(result.command).toBe('git stash && git checkout main');
        });
    });

    // === Tier 2: Fuzzy matching ===
    describe('Tier 2: Fuzzy keyword matching', () => {
        test('go to the main branch → fuzzy (branch found in context)', async () => {
            // This won't match regex because of "the" in the middle
            const result = await translateNL('go to the main branch please', ctx);
            // May match regex or fuzzy depending on pattern, but should translate
            expect(result.command).toContain('checkout');
            expect(result.command).toContain('main');
        });

        test('unrecognized input → falls through to none', async () => {
            const result = await translateNL('deploy to kubernetes', ctx);
            expect(result.tier).toBe('none');
            expect(result.command).toBe('');
            expect(result.explanation).toContain('Could not understand');
        });
    });

    // === Translation has required fields ===
    describe('Translation response structure', () => {
        test('should always have command field', async () => {
            const result = await translateNL('pull', ctx);
            expect(result).toHaveProperty('command');
        });

        test('should always have explanation field', async () => {
            const result = await translateNL('pull', ctx);
            expect(result).toHaveProperty('explanation');
            expect(result.explanation.length).toBeGreaterThan(0);
        });

        test('should always have tier field', async () => {
            const result = await translateNL('pull', ctx);
            expect(result).toHaveProperty('tier');
            expect(['regex', 'fuzzy', 'llm', 'none']).toContain(result.tier);
        });
    });

    // === Case insensitivity ===
    describe('Case insensitivity', () => {
        test('SWITCH TO MAIN → should work', async () => {
            const result = await translateNL('SWITCH TO MAIN', ctx);
            expect(result.command).toBe('git checkout main');
        });

        test('Pull Latest → should work', async () => {
            const result = await translateNL('Pull Latest', ctx);
            expect(result.command).toBe('git pull');
        });
    });

    // === Whitespace handling ===
    describe('Whitespace handling', () => {
        test('leading/trailing spaces → should be trimmed', async () => {
            const result = await translateNL('  switch to main  ', ctx);
            expect(result.command).toBe('git checkout main');
        });
    });
});

describe('getAutocompleteSuggestions', () => {
    test('should return matching suggestions', async () => {
        const results = await getAutocompleteSuggestions('sw', '/mock');
        expect(results.length).toBeGreaterThan(0);
        expect(results[0].text).toBe('switch to ');
    });

    test('should return empty for non-matching input', async () => {
        const results = await getAutocompleteSuggestions('xyz', '/mock');
        expect(results).toHaveLength(0);
    });

    test('should not include exact matches', async () => {
        const results = await getAutocompleteSuggestions('pull latest', '/mock');
        // "pull latest" is an exact match for the suggestion, should be excluded
        const exact = results.find(r => r.text === 'pull latest');
        expect(exact).toBeUndefined();
    });

    test('should return multiple matching suggestions', async () => {
        const results = await getAutocompleteSuggestions('s', '/mock');
        // "switch to ", "stash my changes", "show log" all start with 's'
        expect(results.length).toBeGreaterThanOrEqual(2);
    });

    test('should include type field', async () => {
        const results = await getAutocompleteSuggestions('pull', '/mock');
        for (const r of results) {
            expect(r).toHaveProperty('type');
            expect(r.type).toBe('action');
        }
    });

    test('should include description field', async () => {
        const results = await getAutocompleteSuggestions('push', '/mock');
        for (const r of results) {
            expect(r).toHaveProperty('description');
            expect(r.description.length).toBeGreaterThan(0);
        }
    });
});
