import React, { memo, useEffect, useRef } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import StatusChip from '../../../../components/StatusChip';
import PriorityChip from '../../../../components/PriorityChip';
import { formatDate } from '../../../../utils/ticketHelpers';
import { FAQ_TOPIC_OPTIONS } from '../constants';
import type { AssistantFlow, ChatMessage, TicketDraft } from '../types';
import IntentOptionList from './IntentOptionList';
import TicketDraftCard from './TicketDraftCard';

interface ChatMessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSelectIntent: (intent: AssistantFlow) => void;
  onLookupTicket: (name: string) => void;
  onAskFaq: (query: string, topicId?: string) => void;
  onConfirmDraft: (draft: TicketDraft) => void;
}

/* ── Animated typing indicator ── */
const TypingDots = () => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px', px: 0.5, py: 0.25 }}>
    {[0, 1, 2].map((i) => (
      <Box
        key={i}
        sx={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          bgcolor: 'primary.main',
          animation: 'typing-bounce 1.2s infinite ease-in-out',
          animationDelay: `${i * 0.2}s`,
          '@keyframes typing-bounce': {
            '0%, 80%, 100%': { transform: 'scale(0.6)', opacity: 0.35 },
            '40%': { transform: 'scale(1)', opacity: 1 },
          },
        }}
      />
    ))}
  </Box>
);

/* ── Markdown-ish FAQ body ── */
const FaqBody: React.FC<{ text: string }> = ({ text }) => (
  <Box>
    {text.split('\n').map((line, index) => (
      <Typography
        key={index}
        variant="body2"
        sx={{ whiteSpace: 'pre-wrap', mb: 0.4, lineHeight: 1.65, color: '#334155', fontSize: '0.83rem' }}
      >
        {line.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
          part.startsWith('**') && part.endsWith('**') ? (
            <Box component="strong" key={i} sx={{ color: '#0f172a', fontWeight: 700 }}>
              {part.slice(2, -2)}
            </Box>
          ) : (
            part
          ),
        )}
      </Typography>
    ))}
  </Box>
);

/* ── Assistant bubble wrapper ── */
const AiBubble: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
    {/* AI avatar */}
    <Box
      sx={{
        width: 28,
        height: 28,
        borderRadius: 2,
        bgcolor: 'primary.main',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.62rem',
        fontWeight: 800,
        color: '#fff',
        flexShrink: 0,
        mt: 0.25,
        boxShadow: '0 2px 6px rgba(25,118,210,0.2)',
      }}
    >
      AI
    </Box>
    <Box
      sx={{
        maxWidth: '88%',
        bgcolor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px 16px 16px 4px',
        px: 1.75,
        py: 1.25,
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
      }}
    >
      {children}
    </Box>
  </Box>
);

/* ── User bubble ── */
const UserBubble: React.FC<{ text: string }> = ({ text }) => (
  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
    <Box
      sx={{
        maxWidth: '82%',
        bgcolor: 'primary.main',
        borderRadius: '16px 16px 4px 16px',
        px: 1.75,
        py: 1.1,
        boxShadow: '0 2px 8px rgba(25,118,210,0.25)',
      }}
    >
      <Typography variant="body2" sx={{ color: '#ffffff', fontSize: '0.84rem', lineHeight: 1.55 }}>
        {text}
      </Typography>
    </Box>
  </Box>
);

const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages,
  isLoading,
  onSelectIntent,
  onLookupTicket,
  onAskFaq,
  onConfirmDraft,
}) => {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <Box
      sx={{
        flex: 1,
        overflowY: 'auto',
        px: 2,
        py: 2.5,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        bgcolor: '#f8fafc',
        /* custom scrollbar */
        '&::-webkit-scrollbar': { width: 5 },
        '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
        '&::-webkit-scrollbar-thumb': { bgcolor: '#cbd5e1', borderRadius: 4 },
      }}
    >
      {messages.map((message) => {
        /* ── Intent options ── */
        if (message.kind === 'intents') {
          return (
            <AiBubble key={message.id}>
              <IntentOptionList onSelect={onSelectIntent} disabled={isLoading} />
            </AiBubble>
          );
        }

        /* ── FAQ topic chips ── */
        if (message.kind === 'faq_topics') {
          return (
            <AiBubble key={message.id}>
              <Typography sx={{ fontSize: '0.78rem', color: '#64748b', mb: 1, fontWeight: 500 }}>
                Or pick a topic:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {FAQ_TOPIC_OPTIONS.map((topic) => (
                  <Box
                    key={topic.id}
                    component="button"
                    disabled={isLoading}
                    onClick={() => onAskFaq(topic.title, topic.id)}
                    sx={{
                      border: '1px solid #cbd5e1',
                      bgcolor: '#ffffff',
                      color: '#334155',
                      borderRadius: 5,
                      px: 1.3,
                      py: 0.55,
                      fontSize: '0.73rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                      transition: 'all 0.15s',
                      '&:hover': {
                        bgcolor: 'rgba(25,118,210,0.06)',
                        borderColor: 'primary.main',
                        color: 'primary.main',
                        transform: 'translateY(-1px)',
                      },
                      '&:disabled': { opacity: 0.4, cursor: 'default' },
                    }}
                  >
                    {topic.title}
                  </Box>
                ))}
              </Box>
            </AiBubble>
          );
        }

        /* ── Ticket picks ── */
        if (message.kind === 'ticket_picks' && message.tickets?.length) {
          return (
            <AiBubble key={message.id}>
              <Typography sx={{ fontSize: '0.78rem', color: '#64748b', mb: 1, fontWeight: 500 }}>
                Your recent tickets:
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                {message.tickets.map((ticket) => (
                  <Box
                    key={ticket.id}
                    component="button"
                    disabled={isLoading}
                    onClick={() => onLookupTicket(ticket.subject)}
                    sx={{
                      textAlign: 'left',
                      border: '1px solid #e2e8f0',
                      bgcolor: '#ffffff',
                      borderRadius: 2,
                      px: 1.5,
                      py: 1,
                      cursor: 'pointer',
                      font: 'inherit',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                      transition: 'all 0.15s',
                      '&:hover': {
                        bgcolor: '#f8fafc',
                        borderColor: '#93c5fd',
                        transform: 'translateX(2px)',
                      },
                      '&:disabled': { opacity: 0.4 },
                    }}
                  >
                    <Typography sx={{ fontWeight: 600, fontSize: '0.82rem', color: '#0f172a' }}>
                      {ticket.subject}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                      {ticket.ticket_number} · {ticket.status}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </AiBubble>
          );
        }

        /* ── User message ── */
        if (message.role === 'user') {
          return <UserBubble key={message.id} text={message.content} />;
        }

        /* ── Assistant text message ── */
        return (
          <AiBubble key={message.id}>
            {message.kind === 'faq_answer' ? (
              <FaqBody text={message.content} />
            ) : (
              <Typography
                variant="body2"
                sx={{ color: '#1e293b', lineHeight: 1.65, fontSize: '0.84rem' }}
              >
                {message.content}
              </Typography>
            )}

            {/* FAQ help buttons */}
            {message.kind === 'faq_answer' && (
              <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
                <Button
                  size="small"
                  disabled={isLoading}
                  onClick={() => onSelectIntent('menu')}
                  sx={{
                    textTransform: 'none',
                    borderRadius: 2,
                    fontSize: '0.73rem',
                    fontWeight: 600,
                    border: '1px solid #a7f3d0',
                    color: '#059669',
                    bgcolor: '#ecfdf5',
                    px: 1.25,
                    '&:hover': { bgcolor: '#d1fae5' },
                  }}
                >
                  ✓ That helped
                </Button>
                <Button
                  size="small"
                  disabled={isLoading}
                  onClick={() => onSelectIntent('raise_ticket')}
                  sx={{
                    textTransform: 'none',
                    borderRadius: 2,
                    fontSize: '0.73rem',
                    fontWeight: 600,
                    bgcolor: 'primary.main',
                    color: '#ffffff',
                    px: 1.25,
                    boxShadow: '0 2px 6px rgba(25,118,210,0.25)',
                    '&:hover': { opacity: 0.9, bgcolor: 'primary.main' },
                  }}
                >
                  Raise a ticket
                </Button>
              </Box>
            )}

            {/* Ticket status cards */}
            {message.kind === 'ticket_status' &&
              message.ticketResults?.map((ticket) => (
                <Box
                  key={ticket.id}
                  sx={{
                    mt: 1.5,
                    p: 1.5,
                    bgcolor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 2,
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: 3.5,
                      bgcolor: 'primary.main',
                    },
                  }}
                >
                  <Typography
                    sx={{ fontWeight: 700, fontSize: '0.84rem', color: '#0f172a', mb: 0.4 }}
                  >
                    {ticket.subject}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 1 }}>
                    {ticket.ticket_number} · {formatDate(ticket.created_at)}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', alignItems: 'center' }}>
                    <StatusChip status={ticket.status} />
                    <PriorityChip priority={ticket.priority} />
                  </Box>
                  <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.75 }}>
                    Agent: {ticket.assignedAgent}
                  </Typography>
                  <Button
                    size="small"
                    endIcon={<OpenInNewRoundedIcon sx={{ fontSize: '13px !important' }} />}
                    onClick={() => navigate(`/customer/tickets/${ticket.id}`)}
                    sx={{
                      mt: 1,
                      px: 0.5,
                      textTransform: 'none',
                      fontSize: '0.73rem',
                      fontWeight: 600,
                      color: 'primary.main',
                      minWidth: 0,
                      '&:hover': { bgcolor: 'rgba(25,118,210,0.06)' },
                    }}
                  >
                    View ticket
                  </Button>
                </Box>
              ))}

            {/* Ticket draft */}
            {message.kind === 'ticket_draft' && message.draft && (
              <TicketDraftCard draft={message.draft} disabled={isLoading} onConfirm={onConfirmDraft} />
            )}

            {/* Ticket created */}
            {message.kind === 'ticket_created' && message.createdTicket && (
              <Box
                sx={{
                  mt: 1.5,
                  p: 1.25,
                  bgcolor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleOutlineRoundedIcon sx={{ color: '#16a34a', fontSize: 19 }} />
                  <Typography sx={{ fontSize: '0.8rem', color: '#166534', fontWeight: 600 }}>
                    {message.createdTicket.ticket_number} created
                  </Typography>
                </Box>
                <Button
                  size="small"
                  onClick={() => navigate(`/customer/tickets/${message.createdTicket!.id}`)}
                  sx={{
                    textTransform: 'none',
                    fontSize: '0.73rem',
                    fontWeight: 600,
                    color: '#15803d',
                    borderRadius: 2,
                    border: '1px solid #bbf7d0',
                    px: 1,
                    '&:hover': { bgcolor: '#dcfce7' },
                  }}
                >
                  View →
                </Button>
              </Box>
            )}
          </AiBubble>
        );
      })}

      {/* ── Typing indicator ── */}
      {isLoading && (
        <AiBubble>
          <TypingDots />
        </AiBubble>
      )}

      <div ref={bottomRef} />
    </Box>
  );
};

export default memo(ChatMessageList);
