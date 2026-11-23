import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../constants/queryKeys';
import {
  fetchCalendarBookings,
  fetchBookingDetails,
} from '../services/calendar.service';

/**
 * Hook to fetch calendar bookings for a given date range.
 * Stale time: 2 minutes.
 */
export function useAgentCalendarBookings(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: queryKeys.agent.calendar.range(startDate, endDate),
    queryFn: () => fetchCalendarBookings(startDate, endDate),
    staleTime: 1000 * 60 * 2, // 2 minutes
    enabled: Boolean(startDate && endDate),
  });
}

/**
 * Hook to fetch specific booking details by ID.
 */
export function useBookingDetails(bookingId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.agent.calendar.detail(bookingId),
    queryFn: () => fetchBookingDetails(bookingId!),
    enabled: Boolean(bookingId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
