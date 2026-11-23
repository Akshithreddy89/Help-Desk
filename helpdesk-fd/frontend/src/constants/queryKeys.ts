/**
 * Central Query Key Factory for React Query.
 * 
 * Benefits:
 * 1. Single source of truth — eliminates hardcoded string typos across components.
 * 2. Hierarchical structure — allows granular or broad cache invalidation.
 * 3. Reusable across Customer, Admin, and Agent domains.
 * 
 * Example usage:
 * - Invalidate all tickets: queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all })
 * - Invalidate specific ticket detail: queryClient.invalidateQueries({ queryKey: queryKeys.tickets.detail(id) })
 * - Invalidate customer profile: queryClient.invalidateQueries({ queryKey: queryKeys.customer.profile() })
 */
export const queryKeys = {
  // Shared & Customer Tickets
  tickets: {
    all: ['tickets'] as const,
    lists: () => [...queryKeys.tickets.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...queryKeys.tickets.lists(), filters] as const,
    details: () => [...queryKeys.tickets.all, 'detail'] as const,
    detail: (id: string | undefined) => [...queryKeys.tickets.details(), id] as const,
  },

  // Customer Feature Keys
  customer: {
    all: ['customer'] as const,
    profile: () => [...queryKeys.customer.all, 'profile'] as const,
  },

  // Agent Feature Keys
  agent: {
    all: ['agent'] as const,
    tickets: {
      all: () => [...queryKeys.agent.all, 'tickets'] as const,
      lists: () => [...queryKeys.agent.tickets.all(), 'list'] as const,
      list: (filters?: Record<string, unknown>) => [...queryKeys.agent.tickets.lists(), filters] as const,
      details: () => [...queryKeys.agent.tickets.all(), 'detail'] as const,
      detail: (id: string | undefined) => [...queryKeys.agent.tickets.details(), id] as const,
    },
    calendar: {
      all: () => [...queryKeys.agent.all, 'calendar'] as const,
      range: (startDate?: string, endDate?: string) => [...queryKeys.agent.calendar.all(), { startDate, endDate }] as const,
      detail: (id: string | undefined) => [...queryKeys.agent.calendar.all(), 'detail', id] as const,
    },
    availabilities: {
      all: () => [...queryKeys.agent.all, 'availabilities'] as const,
      list: (startDate?: string, endDate?: string) => [...queryKeys.agent.availabilities.all(), { startDate, endDate }] as const,
    },
    slots: {
      all: () => [...queryKeys.agent.all, 'slots'] as const,
      byDate: (date?: string) => [...queryKeys.agent.slots.all(), { date }] as const,
    },
    meetingLink: () => [...queryKeys.agent.all, 'meeting-link'] as const,
  },

  // Admin Feature Keys
  admin: {
    all: ['admin'] as const,
    agents: {
      all: () => [...queryKeys.admin.all, 'agents'] as const,
      lists: () => [...queryKeys.admin.agents.all(), 'list'] as const,
      list: (filters?: Record<string, unknown>) => [...queryKeys.admin.agents.lists(), filters] as const,
      options: () => [...queryKeys.admin.agents.all(), 'options'] as const,
    },
    tickets: {
      all: () => [...queryKeys.admin.all, 'tickets'] as const,
      lists: () => [...queryKeys.admin.tickets.all(), 'list'] as const,
      list: (filters?: Record<string, unknown>) => [...queryKeys.admin.tickets.lists(), filters] as const,
      details: () => [...queryKeys.admin.tickets.all(), 'detail'] as const,
      detail: (id: string | undefined) => [...queryKeys.admin.tickets.details(), id] as const,
    },
  },
} as const;
