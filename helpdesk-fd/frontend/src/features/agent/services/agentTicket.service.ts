import axiosInstance from '../../../utils/axios';
import type { TicketDetail } from '../../../components/TicketDetails/types';

export interface AgentCustomerSummary {
  id?: string;
  first_name: string;
  last_name: string;
  email?: string;
}

export interface AgentTicketItem {
  id: string;
  ticket_number: string;
  subject: string;
  category: string;
  status: string;
  priority: string;
  created_at: string;
  customer?: AgentCustomerSummary;
}

export interface AgentTicketListResponse {
  tickets: AgentTicketItem[];
  totalPages: number;
  totalTickets?: number;
  currentPage?: number;
}

export interface AgentTicketQueryParams {
  search?: string;
  status?: string;
  priority?: string;
  page?: number;
  size?: number;
}

export interface UpdateTicketStatusPayload {
  ticketId: string;
  status: string;
}

export interface AddCommentPayload {
  ticket_id: string;
  message: string;
}

/**
 * Service for Agent Tickets API interactions.
 */
export const agentTicketService = {
  /**
   * Fetch paginated list of tickets assigned to the authenticated agent.
   */
  async getTickets(params: AgentTicketQueryParams): Promise<AgentTicketListResponse> {
    const response = await axiosInstance.get('/agent/tickets', {
      params: {
        search: params.search || undefined,
        status: params.status && params.status !== 'All' ? params.status : undefined,
        priority: params.priority && params.priority !== 'All' ? params.priority : undefined,
        page: params.page,
        size: params.size,
      },
    });

    const data = response.data.data;
    if (Array.isArray(data)) {
      return {
        tickets: data,
        totalPages: 1,
      };
    }

    return {
      tickets: data.tickets || [],
      totalPages: data.totalPages || 1,
      totalTickets: data.totalTickets,
      currentPage: data.currentPage,
    };
  },

  /**
   * Fetch single ticket details by ID (including customer and comments).
   */
  async getTicketById(id: string): Promise<TicketDetail> {
    const response = await axiosInstance.get(`/agent/tickets/${id}`);
    return response.data.data;
  },

  /**
   * Update the status of an assigned ticket (e.g. Open -> In Progress -> Resolved -> Closed).
   */
  async updateTicketStatus(payload: UpdateTicketStatusPayload): Promise<any> {
    const response = await axiosInstance.patch(`/agent/tickets/${payload.ticketId}/status`, {
      status: payload.status,
    });
    return response.data;
  },

  /**
   * Add a comment to a ticket.
   */
  async addComment(payload: AddCommentPayload): Promise<any> {
    const response = await axiosInstance.post('/comments', payload);
    return response.data.data;
  },
};
