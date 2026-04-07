const path = require('path');
const extOut = path.resolve(__dirname, 'src/extension/out').replace(/\\/g, '/');
const testMocks = path.resolve(__dirname, 'tests/extension.tests/__mocks__/vscode.ts').replace(/\\/g, '/');
const tsjest = path.resolve(__dirname, 'tests/extension.tests/node_modules/ts-jest').replace(/\\/g, '/');
const tsconfig = path.resolve(__dirname, 'tests/extension.tests/tsconfig.json').replace(/\\/g, '/');

module.exports = {
    testEnvironment: 'node',
    rootDir: '.',
    roots: ['<rootDir>/tests/extension.tests', '<rootDir>/src/extension/out'],
    testMatch: ['**/*.test.ts'],
    moduleNameMapper: {
        '^vscode$': testMocks,
        '^(\\.\\./)+(src/extension/src)/(.+)$': `${extOut}/$3.js`
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    transform: {
        '^.+\\.tsx?$': [tsjest, { tsconfig }]
    }
};
