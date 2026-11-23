import axiosInstance from '../../../utils/axios';
import type { TicketDetail } from '../../../components/TicketDetails/types';

export interface CustomerTicketItem {
  id: string;
  ticket_number: string;
  subject: string;
  priority: string;
  status: string;
  created_at: string;
}

export interface CustomerTicketListResponse {
  tickets: CustomerTicketItem[];
  totalPages: number;
  totalTickets?: number;
  currentPage?: number;
}

export interface CustomerTicketQueryParams {
  search?: string;
  status?: string;
  page?: number;
  size?: number;
}

export interface CreateTicketPayload {
  subject: string;
  category: string;
  priority: string;
  description: string;
}

export interface AddCommentPayload {
  ticket_id: string;
  message: string;
}

/**
 * Service for Customer Tickets API interactions.
 */
export const customerTicketService = {
  /**
   * Fetch paginated list of tickets for the authenticated customer.
   */
  async getTickets(params: CustomerTicketQueryParams): Promise<CustomerTicketListResponse> {
    const response = await axiosInstance.get('/tickets', {
      params: {
        search: params.search || undefined,
        status: params.status && params.status !== 'All' ? params.status : undefined,
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
   * Fetch single ticket details by ID.
   */
  async getTicketById(id: string): Promise<TicketDetail> {
    const response = await axiosInstance.get(`/tickets/${id}`);
    return response.data.data;
  },

  /**
   * Create / Raise a new ticket.
   */
  async createTicket(payload: CreateTicketPayload): Promise<any> {
    const response = await axiosInstance.post('/tickets', payload);
    return response.data.data;
  },

  /**
   * Add a customer comment to a ticket.
   */
  async addComment(payload: AddCommentPayload): Promise<any> {
    const response = await axiosInstance.post('/comments', payload);
    return response.data.data;
  },
};
