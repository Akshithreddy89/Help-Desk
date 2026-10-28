import type { AssistantFlow, FaqTopicOption } from './types';

export const TICKET_CATEGORIES = ['Technical', 'General', 'Billing', 'Account'] as const;
export const TICKET_PRIORITIES = ['High', 'Medium', 'Low'] as const;

export const INTENT_OPTIONS: { id: AssistantFlow; title: string; subtitle: string }[] = [
  { id: 'ticket_status', title: 'Ticket status', subtitle: 'Track an existing request' },
  { id: 'faq', title: 'Common FAQs', subtitle: 'Get quick troubleshooting help' },
  { id: 'raise_ticket', title: 'Raise a ticket', subtitle: 'Send an issue to our team' },
];

export const FAQ_TOPIC_OPTIONS: FaqTopicOption[] = [
  { id: 'wifi_issues', title: 'Wi-Fi & Connectivity' },
  { id: 'login_issues', title: 'Login & Password' },
  { id: 'appointment_booking', title: 'Appointments & Meetings' },
  { id: 'billing_inquiries', title: 'Billing & Invoices' },
  { id: 'ticket_lifecycle', title: 'Ticket Statuses & SLA' },
];

export const COMPOSER_PLACEHOLDER: Record<AssistantFlow, string> = {
  menu: 'Choose an option above to get started',
  ticket_status: 'Type a ticket name…',
  faq: 'Describe a login, Wi-Fi, or other issue…',
  raise_ticket: 'Briefly describe the issue…',
};
