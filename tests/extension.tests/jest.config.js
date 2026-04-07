module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/*.test.ts'],
    moduleNameMapper: {
        '^vscode$': '<rootDir>/__mocks__/vscode.ts',
        '^../../src/extension/src/riskClassifier$': '<rootDir>/../../src/extension/src/riskClassifier.ts',
        '^../../src/extension/src/nlTranslator$': '<rootDir>/../../src/extension/src/nlTranslator.ts',
        '^../../src/extension/src/gitPatterns$': '<rootDir>/../../src/extension/src/gitPatterns.ts',
        '^../../src/extension/src/types$': '<rootDir>/../../src/extension/src/types.ts'
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    transform: {
        '^.+\\.tsx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.json' }]
    }
};
