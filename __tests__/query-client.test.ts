/**
 * @jest-environment node
 */

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

import { persistOptions, shouldPersistQueryKey } from '../utils/query-client';

describe('shouldPersistQueryKey', () => {
  it('persists safe event metadata queries', () => {
    expect(shouldPersistQueryKey(['events', 'list'])).toBe(true);
    expect(shouldPersistQueryKey(['events', 'detail', 'event-1'])).toBe(true);
    expect(shouldPersistQueryKey(['events', 'upcoming'])).toBe(true);
    expect(shouldPersistQueryKey(['events', 'recent'])).toBe(true);
  });

  it('rejects sensitive or unsupported query keys', () => {
    expect(shouldPersistQueryKey(['events', 'attendees', 'event-1'])).toBe(false);
    expect(shouldPersistQueryKey(['members', 'list'])).toBe(false);
    expect(shouldPersistQueryKey(['attendance', 'byEvent', 'event-1'])).toBe(false);
    expect(shouldPersistQueryKey(['officers', 'me'])).toBe(false);
    expect(shouldPersistQueryKey(['search', 'global', 'term'])).toBe(false);
    expect(shouldPersistQueryKey(['events'])).toBe(false);
    expect(shouldPersistQueryKey([])).toBe(false);
  });
});

describe('persistOptions', () => {
  it('uses the same allowlist for dehydration', () => {
    const shouldDehydrateQuery = persistOptions.dehydrateOptions?.shouldDehydrateQuery;

    expect(shouldDehydrateQuery?.({ queryKey: ['events', 'detail', 'event-1'] } as any)).toBe(true);
    expect(shouldDehydrateQuery?.({ queryKey: ['events', 'attendees', 'event-1'] } as any)).toBe(false);
    expect(shouldDehydrateQuery?.({ queryKey: ['officers', 'me'] } as any)).toBe(false);
  });

  it('bumps the persistence buster after the allowlist change', () => {
    expect(persistOptions.buster).toBe('v2');
  });
});
