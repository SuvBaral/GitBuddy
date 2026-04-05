namespace GitSimple.Core.Models;

public record NLTranslation(
    string Command,
    string Explanation,
    RiskLevel Risk,
    bool RequiresConfirmation,
    string? Warning,
    AlternativeCommand[]? Alternatives,
    string Tier
);

public record AlternativeCommand(string Command, string Description);
