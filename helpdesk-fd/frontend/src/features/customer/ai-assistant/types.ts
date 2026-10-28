export type AssistantFlow = 'menu' | 'ticket_status' | 'faq' | 'raise_ticket';

export type MessageKind =
  | 'text'
  | 'intents'
  | 'ticket_picks'
  | 'ticket_status'
  | 'faq_topics'
  | 'faq_answer'
  | 'ticket_draft'
  | 'ticket_created';

export interface RecentTicket {
  id: string;
  ticket_number: string;
  subject: string;
  status: string;
  category: string;
  priority: string;
  created_at: string;
}

export interface TicketStatusResult extends RecentTicket {
  assignedAgent: string;
  updated_at: string;
}

export interface TicketDraft {
  subject: string;
  category: string;
  priority: string;
  description: string;
  original_description: string;
}

export interface CreatedTicket {
  id: string;
  ticket_number: string;
  subject: string;
  status: string;
  category: string;
  priority: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  kind?: MessageKind;
  tickets?: RecentTicket[];
  ticketResults?: TicketStatusResult[];
  draft?: TicketDraft;
  createdTicket?: CreatedTicket;
}

export interface FaqTopicOption {
  id: string;
  title: string;
}
