import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { queryKeys } from '../../../constants/queryKeys';
import {
  agentTicketService,
  type AgentTicketQueryParams,
  type UpdateTicketStatusPayload,
  type AddCommentPayload,
} from '../services/agentTicket.service';

/**
 * Hook to fetch paginated agent tickets with search & multi-facet filters.
 * 
 * Performance features:
 * - placeholderData: keepPreviousData prevents UI flickering on page/filter change.
 * - staleTime: 1 minute for ticket list.
 */
export function useAgentTickets(params: AgentTicketQueryParams) {
  return useQuery({
    queryKey: queryKeys.agent.tickets.list(params as Record<string, unknown>),
    queryFn: () => agentTicketService.getTickets(params),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Hook to fetch single ticket details and conversation comments for Agent.
 * Stale time: 2 minutes.
 */
export function useAgentTicketDetails(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.agent.tickets.detail(id),
    queryFn: () => agentTicketService.getTicketById(id!),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Mutation hook to update ticket status (drag-and-drop Kanban or dropdown).
 * On success:
 * - Invalidates agent ticket lists so table & kanban reflect the new status.
 * - Invalidates ticket detail query.
 * - Invalidates admin tickets so admin dashboard stays synchronized.
 */
export function useUpdateTicketStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateTicketStatusPayload) => agentTicketService.updateTicketStatus(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.agent.tickets.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.agent.tickets.detail(variables.ticketId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.tickets.all() });
    },
  });
}

/**
 * Mutation hook to add a comment to a ticket from Agent.
 * On success:
 * - Invalidates the specific ticket details query to reload comments.
 * - Invalidates ticket lists.
 */
export function useAddAgentTicketComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddCommentPayload) => agentTicketService.addComment(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.agent.tickets.detail(variables.ticket_id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.agent.tickets.lists() });
    },
  });
}
