import axiosInstance from '../../../utils/axios';
import type { TicketDetail } from '../../../components/TicketDetails/types';

export interface UserSummary {
  first_name: string;
  last_name: string;
  email: string;
}

export interface AdminTicketItem {
  id: string;
  ticket_number: string;
  subject: string;
  category: string;
  status: string;
  priority: string;
  created_at: string;
  customer?: UserSummary;
  assignedAgent?: UserSummary;
}

export interface AdminTicketListResponse {
  tickets: AdminTicketItem[];
  totalPages: number;
  totalTickets?: number;
  currentPage?: number;
}

export interface AdminTicketQueryParams {
  search?: string;
  status?: string;
  priority?: string;
  agentId?: string;
  page?: number;
  size?: number;
}

export interface AssignTicketPayload {
  ticketId: string;
  agentId: string;
}

export interface AddCommentPayload {
  ticket_id: string;
  message: string;
}

/**
 * Service for Admin Tickets API interactions.
 */
export const adminTicketService = {
  /**
   * Fetch paginated list of tickets for Admin with filtering and search.
   */
  async getTickets(params: AdminTicketQueryParams): Promise<AdminTicketListResponse> {
    const response = await axiosInstance.get('/admin/tickets', {
      params: {
        search: params.search || undefined,
        status: params.status && params.status !== 'All' ? params.status : undefined,
        priority: params.priority && params.priority !== 'All' ? params.priority : undefined,
        agentId: params.agentId && params.agentId !== 'All' ? params.agentId : undefined,
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
   * Fetch single ticket details by ID (including conversation comments).
   */
  async getTicketById(id: string): Promise<TicketDetail> {
    const response = await axiosInstance.get(`/admin/tickets/${id}`);
    return response.data.data;
  },

  /**
   * Assign a ticket to a support agent.
   */
  async assignTicket(payload: AssignTicketPayload): Promise<any> {
    const response = await axiosInstance.patch(`/admin/tickets/${payload.ticketId}/assign`, {
      agent_id: payload.agentId,
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
