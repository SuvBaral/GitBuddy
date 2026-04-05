namespace GitSimple.Core.Models;

public record GitCommandResult(bool Success, string Output, string? Error);
