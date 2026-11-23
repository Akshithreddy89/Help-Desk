import axiosInstance from '../../../utils/axios';

export interface AdminAgentItem {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  created_at: string;
  account_status: string;
  total_tickets?: number;
  open_tickets?: number;
  resolved_closed_tickets?: number;
}

export interface AdminAgentListResponse {
  agents: AdminAgentItem[];
  totalPages: number;
  totalAgents?: number;
  currentPage?: number;
}

export interface AdminAgentQueryParams {
  search?: string;
  page?: number;
  size?: number;
}

export interface CreateAgentPayload {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
}

/**
 * Service for Admin Agents API interactions.
 */
export const adminAgentService = {
  /**
   * Fetch paginated list of agents with workload metrics and search.
   */
  async getAgents(params: AdminAgentQueryParams): Promise<AdminAgentListResponse> {
    const response = await axiosInstance.get('/admin/agents', {
      params: {
        search: params.search || undefined,
        page: params.page,
        size: params.size,
      },
    });

    const data = response.data.data;
    if (Array.isArray(data)) {
      return {
        agents: data,
        totalPages: 1,
      };
    }

    return {
      agents: data.agents || [],
      totalPages: data.totalPages || 1,
      totalAgents: data.totalAgents,
      currentPage: data.currentPage,
    };
  },

  /**
   * Fetch all agents for selection dropdowns (e.g. ticket filters, assign dialog).
   */
  async getAllAgents(): Promise<AdminAgentItem[]> {
    const response = await axiosInstance.get('/admin/agents', {
      params: { size: 1000 },
    });

    const data = response.data.data;
    if (Array.isArray(data)) {
      return data;
    }
    return data?.agents || [];
  },

  /**
   * Create a new agent and trigger invitation email.
   */
  async createAgent(payload: CreateAgentPayload): Promise<any> {
    const response = await axiosInstance.post('/admin/agents', payload);
    return response.data;
  },
};
