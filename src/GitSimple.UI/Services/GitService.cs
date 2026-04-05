using GitSimple.Core.Models;

namespace GitSimple.UI.Services;

public class GitService
{
    private readonly VsCodeBridgeService _bridge;
    private static readonly TimeSpan NetworkTimeout = TimeSpan.FromMinutes(5);

    public GitService(VsCodeBridgeService bridge) => _bridge = bridge;

    public Task<GitCommandResult?> GetBranches() => _bridge.SendAsync<GitCommandResult>("get-branches");
    public Task<GitCommandResult?> GetStatus() => _bridge.SendAsync<GitCommandResult>("get-status");
    public Task<GitCommandResult?> GetSyncInfo() => _bridge.SendAsync<GitCommandResult>("get-sync-info");
    public Task<GitCommandResult?> Checkout(string branch) => _bridge.SendAsync<GitCommandResult>("checkout", new { branch });
    public Task<GitCommandResult?> Pull() => _bridge.SendAsync<GitCommandResult>("pull", timeout: NetworkTimeout);
    public Task<GitCommandResult?> Push() => _bridge.SendAsync<GitCommandResult>("push", timeout: NetworkTimeout);
    public Task<GitCommandResult?> Fetch() => _bridge.SendAsync<GitCommandResult>("fetch", timeout: NetworkTimeout);
    public Task<GitCommandResult?> Merge(string branch) => _bridge.SendAsync<GitCommandResult>("merge", new { branch });
    public Task<GitCommandResult?> Rebase(string branch) => _bridge.SendAsync<GitCommandResult>("rebase", new { branch });
    public Task<GitCommandResult?> StashSave(string msg) => _bridge.SendAsync<GitCommandResult>("stash-save", new { message = msg });
    public Task<GitCommandResult?> StashApply(int idx) => _bridge.SendAsync<GitCommandResult>("stash-apply", new { index = idx });
    public Task<GitCommandResult?> StashDrop(int idx) => _bridge.SendAsync<GitCommandResult>("stash-drop", new { index = idx });
    public Task<GitCommandResult?> StashList() => _bridge.SendAsync<GitCommandResult>("stash-list");
    public Task<GitCommandResult?> CreateBranch(string name, string from) => _bridge.SendAsync<GitCommandResult>("create-branch", new { name, from });
    public Task<GitCommandResult?> DeleteBranch(string branch) => _bridge.SendAsync<GitCommandResult>("delete-branch", new { branch });
    public Task<GitCommandResult?> RenameBranch(string oldName, string newName) => _bridge.SendAsync<GitCommandResult>("rename-branch", new { oldName, newName });
    public Task<GitCommandResult?> GetRepoName() => _bridge.SendAsync<GitCommandResult>("get-repo-name");
    public Task<GitCommandResult?> GetCurrentBranch() => _bridge.SendAsync<GitCommandResult>("get-current-branch");
    public Task<GitCommandResult?> Sync() => _bridge.SendAsync<GitCommandResult>("sync", timeout: NetworkTimeout);

    // === Merge Conflict Resolution ===
    public Task<GitCommandResult?> GetConflicts() => _bridge.SendAsync<GitCommandResult>("get-conflicts");
    public Task<GitCommandResult?> GetConflictDiff(string file) => _bridge.SendAsync<GitCommandResult>("get-conflict-diff", new { file });
    public Task<GitCommandResult?> ResolveConflict(string file, string resolution, string? content = null) =>
        _bridge.SendAsync<GitCommandResult>("resolve-conflict", new { file, resolution, content });
    public Task<GitCommandResult?> AbortMerge() => _bridge.SendAsync<GitCommandResult>("abort-merge");
    public Task<GitCommandResult?> ContinueMerge() => _bridge.SendAsync<GitCommandResult>("continue-merge");

    // === Commit Composer ===
    public Task<GitCommandResult?> GetStagedChanges() => _bridge.SendAsync<GitCommandResult>("get-staged-changes");
    public Task<GitCommandResult?> GetUnstagedChanges() => _bridge.SendAsync<GitCommandResult>("get-unstaged-changes");
    public Task<GitCommandResult?> Commit(string message) => _bridge.SendAsync<GitCommandResult>("commit", new { message });
    public Task<GitCommandResult?> CommitAmend(string message) => _bridge.SendAsync<GitCommandResult>("commit-amend", new { message });
    public Task<GitCommandResult?> GenerateCommitMessage() => _bridge.SendAsync<GitCommandResult>("generate-commit-message");

    // === Interactive Staging ===
    public Task<GitCommandResult?> StageFile(string file) => _bridge.SendAsync<GitCommandResult>("stage-file", new { file });
    public Task<GitCommandResult?> UnstageFile(string file) => _bridge.SendAsync<GitCommandResult>("unstage-file", new { file });
    public Task<GitCommandResult?> StageAll() => _bridge.SendAsync<GitCommandResult>("stage-all");
    public Task<GitCommandResult?> UnstageAll() => _bridge.SendAsync<GitCommandResult>("unstage-all");
    public Task<GitCommandResult?> StageHunk(string file, string hunkHeader) =>
        _bridge.SendAsync<GitCommandResult>("stage-hunk", new { file, hunkHeader });
    public Task<GitCommandResult?> UnstageHunk(string file, string hunkHeader) =>
        _bridge.SendAsync<GitCommandResult>("unstage-hunk", new { file, hunkHeader });
    public Task<GitCommandResult?> GetFileDiff(string file, bool staged) =>
        _bridge.SendAsync<GitCommandResult>("get-file-diff", new { file, staged });
    public Task<GitCommandResult?> DiscardFileChanges(string file) =>
        _bridge.SendAsync<GitCommandResult>("discard-file-changes", new { file });

    // === Git Graph / History ===
    public Task<GitCommandResult?> GetCommitLog(int count = 50, string? branch = null) =>
        _bridge.SendAsync<GitCommandResult>("get-commit-log", new { count, branch });
    public Task<GitCommandResult?> GetCommitDetail(string hash) =>
        _bridge.SendAsync<GitCommandResult>("get-commit-detail", new { hash });
    public Task<GitCommandResult?> GetGraphData(int count = 50) =>
        _bridge.SendAsync<GitCommandResult>("get-graph-data", new { count });
    public Task<GitCommandResult?> CherryPick(string hash) =>
        _bridge.SendAsync<GitCommandResult>("cherry-pick", new { hash });

    // === Tag Management ===
    public Task<GitCommandResult?> GetTags() => _bridge.SendAsync<GitCommandResult>("get-tags");
    public Task<GitCommandResult?> CreateTag(string name, string? message = null, string? commit = null) =>
        _bridge.SendAsync<GitCommandResult>("create-tag", new { name, message, commit });
    public Task<GitCommandResult?> DeleteTag(string name) => _bridge.SendAsync<GitCommandResult>("delete-tag", new { name });
    public Task<GitCommandResult?> PushTag(string name) => _bridge.SendAsync<GitCommandResult>("push-tag", new { name }, timeout: NetworkTimeout);

    // === Blame ===
    public Task<GitCommandResult?> GetBlame(string file) => _bridge.SendAsync<GitCommandResult>("get-blame", new { file });

    // === Diff Viewer ===
    public Task<GitCommandResult?> ViewFileDiff(string file, bool staged) =>
        _bridge.SendAsync<GitCommandResult>("view-diff", new { file, staged });

    // === File Operations ===
    public Task<GitCommandResult?> OpenFile(string file) =>
        _bridge.SendAsync<GitCommandResult>("open-file", new { file });
}
