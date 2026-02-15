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

export const persistOptions: PersistQueryClientOptions = {
  queryClient,
  persister: asyncStoragePersister,
  maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  buster: 'v1',
  dehydrateOptions: {
    shouldDehydrateQuery: (query) => {
      // Don't persist mutations or queries that should not be cached
      const queryKey = query.queryKey[0] as string;
      const persistableQueries = ['events', 'members', 'attendance', 'officers'];
      return persistableQueries.some(q => queryKey?.startsWith(q));
    },
  },
};
