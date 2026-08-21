import React, { useEffect, useRef } from 'react';
import { 
  Box, Typography, Button, CircularProgress, Alert, Paper, 
  Divider, TextField, Avatar, Select, MenuItem, FormControl
} from '@mui/material';
import { ArrowBackIosNew as ArrowBackIcon, Send as SendIcon } from '@mui/icons-material';
import dayjs from 'dayjs';
import type { TicketDetail } from './types';
import { getInitials } from '../../utils/ticketHelpers';
import StatusChip from '../StatusChip';
import PriorityChip from '../PriorityChip';

interface TicketDetailsViewProps {
  ticket: TicketDetail | null;
  role: 'ADMIN' | 'AGENT' | 'CUSTOMER';
  onBack: () => void;
  backButtonText: string;
  onAddComment: () => void;
  newComment: string;
  setNewComment: (comment: string) => void;
  submittingComment: boolean;
  onStatusChange?: (event: any) => void;
  updatingStatus?: boolean;
  loading: boolean;
  error: string | null;
}

const TicketDetailsView: React.FC<TicketDetailsViewProps> = ({
  ticket,
  role,
  onBack,
  backButtonText,
  onAddComment,
  newComment,
  setNewComment,
  submittingComment,
  onStatusChange,
  updatingStatus = false,
  loading,
  error
}) => {
  const commentsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (commentsEndRef.current) {
      commentsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [ticket?.comments]);

  return (
    <Box sx={{ p: 3, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', overflow: 'hidden' }}>
      <Button 
        startIcon={<ArrowBackIcon fontSize="small" />}
        onClick={onBack}
        sx={{ mb: 2, textTransform: 'none', color: 'text.secondary', fontWeight: 600, '&:hover': { backgroundColor: 'transparent', color: '#000' }, flexShrink: 0, alignSelf: 'flex-start' }}
      >
        {backButtonText}
      </Button>

      {error && <Alert severity="error" sx={{ mb: 2, flexShrink: 0 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress />
        </Box>
      ) : ticket ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <Paper sx={{ p: 2, borderRadius: 3, border: '1px solid #eee', boxShadow: 'none', flexShrink: 0, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>{ticket.ticket_number}</Typography>
                  <StatusChip status={ticket.status} sx={{ height: 20, fontSize: '0.7rem' }} />
                  <PriorityChip priority={ticket.priority} variant="textOnly" />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{ticket.subject}</Typography>
              </Box>
              
              {role === 'AGENT' && onStatusChange ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Status:
                  </Typography>
                  <FormControl size="small" disabled={updatingStatus || ticket.status === 'Closed'}>
                    <Select
                      value={ticket.status}
                      onChange={onStatusChange}
                      sx={{ 
                        minWidth: 140, 
                        fontWeight: 600, 
                        borderRadius: 2,
                        '& .MuiSelect-select': { py: 0.5, px: 1.5, fontSize: '0.85rem' }
                      }}
                    >
                      <MenuItem value="Open">Open</MenuItem>
                      <MenuItem value="In Progress">In Progress</MenuItem>
                      <MenuItem value="Resolved">Resolved</MenuItem>
                      <MenuItem value="Closed">Closed</MenuItem>
                    </Select>
                  </FormControl>
                  {updatingStatus && <CircularProgress size={18} />}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {dayjs(ticket.created_at).format('D MMM YYYY')}
                </Typography>
              )}
            </Box>

            <Divider sx={{ my: 1.5 }} />

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, mb: 2 }}>
              {role !== 'CUSTOMER' && (
                <Box sx={{ flex: '1 1 200px' }}>
                  <Typography variant="caption" color="text.secondary" gutterBottom sx={{ display: 'block', fontWeight: 600, mb: 0 }}>
                    CUSTOMER
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {ticket.customer ? `${ticket.customer.first_name} ${ticket.customer.last_name}` : 'Unknown'}
                  </Typography>
                  {ticket.customer?.email && (
                    <Typography variant="caption" color="text.secondary">
                      {ticket.customer.email}
                    </Typography>
                  )}
                </Box>
              )}
              <Box sx={{ flex: '1 1 200px' }}>
                <Typography variant="caption" color="text.secondary" gutterBottom sx={{ display: 'block', fontWeight: 600, mb: 0 }}>
                  CATEGORY
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>{ticket.category}</Typography>
              </Box>
              
              {role === 'CUSTOMER' && (
                <Box sx={{ flex: '1 1 200px' }}>
                  <Typography variant="caption" color="text.secondary" gutterBottom sx={{ display: 'block', fontWeight: 600, mb: 0 }}>
                    PRIORITY
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{ticket.priority}</Typography>
                </Box>
              )}

              {role !== 'AGENT' && (
                <Box sx={{ flex: '1 1 200px' }}>
                  <Typography variant="caption" color="text.secondary" gutterBottom sx={{ display: 'block', fontWeight: 600, mb: 0 }}>
                    SUBMITTED TO
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {ticket.assignedAgent ? `${ticket.assignedAgent.first_name} ${ticket.assignedAgent.last_name}` : 'Unassigned'}
                  </Typography>
                </Box>
              )}

              {role === 'AGENT' && (
                <Box sx={{ flex: '1 1 200px' }}>
                  <Typography variant="caption" color="text.secondary" gutterBottom sx={{ display: 'block', fontWeight: 600, mb: 0 }}>
                    CREATED ON
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {dayjs(ticket.created_at).format('D MMM YYYY, h:mm A')}
                  </Typography>
                </Box>
              )}
            </Box>

            <Box sx={{ backgroundColor: '#fafafa', p: 1.5, borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary" gutterBottom sx={{ display: 'block', fontWeight: 600, mb: 0 }}>
                Description
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.4 }}>
                {ticket.description}
              </Typography>
            </Box>
          </Paper>

          {/* Conversation / Comments Section */}
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, flexShrink: 0 }}>Conversation</Typography>
          <Paper sx={{ p: 2, borderRadius: 3, border: '1px solid #eee', boxShadow: 'none', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto', p: 1, mb: 2 }}>
              {(!ticket.comments || ticket.comments.length === 0) ? (
                <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                  No messages yet. Start the conversation!
                </Typography>
              ) : (
                ticket.comments.map((comment) => {
                  let isCurrentUser = false;
                  if (role === 'CUSTOMER') {
                    isCurrentUser = comment.sender.role === 'CUSTOMER';
                  } else if (role === 'AGENT') {
                    isCurrentUser = comment.sender.role === 'AGENT' || comment.sender.role === 'ADMIN';
                  } else if (role === 'ADMIN') {
                    isCurrentUser = comment.sender.role === 'ADMIN';
                  }

                  return (
                    <Box key={comment.id} sx={{ display: 'flex', gap: 2, flexDirection: isCurrentUser ? 'row-reverse' : 'row' }}>
                      <Avatar sx={{ bgcolor: isCurrentUser ? 'primary.main' : 'secondary.main', width: 36, height: 36, fontSize: '0.9rem' }}>
                        {getInitials(comment.sender.first_name, comment.sender.last_name)}
                      </Avatar>
                      <Box sx={{ maxWidth: '75%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 0.5, flexDirection: isCurrentUser ? 'row-reverse' : 'row' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>
                              {comment.sender.first_name} {comment.sender.last_name} {isCurrentUser && '(You)'}
                            </Typography>
                            <Box component="span" sx={{ px: 0.75, py: 0.25, bgcolor: '#000', borderRadius: 1, fontSize: '0.65rem', color: '#fff', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                              {comment.sender.role}
                            </Box>
                          </Box>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                            {dayjs(comment.created_at).format('MMM D, h:mm A')}
                          </Typography>
                        </Box>
                        <Paper sx={{ p: 2, bgcolor: isCurrentUser ? '#e3f2fd' : '#f5f5f5', borderRadius: 2, boxShadow: 'none' }}>
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                            {comment.message}
                          </Typography>
                        </Paper>
                      </Box>
                    </Box>
                  );
                })
              )}
              <div ref={commentsEndRef} />
            </Box>

            <Divider sx={{ mb: 2, flexShrink: 0 }} />

            {/* Add Comment Input */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexShrink: 0 }}>
              <TextField
                fullWidth
                multiline
                minRows={2}
                maxRows={4}
                placeholder={role === 'CUSTOMER' ? "Type a message to the agent..." : "Type a message to the customer..."}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                variant="outlined"
                sx={{ bgcolor: '#fafafa', '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <Button 
                variant="contained" 
                endIcon={submittingComment ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
                onClick={onAddComment}
                disabled={!newComment.trim() || submittingComment}
                sx={{ borderRadius: 2, py: 1.5, px: 3, textTransform: 'none', fontWeight: 600 }}
              >
                Reply
              </Button>
            </Box>

          </Paper>
        </Box>
      ) : (
        <Alert severity="warning">Ticket details not found.</Alert>
      )}
    </Box>
  );
};

export default TicketDetailsView;
