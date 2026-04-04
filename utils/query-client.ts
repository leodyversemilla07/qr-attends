import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientOptions } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 2,
      retryDelay: 1000,
    },
  },
});

const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'tanstack-query-cache',
  throttleTime: 1000,
});

const PERSISTED_EVENT_SCOPES = new Set(['list', 'detail', 'upcoming', 'recent']);

export function shouldPersistQueryKey(queryKey: readonly unknown[]): boolean {
  const [root, scope] = queryKey;

  if (root !== 'events' || typeof scope !== 'string') {
    return false;
  }

  // Only retain non-sensitive event metadata. Attendees, members, attendance,
  // and officer-related queries must stay in memory only.
  return PERSISTED_EVENT_SCOPES.has(scope);
}

export const persistOptions: PersistQueryClientOptions = {
  queryClient,
  persister: asyncStoragePersister,
  maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  buster: 'v2',
  dehydrateOptions: {
    shouldDehydrateQuery: (query) => {
      return shouldPersistQueryKey(query.queryKey);
    },
  },
};
