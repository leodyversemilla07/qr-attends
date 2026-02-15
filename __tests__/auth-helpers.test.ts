/**
 * @jest-environment node
 * 
 * Unit tests for auth helper functions
 */

import {
    decryptToken,
    encryptToken,
    generateSecureToken,
    validatePasswordStrength,
} from '../convex/auth-helpers';

describe('Password Validation', () => {
    describe('validatePasswordStrength', () => {
        it('should reject passwords shorter than 8 characters', () => {
            const result = validatePasswordStrength('Short1!');
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Password must be at least 8 characters');
        });

        it('should reject passwords without uppercase letters', () => {
            const result = validatePasswordStrength('lowercase1!@#');
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Password must contain at least one uppercase letter');
        });

        it('should reject passwords without lowercase letters', () => {
            const result = validatePasswordStrength('UPPERCASE1!@#');
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Password must contain at least one lowercase letter');
        });

        it('should reject passwords without numbers', () => {
            const result = validatePasswordStrength('NoNumbers!@#');
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Password must contain at least one number');
        });

        it('should reject passwords without special characters', () => {
            const result = validatePasswordStrength('NoSpecial123');
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Password must contain at least one special character (!@#$%^&*)');
        });

        it('should accept valid passwords', () => {
            const result = validatePasswordStrength('ValidPass1!');
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should accept complex passwords', () => {
            const result = validatePasswordStrength('Super$ecur3P@ssw0rd!');
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should return multiple errors for very weak passwords', () => {
            const result = validatePasswordStrength('weak');
            expect(result.valid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(1);
        });
    });
});

describe('Token Generation', () => {
    describe('generateSecureToken', () => {
        it('should generate a 64-character hex string', () => {
            const token = generateSecureToken();
            expect(token).toHaveLength(64);
            expect(/^[0-9a-f]+$/.test(token)).toBe(true);
        });

        it('should generate unique tokens on each call', () => {
            const token1 = generateSecureToken();
            const token2 = generateSecureToken();
            const token3 = generateSecureToken();

            expect(token1).not.toBe(token2);
            expect(token2).not.toBe(token3);
            expect(token1).not.toBe(token3);
        });
    });
});

describe('Token Encryption', () => {
    const testKey = 'test-encryption-key-for-unit-tests';

    describe('encryptToken and decryptToken', () => {
        it('should encrypt and decrypt a token correctly', () => {
            const originalToken = 'my-secret-token-12345';
            const encrypted = encryptToken(originalToken, testKey);
            const decrypted = decryptToken(encrypted, testKey);

            expect(decrypted).toBe(originalToken);
        });

        it('should produce different output for different tokens', () => {
            const token1 = 'token-one';
            const token2 = 'token-two';

            const encrypted1 = encryptToken(token1, testKey);
            const encrypted2 = encryptToken(token2, testKey);

            expect(encrypted1).not.toBe(encrypted2);
        });

        it('should produce different output for different keys', () => {
            const token = 'same-token';
            const key1 = 'key-one-for-testing';
            const key2 = 'key-two-for-testing';

            const encrypted1 = encryptToken(token, key1);
            const encrypted2 = encryptToken(token, key2);

            expect(encrypted1).not.toBe(encrypted2);
        });

        it('should not be able to decrypt with wrong key', () => {
            const token = 'my-secret-token';
            const correctKey = 'correct-key-for-test';
            const wrongKey = 'wrong-key-for-test';

            const encrypted = encryptToken(token, correctKey);
            const decrypted = decryptToken(encrypted, wrongKey);

            expect(decrypted).not.toBe(token);
        });

        it('should handle empty strings', () => {
            const encrypted = encryptToken('', testKey);
            const decrypted = decryptToken(encrypted, testKey);

            expect(decrypted).toBe('');
        });

        it('should handle long tokens', () => {
            const longToken = 'a'.repeat(1000);
            const encrypted = encryptToken(longToken, testKey);
            const decrypted = decryptToken(encrypted, testKey);

            expect(decrypted).toBe(longToken);
        });

        it('should handle special characters in tokens', () => {
            const specialToken = 'token!@#$%^&*()_+-=[]{}|;:,.<>?';
            const encrypted = encryptToken(specialToken, testKey);
            const decrypted = decryptToken(encrypted, testKey);

            expect(decrypted).toBe(specialToken);
        });
    });
});

describe('Email Validation', () => {
    // Email regex from officers.ts
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    it('should accept valid email addresses', () => {
        expect(emailRegex.test('user@example.com')).toBe(true);
        expect(emailRegex.test('test.user@domain.org')).toBe(true);
        expect(emailRegex.test('name+tag@company.co')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
        expect(emailRegex.test('')).toBe(false);
        expect(emailRegex.test('not-an-email')).toBe(false);
        expect(emailRegex.test('@nodomain.com')).toBe(false);
        expect(emailRegex.test('noat.com')).toBe(false);
        expect(emailRegex.test('spaces in@email.com')).toBe(false);
    });
});

describe('Date/Time Format Validation', () => {
    // Formats from events.ts
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const timeRegex = /^\d{2}:\d{2}$/;

    describe('Date format (YYYY-MM-DD)', () => {
        it('should accept valid dates', () => {
            expect(dateRegex.test('2026-01-14')).toBe(true);
            expect(dateRegex.test('2000-12-31')).toBe(true);
        });

        it('should reject invalid date formats', () => {
            expect(dateRegex.test('01-14-2026')).toBe(false);
            expect(dateRegex.test('2026/01/14')).toBe(false);
            expect(dateRegex.test('2026-1-14')).toBe(false);
            expect(dateRegex.test('January 14, 2026')).toBe(false);
        });
    });

    describe('Time format (HH:MM)', () => {
        it('should accept valid times', () => {
            expect(timeRegex.test('09:30')).toBe(true);
            expect(timeRegex.test('23:59')).toBe(true);
            expect(timeRegex.test('00:00')).toBe(true);
        });

        it('should reject invalid time formats', () => {
            expect(timeRegex.test('9:30')).toBe(false);
            expect(timeRegex.test('09:30:00')).toBe(false);
            expect(timeRegex.test('9:30 AM')).toBe(false);
        });
    });
});
