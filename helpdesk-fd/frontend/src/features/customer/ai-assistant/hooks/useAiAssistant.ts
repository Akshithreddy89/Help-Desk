import { useCallback, useMemo, useRef, useState } from 'react';
import type { AssistantFlow, ChatMessage, TicketDraft } from '../types';
import {
  chatFaq,
  classifyIssue,
  confirmTicket,
  getRecentTickets,
  getTicketStatusByName,
} from '../services/aiAssistant.service';

const getCustomerFirstName = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.first_name || 'there';
  } catch {
    return 'there';
  }
};

const createWelcome = (name: string): ChatMessage[] => [
  {
    id: 'welcome',
    role: 'assistant',
    content: `Hi ${name}! I'm your AI support assistant. How can I help you today?`,
  },
  {
    id: 'intents',
    role: 'assistant',
    kind: 'intents',  // Tells the UI to render the 3 intent cards
    content: '',
  },
];

export function useAiAssistant() {
  const firstName = useMemo(getCustomerFirstName, []);
  const [flow, setFlow] = useState<AssistantFlow>('menu');
  const [messages, setMessages] = useState<ChatMessage[]>(() => createWelcome(firstName));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const seqRef = useRef(0);

  const nextId = () => `msg-${++seqRef.current}`;

  const cancelInFlight = () => {
    abortRef.current?.abort();
    abortRef.current = null;
  };

  const startRequest = () => {
    cancelInFlight();
    const controller = new AbortController();
    abortRef.current = controller;
    setIsLoading(true);
    setError(null);
    return controller.signal;
  };

  const push = useCallback((...incoming: ChatMessage[]) => {
    setMessages((prev) => [...prev, ...incoming]);
  }, []);

  const startOver = useCallback(() => {
    cancelInFlight();
    setIsLoading(false);
    setError(null);
    setFlow('menu');
    seqRef.current = 0;
    setMessages(createWelcome(firstName));
  }, [firstName]);


  //When the user clicks one of the three cards in this selectintent is called

  const selectIntent = useCallback(async (intent: AssistantFlow) => {
    if (intent === 'menu') {
      startOver();
      return;
    }

    const labels: Record<Exclude<AssistantFlow, 'menu'>, string> = {
      ticket_status: 'Ticket status',
      faq: 'Common FAQs',
      raise_ticket: 'Raise a ticket',
    };

    setFlow(intent);
    push({ id: nextId(), role: 'user', content: labels[intent] });

    if (intent === 'faq') {
      push(
        {
          id: nextId(),
          role: 'assistant',
          content: 'Ask a common question, or pick a topic to get started.',
        },
        { id: nextId(), role: 'assistant', kind: 'faq_topics', content: '' },
      );
      return;
    }

    if (intent === 'raise_ticket') {
      push({
        id: nextId(),
        role: 'assistant',
        content: 'Briefly describe the issue. I will suggest a category, priority, and description for you to review before creating the ticket.',
      });
      return;
    }

    const signal = startRequest();
    push({
      id: nextId(),
      role: 'assistant',
      content: 'Which ticket should I look up? Type the ticket name, or pick one of your recent tickets.',
    });

    try {
      const tickets = await getRecentTickets(signal);
      if (signal.aborted) return;
      if (tickets.length > 0) {
        push({ id: nextId(), role: 'assistant', kind: 'ticket_picks', content: '', tickets });
      }
    } catch (err) {
      if (signal.aborted) return;
      setError(err instanceof Error ? err.message : 'Failed to load tickets.');
    } finally {
      if (!signal.aborted) setIsLoading(false);
    }
  }, [push, startOver]);

  const lookupTicket = useCallback(async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    setFlow('ticket_status');
    push({ id: nextId(), role: 'user', content: trimmed });
    const signal = startRequest();

    try {
      const results = await getTicketStatusByName(trimmed, signal);
      if (signal.aborted) return;
      if (results.length === 0) {
        push({
          id: nextId(),
          role: 'assistant',
          content: `I couldn't find a ticket matching "${trimmed}". Try another name, or raise a new ticket.`,
        });
        return;
      }
      push({
        id: nextId(),
        role: 'assistant',
        kind: 'ticket_status',
        content: results.length === 1
          ? `Here is the latest status for ${results[0].ticket_number}.`
          : `I found ${results.length} tickets matching "${trimmed}".`,
        ticketResults: results,
      });
    } catch (err) {
      if (signal.aborted) return;
      const message = err instanceof Error ? err.message : 'Failed to look up ticket status.';
      setError(message);
      push({ id: nextId(), role: 'assistant', content: message });
    } finally {
      if (!signal.aborted) setIsLoading(false);
    }
  }, [push]);

  const askFaq = useCallback(async (query: string, topicId?: string) => {
    const trimmed = query.trim();
    if (!trimmed && !topicId) return;

    setFlow('faq');
    push({ id: nextId(), role: 'user', content: trimmed });
    const signal = startRequest();

    try {
      const data = await chatFaq(topicId ? { topicId } : { query: trimmed }, signal);
      if (signal.aborted) return;
      push({
        id: nextId(),
        role: 'assistant',
        kind: 'faq_answer',
        content: data.answer,
      });
    } catch (err) {
      if (signal.aborted) return;
      const message = err instanceof Error ? err.message : 'Failed to answer that question.';
      setError(message);
      push({ id: nextId(), role: 'assistant', content: message });
    } finally {
      if (!signal.aborted) setIsLoading(false);
    }
  }, [push]);

  const submitIssue = useCallback(async (rawDescription: string) => {
    const trimmed = rawDescription.trim();
    if (!trimmed) return;

    setFlow('raise_ticket');
    push({ id: nextId(), role: 'user', content: trimmed });
    const signal = startRequest();

    try {
      const draft = await classifyIssue(trimmed, signal);
      if (signal.aborted) return;
      push({
        id: nextId(),
        role: 'assistant',
        kind: 'ticket_draft',
        content: 'Review and edit this draft, then confirm to create the ticket.',
        draft,
      });
    } catch (err) {
      if (signal.aborted) return;
      const message = err instanceof Error ? err.message : 'Failed to prepare the ticket draft.';
      setError(message);
      push({ id: nextId(), role: 'assistant', content: message });
    } finally {
      if (!signal.aborted) setIsLoading(false);
    }
  }, [push]);

  const submitDraft = useCallback(async (draft: TicketDraft) => {
    const signal = startRequest();
    try {
      const created = await confirmTicket(draft, signal);
      if (signal.aborted) return;
      push({
        id: nextId(),
        role: 'assistant',
        kind: 'ticket_created',
        content: `Ticket ${created.ticket_number} was created and saved.`,
        createdTicket: created,
      });
      setFlow('menu');
    } catch (err) {
      if (signal.aborted) return;
      const message = err instanceof Error ? err.message : 'Failed to create the ticket.';
      setError(message);
      push({ id: nextId(), role: 'assistant', content: message });
    } finally {
      if (!signal.aborted) setIsLoading(false);
    }
  }, [push]);

  const sendComposerMessage = useCallback(async (text: string) => {
    if (flow === 'ticket_status') return lookupTicket(text);
    if (flow === 'faq') return askFaq(text);
    if (flow === 'raise_ticket') return submitIssue(text);
  }, [flow, lookupTicket, askFaq, submitIssue]);

  return {
    firstName,
    flow,
    messages,
    isLoading,
    error,
    composerEnabled: flow !== 'menu' && !isLoading,
    startOver,
    selectIntent,
    lookupTicket,
    askFaq,
    submitIssue,
    submitDraft,
    sendComposerMessage,
  };
}
