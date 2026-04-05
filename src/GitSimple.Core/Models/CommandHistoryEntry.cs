namespace GitSimple.Core.Models;

public record CommandHistoryEntry(string NLInput, string GitCommand, DateTime Timestamp, bool Success);
