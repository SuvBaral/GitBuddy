using FluentAssertions;
using GitSimple.Core.Models;
using Xunit;

namespace GitSimple.UI.Tests.Models;

public class BranchTests
{
    [Fact]
    public void Branch_ShouldCreateWithAllProperties()
    {
        var branch = new Branch("main", true, true, "origin/main", null);

        branch.Name.Should().Be("main");
        branch.IsLocal.Should().BeTrue();
        branch.IsCurrent.Should().BeTrue();
        branch.TrackingBranch.Should().Be("origin/main");
        branch.RemoteName.Should().BeNull();
    }

    [Fact]
    public void Branch_RemoteBranch_ShouldHaveRemoteName()
    {
        var branch = new Branch("origin/develop", false, false, null, "origin");

        branch.IsLocal.Should().BeFalse();
        branch.RemoteName.Should().Be("origin");
    }

    [Fact]
    public void Branch_Records_ShouldSupportValueEquality()
    {
        var a = new Branch("main", true, false, null, null);
        var b = new Branch("main", true, false, null, null);

        a.Should().Be(b);
    }

    [Fact]
    public void Branch_DifferentNames_ShouldNotBeEqual()
    {
        var a = new Branch("main", true, false, null, null);
        var b = new Branch("develop", true, false, null, null);

        a.Should().NotBe(b);
    }
}

public class GitCommandResultTests
{
    [Fact]
    public void SuccessResult_ShouldHaveNoError()
    {
        var result = new GitCommandResult(true, "output text", null);

        result.Success.Should().BeTrue();
        result.Output.Should().Be("output text");
        result.Error.Should().BeNull();
    }

    [Fact]
    public void FailureResult_ShouldHaveError()
    {
        var result = new GitCommandResult(false, "", "fatal: not a git repo");

        result.Success.Should().BeFalse();
        result.Error.Should().Be("fatal: not a git repo");
    }
}

public class SyncInfoTests
{
    [Fact]
    public void SyncInfo_ShouldTrackAheadBehind()
    {
        var sync = new SyncInfo(3, 5);

        sync.Ahead.Should().Be(3);
        sync.Behind.Should().Be(5);
    }

    [Fact]
    public void SyncInfo_ZeroValues_ShouldBeValid()
    {
        var sync = new SyncInfo(0, 0);

        sync.Ahead.Should().Be(0);
        sync.Behind.Should().Be(0);
    }
}

public class StashEntryTests
{
    [Fact]
    public void StashEntry_ShouldStoreAllProperties()
    {
        var stash = new StashEntry(0, "WIP on main", "2024-01-15 10:30:00");

        stash.Index.Should().Be(0);
        stash.Message.Should().Be("WIP on main");
        stash.Date.Should().Be("2024-01-15 10:30:00");
    }
}

public class NLTranslationTests
{
    [Fact]
    public void NLTranslation_SafeCommand_ShouldNotRequireConfirmation()
    {
        var translation = new NLTranslation(
            "git status", "Show status", RiskLevel.Safe,
            false, null, null, "regex");

        translation.Risk.Should().Be(RiskLevel.Safe);
        translation.RequiresConfirmation.Should().BeFalse();
        translation.Warning.Should().BeNull();
    }

    [Fact]
    public void NLTranslation_DangerousCommand_ShouldRequireConfirmation()
    {
        var translation = new NLTranslation(
            "git reset --hard HEAD~1", "Hard reset",
            RiskLevel.Dangerous, true,
            "Permanently discards changes", null, "regex");

        translation.Risk.Should().Be(RiskLevel.Dangerous);
        translation.RequiresConfirmation.Should().BeTrue();
        translation.Warning.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public void NLTranslation_WithAlternatives_ShouldContainThem()
    {
        var alts = new[] { new AlternativeCommand("git stash", "Safer option") };
        var translation = new NLTranslation(
            "git reset --hard", "Reset", RiskLevel.Dangerous,
            true, "Warning", alts, "llm");

        translation.Alternatives.Should().HaveCount(1);
        translation.Alternatives![0].Command.Should().Be("git stash");
    }
}

public class RiskLevelTests
{
    [Fact]
    public void RiskLevel_ShouldHaveThreeValues()
    {
        Enum.GetValues<RiskLevel>().Should().HaveCount(3);
    }

    [Theory]
    [InlineData(RiskLevel.Safe, 0)]
    [InlineData(RiskLevel.Moderate, 1)]
    [InlineData(RiskLevel.Dangerous, 2)]
    public void RiskLevel_ShouldHaveCorrectOrdinals(RiskLevel level, int expected)
    {
        ((int)level).Should().Be(expected);
    }
}

public class AutocompleteSuggestionTests
{
    [Fact]
    public void AutocompleteSuggestion_ShouldStoreAllFields()
    {
        var s = new AutocompleteSuggestion("switch to ", "action", "Switch to a branch");

        s.Text.Should().Be("switch to ");
        s.Type.Should().Be("action");
        s.Description.Should().Be("Switch to a branch");
    }
}

public class CommandHistoryEntryTests
{
    [Fact]
    public void CommandHistoryEntry_ShouldRecordTimestamp()
    {
        var now = DateTime.Now;
        var entry = new CommandHistoryEntry("pull latest", "git pull", now, true);

        entry.NLInput.Should().Be("pull latest");
        entry.GitCommand.Should().Be("git pull");
        entry.Timestamp.Should().Be(now);
        entry.Success.Should().BeTrue();
    }
}
