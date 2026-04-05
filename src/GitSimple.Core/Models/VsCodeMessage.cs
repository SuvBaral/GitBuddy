namespace GitSimple.Core.Models;

public record VsCodeMessage(string RequestId, string Command, object? Payload);
