using FluentAssertions;
using GitSimple.Core.Models;
using GitSimple.Core.Services;
using Xunit;

namespace GitSimple.UI.Tests.Services;

public class StateServiceTests
{
    private readonly StateService _sut = new();

    [Fact]
    public void InitialState_ShouldHaveDefaults()
    {
        _sut.RepoName.Should().BeEmpty();
        _sut.CurrentBranch.Should().BeEmpty();
        _sut.LocalBranches.Should().BeEmpty();
        _sut.RemoteBranches.Should().BeEmpty();
        _sut.Stashes.Should().BeEmpty();
        _sut.Sync.Should().BeNull();
        _sut.IsLoading.Should().BeFalse();
    }

    [Fact]
    public void NotifyStateChanged_ShouldFireEvent()
    {
        var fired = false;
        _sut.OnStateChanged += () => fired = true;

        _sut.NotifyStateChanged();

        fired.Should().BeTrue();
    }

    [Fact]
    public void NotifyStateChanged_NoSubscribers_ShouldNotThrow()
    {
        var act = () => _sut.NotifyStateChanged();

        act.Should().NotThrow();
    }

    [Fact]
    public void SetProperties_ShouldPersist()
    {
        _sut.RepoName = "MyRepo";
        _sut.CurrentBranch = "develop";
        _sut.IsLoading = true;
        _sut.Sync = new SyncInfo(2, 3);

        _sut.RepoName.Should().Be("MyRepo");
        _sut.CurrentBranch.Should().Be("develop");
        _sut.IsLoading.Should().BeTrue();
        _sut.Sync!.Ahead.Should().Be(2);
        _sut.Sync.Behind.Should().Be(3);
    }

    [Fact]
    public void LocalBranches_CanBeModified()
    {
        _sut.LocalBranches.Add(new Branch("main", true, true, "origin/main", null));
        _sut.LocalBranches.Add(new Branch("develop", true, false, null, null));

        _sut.LocalBranches.Should().HaveCount(2);
    }

    [Fact]
    public void RemoteBranches_CanBeGrouped()
    {
        _sut.RemoteBranches["origin"] = new List<Branch>
        {
            new("origin/main", false, false, null, "origin"),
            new("origin/develop", false, false, null, "origin")
        };
        _sut.RemoteBranches["upstream"] = new List<Branch>
        {
            new("upstream/main", false, false, null, "upstream")
        };

        _sut.RemoteBranches.Should().HaveCount(2);
        _sut.RemoteBranches["origin"].Should().HaveCount(2);
        _sut.RemoteBranches["upstream"].Should().HaveCount(1);
    }

    [Fact]
    public void MultipleSubscribers_AllShouldBeFired()
    {
        var count = 0;
        _sut.OnStateChanged += () => count++;
        _sut.OnStateChanged += () => count++;

        _sut.NotifyStateChanged();

        count.Should().Be(2);
    }
}
