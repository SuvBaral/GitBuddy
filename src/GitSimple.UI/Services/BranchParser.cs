using GitSimple.Core.Models;

namespace GitSimple.UI.Services;

// Delimiter used in git --format strings: ASCII Unit Separator (\x1F, char 31).
// This character cannot appear in git refs or branch names (git enforces this).
// Coordinated with extension.ts format strings for get-branches and stash-list.

/// <summary>
/// Parses raw git CLI output into strongly typed models.
/// Extracted from BranchPanel for testability.
/// </summary>
public static class BranchParser
{
    public static (List<Branch> Local, Dictionary<string, List<Branch>> Remotes) ParseBranches(string output)
    {
        var local = new List<Branch>();
        var remotes = new Dictionary<string, List<Branch>>();

        foreach (var line in output.Split('\n', StringSplitOptions.RemoveEmptyEntries))
        {
            var parts = line.Trim().Split('\x1f');
            if (parts.Length < 4) continue;

            var name = parts[0].Trim();
            var tracking = string.IsNullOrEmpty(parts[2]) ? null : parts[2].Trim();
            var isCurrent = parts[3].Trim() == "*";

            if (name.StartsWith("remotes/")) name = name[8..];

            if (name.Contains('/'))
            {
                var slashIdx = name.IndexOf('/');
                var remoteName = name[..slashIdx];
                var branch = new Branch(name, false, false, null, remoteName);

                if (!remotes.ContainsKey(remoteName))
                    remotes[remoteName] = new List<Branch>();
                remotes[remoteName].Add(branch);
            }
            else
            {
                local.Add(new Branch(name, true, isCurrent, tracking, null));
            }
        }

        return (local, remotes);
    }

    public static List<StashEntry> ParseStashes(string output)
    {
        var stashes = new List<StashEntry>();
        var index = 0;
        foreach (var line in output.Split('\n', StringSplitOptions.RemoveEmptyEntries))
        {
            var parts = line.Split('\x1f');
            // parts[0] is empty (line starts with separator), parts[1]=message, parts[2]=date
            var msg = parts.Length > 1 ? parts[1].Trim() : line.Trim();
            var date = parts.Length > 2 ? parts[2].Trim() : string.Empty;
            stashes.Add(new StashEntry(index++, msg, date));
        }
        return stashes;
    }

    public static SyncInfo? ParseSyncInfo(string output)
    {
        var parts = output.Trim().Split('\t');
        if (parts.Length == 2 && int.TryParse(parts[0], out var ahead) && int.TryParse(parts[1], out var behind))
            return new SyncInfo(ahead, behind);
        return null;
    }
}
