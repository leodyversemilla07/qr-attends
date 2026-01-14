module.exports = {
    preset: 'react-native',
    setupFilesAfterEnv: ['@testing-library/react-native/extend-expect'],
    testEnvironment: 'node',
    testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
    transform: {
        '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
    },
    transformIgnorePatterns: [
        'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
    ],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    collectCoverageFrom: [
        'convex/**/*.ts',
        'utils/**/*.ts',
        'utils/**/*.tsx',
        'components/**/*.tsx',
        'hooks/**/*.ts',
        '!**/node_modules/**',
        '!**/_generated/**',
    ],
    coverageReporters: ['text', 'lcov', 'html'],
    coverageDirectory: 'coverage',
    testTimeout: 10000,
};
