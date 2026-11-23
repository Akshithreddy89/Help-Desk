import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../constants/queryKeys';
import {
  getAvailabilities,
  getSlots,
  getMeetingLink,
  createAvailability,
  createMeetingLink,
  type AgentAvailabilityPayload,
} from '../services/availability.service';

/**
 * Hook to fetch agent availabilities within a date range.
 * Stale time: 2 minutes.
 */
export function useAgentAvailabilities(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: queryKeys.agent.availabilities.list(startDate, endDate),
    queryFn: () => getAvailabilities(startDate, endDate),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook to fetch slots for a particular date.
 */
export function useAgentSlots(date?: string) {
  return useQuery({
    queryKey: queryKeys.agent.slots.byDate(date),
    queryFn: () => getSlots(date),
    enabled: Boolean(date),
  });
}

/**
 * Hook to fetch the agent's public meeting link.
 * Stale time: 10 minutes (permanent link).
 */
export function useAgentMeetingLink() {
  return useQuery({
    queryKey: queryKeys.agent.meetingLink(),
    queryFn: () => getMeetingLink(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Mutation hook to create availability windows and generate slots.
 * On success:
 * - Invalidates availabilities queries
 * - Invalidates slots queries
 * - Invalidates calendar bookings
 */
export function useCreateAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AgentAvailabilityPayload) => createAvailability(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.agent.availabilities.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.agent.slots.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.agent.calendar.all() });
    },
  });
}

/**
 * Mutation hook to create / generate public meeting link.
 * On success, invalidates meeting link query.
 */
export function useCreateMeetingLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => createMeetingLink(),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.agent.meetingLink(), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.agent.meetingLink() });
    },
  });
}
