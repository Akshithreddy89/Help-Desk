export interface TicketComment {
  id: string;
  message: string;
  created_at: string;
  sender: {
    first_name: string;
    last_name: string;
    role: string;
  };
}

export interface TicketDetail {
  id: string;
  ticket_number: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  created_at: string;
  customer?: {
    id?: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  assignedAgent?: {
    id?: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  comments?: TicketComment[];
}
