import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useAuth } from '@/utils/auth-context';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useConvex } from 'convex/react';

// Query Keys
export const queryKeys = {
  events: {
    all: ['events'] as const,
    list: () => [...queryKeys.events.all, 'list'] as const,
    detail: (id: Id<'events'>) => [...queryKeys.events.all, 'detail', id] as const,
    upcoming: () => [...queryKeys.events.all, 'upcoming'] as const,
    recent: () => [...queryKeys.events.all, 'recent'] as const,
  },
  members: {
    all: ['members'] as const,
    list: () => [...queryKeys.members.all, 'list'] as const,
    detail: (id: Id<'members'>) => [...queryKeys.members.all, 'detail', id] as const,
    byCard: (cardNo: string) => [...queryKeys.members.all, 'byCard', cardNo] as const,
  },
  attendance: {
    all: ['attendance'] as const,
    byEvent: (eventId: Id<'events'>) => [...queryKeys.attendance.all, 'byEvent', eventId] as const,
    byMember: (memberId: Id<'members'>) => [...queryKeys.attendance.all, 'byMember', memberId] as const,
    stats: () => [...queryKeys.attendance.all, 'stats'] as const,
  },
  officers: {
    me: ['officers', 'me'] as const,
    auditLogs: () => ['officers', 'auditLogs'] as const,
  },
};

// ==================== EVENTS ====================

/**
 * Fetch all events with caching
 */
export function useEvents() {
  const { token } = useAuth();
  const convex = useConvex();
  
  return useQuery({
    queryKey: queryKeys.events.list(),
    queryFn: async () => {
      if (!token) throw new Error('Not authenticated');
      return await convex.query(api.events.list);
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes garbage collection
  });
}

/**
 * Fetch a single event by ID
 */
export function useEvent(eventId: Id<'events'>) {
  const { token } = useAuth();
  const convex = useConvex();
  
  return useQuery({
    queryKey: queryKeys.events.detail(eventId),
    queryFn: async () => {
      if (!token) throw new Error('Not authenticated');
      return await convex.query(api.events.get, { id: eventId });
    },
    enabled: !!token && !!eventId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Fetch upcoming events
 */
export function useUpcomingEvents() {
  const { token } = useAuth();
  const convex = useConvex();
  
  return useQuery({
    queryKey: queryKeys.events.upcoming(),
    queryFn: async () => {
      if (!token) throw new Error('Not authenticated');
      return await convex.query(api.events.getUpcoming);
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Fetch recent events
 */
export function useRecentEvents() {
  const { token } = useAuth();
  const convex = useConvex();
  
  return useQuery({
    queryKey: queryKeys.events.recent(),
    queryFn: async () => {
      if (!token) throw new Error('Not authenticated');
      return await convex.query(api.events.getRecent);
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Create an event with optimistic updates
 */
export function useCreateEvent() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  const convex = useConvex();

  return useMutation({
    mutationFn: async (eventData: {
      name: string;
      date: string;
      time: string;
      location: string;
      description?: string;
    }) => {
      if (!token) throw new Error('Not authenticated');
      return await convex.mutation(api.events.create, {
        ...eventData,
        token,
      });
    },
    onSuccess: () => {
      // Invalidate all event lists
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
    },
  });
}

// ==================== MEMBERS ====================

/**
 * Fetch all members with caching
 */
export function useMembers() {
  const { token } = useAuth();
  const convex = useConvex();
  
  return useQuery({
    queryKey: queryKeys.members.list(),
    queryFn: async () => {
      if (!token) throw new Error('Not authenticated');
      return await convex.query(api.members.list);
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Fetch a single member by ID
 */
export function useMember(memberId: Id<'members'>) {
  const { token } = useAuth();
  const convex = useConvex();
  
  return useQuery({
    queryKey: queryKeys.members.detail(memberId),
    queryFn: async () => {
      if (!token) throw new Error('Not authenticated');
      return await convex.query(api.members.get, { id: memberId });
    },
    enabled: !!token && !!memberId,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Create a member
 */
export function useCreateMember() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  const convex = useConvex();

  return useMutation({
    mutationFn: async (memberData: {
      firstName: string;
      lastName: string;
      middleInitial: string;
      studentId: string;
      yearSection: string;
      cardNo: string;
      email?: string;
    }) => {
      if (!token) throw new Error('Not authenticated');
      return await convex.mutation(api.members.create, {
        ...memberData,
        token,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.members.all });
    },
  });
}

// ==================== ATTENDANCE ====================

/**
 * Fetch attendance by event
 */
export function useAttendanceByEvent(eventId: Id<'events'>) {
  const { token } = useAuth();
  const convex = useConvex();
  
  return useQuery({
    queryKey: queryKeys.attendance.byEvent(eventId),
    queryFn: async () => {
      if (!token) throw new Error('Not authenticated');
      return await convex.query(api.attendance.getByEvent, { eventId });
    },
    enabled: !!token && !!eventId,
    staleTime: 1000 * 30, // 30 seconds (changes frequently)
  });
}

/**
 * Fetch attendance stats
 */
export function useAttendanceStats() {
  const { token } = useAuth();
  const convex = useConvex();
  
  return useQuery({
    queryKey: queryKeys.attendance.stats(),
    queryFn: async () => {
      if (!token) throw new Error('Not authenticated');
      return await convex.query(api.attendance.getStats, { token });
    },
    enabled: !!token,
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 60 * 2, // Auto-refresh every 2 minutes
  });
}

/**
 * Check-in mutation
 */
export function useCheckIn() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  const convex = useConvex();

  return useMutation({
    mutationFn: async ({
      eventId,
      memberId,
    }: {
      eventId: Id<'events'>;
      memberId: Id<'members'>;
    }) => {
      if (!token) throw new Error('Not authenticated');
      return await convex.mutation(api.attendance.checkIn, {
        eventId,
        memberId,
        token,
      });
    },
    onSuccess: (_, variables) => {
      // Invalidate attendance queries for this event
      queryClient.invalidateQueries({
        queryKey: queryKeys.attendance.byEvent(variables.eventId),
      });
      // Also invalidate stats
      queryClient.invalidateQueries({
        queryKey: queryKeys.attendance.stats(),
      });
    },
  });
}

// ==================== OFFICERS ====================

/**
 * Fetch current officer
 */
export function useCurrentOfficer() {
  const { token } = useAuth();
  const convex = useConvex();
  
  return useQuery({
    queryKey: queryKeys.officers.me,
    queryFn: async () => {
      if (!token) return null;
      return await convex.query(api.officers.getMe, { token });
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Fetch audit logs (admin only)
 */
export function useAuditLogs(limit?: number) {
  const { token } = useAuth();
  const convex = useConvex();
  
  return useQuery({
    queryKey: queryKeys.officers.auditLogs(),
    queryFn: async () => {
      if (!token) throw new Error('Not authenticated');
      return await convex.query(api.officers.getAuditLogs, { token, limit });
    },
    enabled: !!token,
    staleTime: 1000 * 60,
  });
}

// ==================== PREFETCHING ====================

/**
 * Hook for prefetching data (useful for navigation)
 */
export function usePrefetchQueries() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  const convex = useConvex();

  const prefetchEvent = async (eventId: Id<'events'>) => {
    if (!token) return;
    await queryClient.prefetchQuery({
      queryKey: queryKeys.events.detail(eventId),
      queryFn: async () => {
        return await convex.query(api.events.get, { id: eventId });
      },
      staleTime: 1000 * 60 * 5,
    });
  };

  const prefetchMember = async (memberId: Id<'members'>) => {
    if (!token) return;
    await queryClient.prefetchQuery({
      queryKey: queryKeys.members.detail(memberId),
      queryFn: async () => {
        return await convex.query(api.members.get, { id: memberId });
      },
      staleTime: 1000 * 60 * 5,
    });
  };

  const prefetchAttendance = async (eventId: Id<'events'>) => {
    if (!token) return;
    await queryClient.prefetchQuery({
      queryKey: queryKeys.attendance.byEvent(eventId),
      queryFn: async () => {
        return await convex.query(api.attendance.getByEvent, { eventId });
      },
      staleTime: 1000 * 30,
    });
  };

  return { prefetchEvent, prefetchMember, prefetchAttendance };
}

// ==================== INVALIDATION HELPERS ====================

/**
 * Hook for manual cache invalidation
 */
export function useInvalidateQueries() {
  const queryClient = useQueryClient();

  const invalidateEvents = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
  };

  const invalidateMembers = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.members.all });
  };

  const invalidateAttendance = (eventId?: Id<'events'>) => {
    if (eventId) {
      queryClient.invalidateQueries({
        queryKey: queryKeys.attendance.byEvent(eventId),
      });
    } else {
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance.all });
    }
  };

  const invalidateAll = () => {
    queryClient.invalidateQueries();
  };

  return {
    invalidateEvents,
    invalidateMembers,
    invalidateAttendance,
    invalidateAll,
  };
}
