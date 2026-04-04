/**
 * @jest-environment node
 */

import { encryptToken, getAuthenticatedSession } from '../convex/authHelpers';

type MockSession = {
    _id: string;
    officerId: string;
    token: string;
    expiresAt: string;
};

function createContext(session: MockSession | null) {
    return {
        db: {
            query: jest.fn(() => ({
                withIndex: jest.fn(() => ({
                    first: jest.fn().mockResolvedValue(session),
                })),
            })),
        },
    } as any;
}

describe('getAuthenticatedSession', () => {
    const encryptionKey = 'session-test-key';
    const plainToken = 'a'.repeat(64);

    it('looks up the stored session using a plain session token', async () => {
        const ctx = createContext({
            _id: 'session-1',
            officerId: 'officer-1',
            token: plainToken,
            expiresAt: new Date(Date.now() + 60_000).toISOString(),
        });

        const { session, decryptedToken } = await getAuthenticatedSession(ctx, plainToken, encryptionKey);

        expect(decryptedToken).toBe(plainToken);
        expect(session.token).toBe(plainToken);
    });

    it('still accepts legacy obfuscated session tokens', async () => {
        const ctx = createContext({
            _id: 'session-1',
            officerId: 'officer-1',
            token: plainToken,
            expiresAt: new Date(Date.now() + 60_000).toISOString(),
        });

        const encryptedToken = encryptToken(plainToken, encryptionKey);
        const { session, decryptedToken } = await getAuthenticatedSession(ctx, encryptedToken, encryptionKey);

        expect(decryptedToken).toBe(plainToken);
        expect(session.token).toBe(plainToken);
    });

    it('rejects expired sessions', async () => {
        const ctx = createContext({
            _id: 'session-1',
            officerId: 'officer-1',
            token: plainToken,
            expiresAt: new Date(Date.now() - 60_000).toISOString(),
        });

        const encryptedToken = encryptToken(plainToken, encryptionKey);

        await expect(getAuthenticatedSession(ctx, encryptedToken, encryptionKey))
            .rejects.toThrow('Unauthorized: Session expired');
    });
});
