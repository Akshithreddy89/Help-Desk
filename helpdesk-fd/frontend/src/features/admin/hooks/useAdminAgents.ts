import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { queryKeys } from '../../../constants/queryKeys';
import {
  adminAgentService,
  type AdminAgentQueryParams,
  type CreateAgentPayload,
} from '../services/adminAgent.service';

/**
 * Hook to fetch paginated admin agents with search and workload statistics.
 * 
 * Performance features:
 * - placeholderData: keepPreviousData prevents table flickering during pagination/search.
 * - staleTime: 1 minute for paginated list.
 */
export function useAdminAgents(params: AdminAgentQueryParams) {
  return useQuery({
    queryKey: queryKeys.admin.agents.list(params as Record<string, unknown>),
    queryFn: () => adminAgentService.getAgents(params),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Hook to fetch all agents for select dropdowns (filters, ticket assignment).
 * Stale time: 5 minutes (prevents duplicate network requests across multiple views).
 */
export function useAdminAgentOptions() {
  return useQuery({
    queryKey: queryKeys.admin.agents.options(),
    queryFn: () => adminAgentService.getAllAgents(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Mutation hook to create a new agent and trigger invitation email.
 * On success, automatically invalidates all agent queries (paginated lists and select options).
 */
export function useCreateAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAgentPayload) => adminAgentService.createAgent(payload),
    onSuccess: () => {
      // Invalidate all agent queries (lists & dropdown options)
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.agents.all() });
    },
  });
}
