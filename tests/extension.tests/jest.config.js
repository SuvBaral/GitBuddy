module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>'],
    testMatch: ['**/*.test.ts'],
    moduleNameMapper: {
        '^vscode$': '<rootDir>/__mocks__/vscode.ts'
    },
    globals: {
        'ts-jest': {
            tsconfig: '<rootDir>/tsconfig.json'
        }
    }
};
