import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { queryKeys } from '../../../constants/queryKeys';
import {
  customerTicketService,
  type CustomerTicketQueryParams,
  type CreateTicketPayload,
  type AddCommentPayload,
} from '../services/customerTicket.service';

/**
 * Hook to fetch paginated customer tickets with search & status filters.
 * 
 * Performance features:
 * - placeholderData: keepPreviousData prevents screen flickering on page/filter change.
 * - staleTime: 1 minute for ticket list.
 */
export function useCustomerTickets(params: CustomerTicketQueryParams) {
  return useQuery({
    queryKey: queryKeys.tickets.list(params as Record<string, unknown>),
    queryFn: () => customerTicketService.getTickets(params),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Hook to fetch single ticket details and conversation comments.
 */
export function useTicketDetails(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.tickets.detail(id),
    queryFn: () => customerTicketService.getTicketById(id!),
    enabled: Boolean(id),
  });
}

/**
 * Mutation hook to raise/create a new ticket.
 * On success, automatically invalidates ticket lists so the new ticket appears immediately.
 */
export function useCreateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTicketPayload) => customerTicketService.createTicket(payload),
    onSuccess: () => {
      // Invalidate all ticket list queries across pages & filters
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.lists() });
    },
  });
}

/**
 * Mutation hook to add a comment to an existing ticket.
 * On success, invalidates the specific ticket details query to reload comments.
 */
export function useAddTicketComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddCommentPayload) => customerTicketService.addComment(payload),
    onSuccess: (_data, variables) => {
      // Invalidate the specific ticket details
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.detail(variables.ticket_id) });
      // Invalidate ticket lists in case status or last updated changed
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.lists() });
    },
  });
}
