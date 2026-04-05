import { GitPattern } from './types';

export const patterns: GitPattern[] = [
    // Switch/Checkout
    { regex: /^(?:switch|go|checkout|change) (?:to )?(?:branch )?(.+)/i,
      command: (m) => `git checkout ${m[1].trim()}`,
      explanation: (m) => `Switch to branch ${m[1].trim()}` },

    // Pull
    { regex: /^(?:pull|get|download|update)(?: latest| changes| new)?(?:.*)$/i,
      command: 'git pull',
      explanation: () => 'Pull latest changes from remote' },

    // Push
    { regex: /^(?:push|upload|send)(?: changes| commits| my work)?(?:.*)$/i,
      command: 'git push',
      explanation: () => 'Push local commits to remote' },

    // Fetch
    { regex: /^(?:fetch|refresh)(?: all| remotes| everything)?$/i,
      command: 'git fetch --all --prune',
      explanation: () => 'Fetch updates from all remotes' },

    // Stash
    { regex: /^(?:stash|save|park)(?: my| all)?(?: changes| work)?$/i,
      command: 'git stash',
      explanation: () => 'Stash uncommitted changes' },

    // Stash + Checkout combo
    { regex: /^stash (?:my )?(?:changes )?(?:and|then) (?:switch|go|checkout) (?:to )?(.+)/i,
      command: (m) => `git stash && git checkout ${m[1].trim()}`,
      explanation: (m) => `Stash changes then switch to ${m[1].trim()}` },

    // Undo last commit
    { regex: /^(?:undo|revert|rollback) (?:the )?(?:last )?commit$/i,
      command: 'git reset --soft HEAD~1',
      explanation: () => 'Undo last commit, keep changes staged' },

    // Merge (with "into" keyword)
    { regex: /^merge (.+?)\s+into(?:\s+(?:current|my|this))?(?:\s+.*)?$/i,
      command: (m) => `git merge ${m[1].trim()}`,
      explanation: (m, ctx) => `Merge ${m[1].trim()} into ${ctx.currentBranch}` },

    // Merge (without "into")
    { regex: /^merge (\S+)$/i,
      command: (m) => `git merge ${m[1].trim()}`,
      explanation: (m, ctx) => `Merge ${m[1].trim()} into ${ctx.currentBranch}` },

    // Rebase
    { regex: /^rebase (?:onto |on )?(.+)/i,
      command: (m) => `git rebase ${m[1].trim()}`,
      explanation: (m) => `Rebase current branch onto ${m[1].trim()}` },

    // Create branch
    { regex: /^(?:create|new|make) (?:a )?branch (?:called |named )?(.+)/i,
      command: (m) => `git checkout -b ${m[1].trim()}`,
      explanation: (m) => `Create and switch to new branch ${m[1].trim()}` },

    // Delete tag (must come before delete branch to avoid matching "delete tag X" as branch)
    { regex: /^(?:delete|remove) tag (.+)/i,
      command: (m) => `git tag -d ${m[1].trim()}`,
      explanation: (m) => `Delete tag ${m[1].trim()}` },

    // Delete branch
    { regex: /^(?:delete|remove) (?:branch )?(.+)/i,
      command: (m) => `git branch -d ${m[1].trim()}`,
      explanation: (m) => `Delete local branch ${m[1].trim()}` },

    // Status
    { regex: /^(?:status|what changed|what's changed|show changes|show diff|diff)$/i,
      command: 'git status',
      explanation: () => 'Show working tree status' },

    // Log
    { regex: /^(?:log|history|show log|show history|show commits)$/i,
      command: 'git log --oneline -20',
      explanation: () => 'Show last 20 commits' },

    // Sync (pull + push)
    { regex: /^(?:sync|synchronize)$/i,
      command: 'git pull && git push',
      explanation: () => 'Pull then push — synchronize with remote' },

    // Discard changes
    { regex: /^(?:discard|throw away|reset) (?:all )?(?:changes|work|modifications)$/i,
      command: 'git checkout -- .',
      explanation: () => 'Discard all uncommitted changes (cannot be undone!)' },

    // Apply stash
    { regex: /^(?:apply|restore|pop) stash$/i,
      command: 'git stash pop',
      explanation: () => 'Apply most recent stash and remove it from stash list' },

    // === ADVANCED COMMANDS ===

    // Cherry-pick
    { regex: /^cherry[- ]?pick (?:commit )?([a-f0-9]{4,40})$/i,
      command: (m) => `git cherry-pick ${m[1].trim()}`,
      explanation: (m) => `Cherry-pick commit ${m[1].trim()} into current branch` },

    // Blame
    { regex: /^(?:blame|who (?:changed|wrote|edited)) (.+)/i,
      command: (m) => `git blame ${m[1].trim()}`,
      explanation: (m) => `Show who last modified each line of ${m[1].trim()}` },

    // Tag
    { regex: /^(?:tag|create tag|new tag) (.+)/i,
      command: (m) => `git tag ${m[1].trim()}`,
      explanation: (m) => `Create lightweight tag ${m[1].trim()}` },

    // Stage all
    { regex: /^(?:stage|add) (?:all|everything)$/i,
      command: 'git add -A',
      explanation: () => 'Stage all changes' },

    // Stage file
    { regex: /^(?:stage|add) (.+)/i,
      command: (m) => `git add ${m[1].trim()}`,
      explanation: (m) => `Stage file ${m[1].trim()}` },

    // Unstage all
    { regex: /^unstage (?:all|everything)$/i,
      command: 'git reset HEAD',
      explanation: () => 'Unstage all changes' },

    // Unstage file
    { regex: /^unstage (.+)/i,
      command: (m) => `git reset HEAD ${m[1].trim()}`,
      explanation: (m) => `Unstage file ${m[1].trim()}` },

    // Commit
    { regex: /^commit (?:with message |message |msg )?"?(.+?)"?$/i,
      command: (m) => `git commit -m "${m[1].trim()}"`,
      explanation: (m) => `Commit staged changes with message "${m[1].trim()}"` },

    // Commit all
    { regex: /^commit all (?:with message |message )?"?(.+?)"?$/i,
      command: (m) => `git add -A && git commit -m "${m[1].trim()}"`,
      explanation: (m) => `Stage all and commit with message "${m[1].trim()}"` },

    // Amend
    { regex: /^amend (?:commit|last commit)?(?:.*)$/i,
      command: 'git commit --amend --no-edit',
      explanation: () => 'Amend the last commit with currently staged changes' },

    // Reset hard
    { regex: /^(?:hard reset|reset hard)(?: to )?(.+)?$/i,
      command: (m) => m[1] ? `git reset --hard ${m[1].trim()}` : 'git reset --hard HEAD',
      explanation: (m) => m[1] ? `Hard reset to ${m[1].trim()} (destroys changes!)` : 'Hard reset to HEAD (destroys changes!)' },

    // Clean
    { regex: /^(?:clean|remove untracked)(?: files)?$/i,
      command: 'git clean -fd',
      explanation: () => 'Remove all untracked files and directories' },

    // Bisect start
    { regex: /^bisect start$/i,
      command: 'git bisect start',
      explanation: () => 'Start binary search for a bug-introducing commit' },

    // Bisect good/bad
    { regex: /^bisect (good|bad)$/i,
      command: (m) => `git bisect ${m[1]}`,
      explanation: (m) => `Mark current commit as ${m[1]} in bisect` },

    // Bisect reset
    { regex: /^bisect (?:reset|stop|end)$/i,
      command: 'git bisect reset',
      explanation: () => 'End bisect session and return to original branch' },

    // Worktree add
    { regex: /^(?:worktree|add worktree) (.+)/i,
      command: (m) => `git worktree add ../worktree-${m[1].trim()} ${m[1].trim()}`,
      explanation: (m) => `Create worktree for branch ${m[1].trim()}` },

    // Worktree list
    { regex: /^(?:list worktrees|worktrees|show worktrees)$/i,
      command: 'git worktree list',
      explanation: () => 'List all worktrees' },

    // Show remote URL
    { regex: /^(?:show|get) (?:remote|origin) (?:url)?$/i,
      command: 'git remote -v',
      explanation: () => 'Show remote repository URLs' },

    // Abort merge/rebase
    { regex: /^abort (?:merge|rebase)$/i,
      command: (m) => `git ${m[0].includes('rebase') ? 'rebase' : 'merge'} --abort`,
      explanation: () => 'Abort the current merge or rebase operation' },

    // Continue merge/rebase
    { regex: /^continue (?:merge|rebase)$/i,
      command: (m) => `git ${m[0].includes('rebase') ? 'rebase' : 'merge'} --continue`,
      explanation: () => 'Continue the current merge or rebase after resolving conflicts' },

    // Squash last N commits
    { regex: /^squash (?:last )?(\d+) commits?$/i,
      command: (m) => `git reset --soft HEAD~${m[1]} && git commit`,
      explanation: (m) => `Squash last ${m[1]} commits into one` },

    // Show stash
    { regex: /^show stash(?:\s+(\d+))?$/i,
      command: (m) => `git stash show -p stash@{${m[1] || '0'}}`,
      explanation: (m) => `Show contents of stash@{${m[1] || '0'}}` },
];
