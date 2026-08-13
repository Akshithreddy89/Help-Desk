import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography, Button, CircularProgress, Alert, Paper, Chip, Divider, TextField, Avatar } from '@mui/material';
import { ArrowBackIosNew as ArrowBackIcon, Send as SendIcon } from '@mui/icons-material';
import CustomerLayout from '../components/CustomerLayout';
import axiosInstance from '../../../utils/axios';
import { useParams, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

interface TicketComment {
  id: string;
  message: string;
  created_at: string;
  sender: {
    first_name: string;
    last_name: string;
    role: string;
  };
}

interface TicketDetail {
  id: string;
  ticket_number: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  created_at: string;
  customer?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  assignedAgent?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  comments?: TicketComment[];
}

const TicketDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  const fetchTicketDetails = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/tickets/${id}`);
      setTicket(response.data.data);
      setError(null);
    } catch (err: any) {
      console.error("Failed to fetch ticket details", err);
      setError('Failed to load ticket details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchTicketDetails();
    }
  }, [id]);

  useEffect(() => {
    if (commentsEndRef.current) {
      commentsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [ticket?.comments]);

  const handleSendComment = async () => {
    if (!newComment.trim()) return;
    setSubmittingComment(true);
    try {
      await axiosInstance.post('/comments', {
        ticket_id: id,
        message: newComment
      });
      setNewComment('');
      fetchTicketDetails();
    } catch (err: any) {
      console.error("Failed to add comment", err);
      alert('Failed to add comment.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'primary';
      case 'In Progress': return 'warning';
      case 'Resolved': return 'success';
      case 'Closed': return 'default';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'error.main';
      case 'Medium': return 'warning.main';
      case 'Low': return 'success.main';
      default: return 'text.secondary';
    }
  };

  const getInitials = (first: string, last: string) => {
    return `${first?.[0] || ''}${last?.[0] || ''}`.toUpperCase();
  };

  return (
    <CustomerLayout>
      <Box sx={{ p: 3, maxWidth: 1000, mx: 'auto' }}>
        <Button 
          startIcon={<ArrowBackIcon fontSize="small" />}
          onClick={() => navigate('/customer/tickets')}
          sx={{ mb: 3, textTransform: 'none', color: 'text.secondary', fontWeight: 600, '&:hover': { backgroundColor: 'transparent', color: '#000' } }}
        >
          Back to My Tickets
        </Button>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress />
          </Box>
        ) : ticket ? (
          <Box>
            <Paper sx={{ p: 4, borderRadius: 3, border: '1px solid #eee', boxShadow: 'none' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>{ticket.ticket_number}</Typography>
                    <Chip label={ticket.status} color={getStatusColor(ticket.status) as any} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                    <Typography variant="body2" sx={{ color: getPriorityColor(ticket.priority), fontWeight: 600 }}>{ticket.priority} Priority</Typography>
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>{ticket.subject}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {dayjs(ticket.created_at).format('D MMM YYYY')}
                </Typography>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, mb: 4 }}>
                <Box sx={{ flex: '1 1 200px' }}>
                  <Typography variant="caption" color="text.secondary" gutterBottom sx={{ display: 'block', fontWeight: 600 }}>
                    CATEGORY
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{ticket.category}</Typography>
                </Box>
                <Box sx={{ flex: '1 1 200px' }}>
                  <Typography variant="caption" color="text.secondary" gutterBottom sx={{ display: 'block', fontWeight: 600 }}>
                    PRIORITY
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{ticket.priority}</Typography>
                </Box>
                <Box sx={{ flex: '1 1 200px' }}>
                  <Typography variant="caption" color="text.secondary" gutterBottom sx={{ display: 'block', fontWeight: 600 }}>
                    SUBMITTED TO
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{ticket.assignedAgent ? `${ticket.assignedAgent.first_name} ${ticket.assignedAgent.last_name}` : 'Unassigned'}</Typography>
                </Box>
              </Box>

              <Box sx={{ backgroundColor: '#fafafa', p: 3, borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary" gutterBottom sx={{ display: 'block', fontWeight: 600 }}>
                  Description
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                  {ticket.description}
                </Typography>
              </Box>
            </Paper>

            {/* Conversation / Comments Section */}
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, mt: 4 }}>Conversation</Typography>
            <Paper sx={{ p: 4, borderRadius: 3, border: '1px solid #eee', boxShadow: 'none' }}>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 4, maxHeight: 500, overflowY: 'auto', p: 1 }}>
                {(!ticket.comments || ticket.comments.length === 0) ? (
                  <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                    No messages yet. Start the conversation!
                  </Typography>
                ) : (
                  ticket.comments.map((comment) => {
                    const isCustomer = comment.sender.role === 'CUSTOMER';
                    return (
                      <Box key={comment.id} sx={{ display: 'flex', gap: 2, flexDirection: isCustomer ? 'row-reverse' : 'row' }}>
                        <Avatar sx={{ bgcolor: isCustomer ? 'primary.main' : 'secondary.main', width: 36, height: 36, fontSize: '0.9rem' }}>
                          {getInitials(comment.sender.first_name, comment.sender.last_name)}
                        </Avatar>
                        <Box sx={{ maxWidth: '75%' }}>
                          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 0.5, flexDirection: isCustomer ? 'row-reverse' : 'row' }}>
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>
                              {comment.sender.first_name} {comment.sender.last_name} {isCustomer && '(You)'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                              {dayjs(comment.created_at).format('MMM D, h:mm A')}
                            </Typography>
                          </Box>
                          <Paper sx={{ p: 2, bgcolor: isCustomer ? '#e3f2fd' : '#f5f5f5', borderRadius: 2, boxShadow: 'none' }}>
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

              <Divider sx={{ mb: 3 }} />

              {/* Add Comment Input */}
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  maxRows={4}
                  placeholder="Type a message to the agent..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  variant="outlined"
                  sx={{ bgcolor: '#fafafa', '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
                <Button 
                  variant="contained" 
                  endIcon={submittingComment ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
                  onClick={handleSendComment}
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
    </CustomerLayout>
  );
};

export default TicketDetails;
