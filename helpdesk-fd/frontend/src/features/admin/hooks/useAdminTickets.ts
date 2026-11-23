import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { queryKeys } from '../../../constants/queryKeys';
import {
  adminTicketService,
  type AdminTicketQueryParams,
  type AssignTicketPayload,
  type AddCommentPayload,
} from '../services/adminTicket.service';

/**
 * Hook to fetch paginated admin tickets with search & multi-facet filters.
 * 
 * Performance features:
 * - placeholderData: keepPreviousData prevents UI flickering on page/filter change.
 * - staleTime: 1 minute for ticket list.
 */
export function useAdminTickets(params: AdminTicketQueryParams) {
  return useQuery({
    queryKey: queryKeys.admin.tickets.list(params as Record<string, unknown>),
    queryFn: () => adminTicketService.getTickets(params),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Hook to fetch single ticket details and conversation comments for Admin.
 * Stale time: 2 minutes.
 */
export function useAdminTicketDetails(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.admin.tickets.detail(id),
    queryFn: () => adminTicketService.getTicketById(id!),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Mutation hook to assign a ticket to an agent.
 * On success:
 * - Invalidates ticket lists so the assigned agent & status updates immediately.
 * - Invalidates the specific ticket details if viewing detail page.
 * - Invalidates agents queries so agent workload counters (open_tickets, total_tickets) are synchronized.
 */
export function useAssignTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AssignTicketPayload) => adminTicketService.assignTicket(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.tickets.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.tickets.detail(variables.ticketId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.agents.all() });
    },
  });
}

/**
 * Mutation hook to add a comment to a ticket from Admin.
 * On success:
 * - Invalidates the specific ticket details query to reload comments.
 * - Invalidate ticket lists in case status or last updated changed.
 */
export function useAddAdminTicketComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddCommentPayload) => adminTicketService.addComment(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.tickets.detail(variables.ticket_id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.tickets.lists() });
    },
  });
}
