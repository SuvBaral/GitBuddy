namespace GitSimple.Core.Models;

public record Branch(
    string Name,
    bool IsLocal,
    bool IsCurrent,
    string? TrackingBranch,
    string? RemoteName
);
