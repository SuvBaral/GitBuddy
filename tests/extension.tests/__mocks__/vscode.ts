// Minimal vscode mock for unit testing
export const workspace = {
    workspaceFolders: [{ uri: { fsPath: '/mock/workspace' } }],
    getConfiguration: () => ({
        get: (key: string, defaultVal: any) => defaultVal
    }),
    createFileSystemWatcher: () => ({
        onDidChange: () => {},
        onDidCreate: () => {},
        dispose: () => {}
    })
};

export const window = {
    registerWebviewViewProvider: () => ({ dispose: () => {} }),
    showInformationMessage: () => {},
    showErrorMessage: () => {}
};

export const commands = {
    registerCommand: () => ({ dispose: () => {} })
};

export const Uri = {
    joinPath: (...args: any[]) => ({ fsPath: args.join('/') })
};

export const lm = {
    selectChatModels: async (_opts?: any) => [] as any[]
};

export const LanguageModelChatMessage = {
    User: (text: string) => ({ role: 'user', content: text })
};

export const CancellationTokenSource = class {
    token = {};
};
