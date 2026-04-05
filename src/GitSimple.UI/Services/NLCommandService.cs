using GitSimple.Core.Models;

namespace GitSimple.UI.Services;

public class NLCommandService
{
    private readonly VsCodeBridgeService _bridge;

    public NLCommandService(VsCodeBridgeService bridge) => _bridge = bridge;

    public async Task<NLTranslation?> TranslateAsync(string naturalLanguage)
    {
        return await _bridge.SendAsync<NLTranslation>("nl-translate", new { text = naturalLanguage });
    }

    public async Task<GitCommandResult?> ExecuteTranslatedAsync(string gitCommand)
    {
        return await _bridge.SendAsync<GitCommandResult>("nl-execute", new { command = gitCommand });
    }

    public async Task<List<AutocompleteSuggestion>?> GetSuggestionsAsync(string partial)
    {
        return await _bridge.SendAsync<List<AutocompleteSuggestion>>("nl-autocomplete", new { text = partial });
    }
}
