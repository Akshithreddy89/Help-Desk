import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography, Button, CircularProgress, Alert, Paper, Chip, Divider, TextField, Avatar } from '@mui/material';
import { ArrowBackIosNew as ArrowBackIcon, Send as SendIcon } from '@mui/icons-material';
import AdminLayout from '../components/AdminLayout';
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

const AdminTicketDetails: React.FC = () => {
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
      const response = await axiosInstance.get(`/admin/tickets/${id}`);
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
    <AdminLayout>
      <Box sx={{ p: 3, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', overflow: 'hidden' }}>
        <Button 
          startIcon={<ArrowBackIcon fontSize="small" />}
          onClick={() => navigate('/admin/tickets')}
          sx={{ mb: 2, textTransform: 'none', color: 'text.secondary', fontWeight: 600, '&:hover': { backgroundColor: 'transparent', color: '#000' }, flexShrink: 0, alignSelf: 'flex-start' }}
        >
          Back to Admin Tickets
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
                    <Chip label={ticket.status} color={getStatusColor(ticket.status) as any} size="small" variant="outlined" sx={{ fontWeight: 600, height: 20, fontSize: '0.7rem' }} />
                    <Typography variant="body2" sx={{ color: getPriorityColor(ticket.priority), fontWeight: 600, fontSize: '0.8rem' }}>{ticket.priority} Priority</Typography>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>{ticket.subject}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {dayjs(ticket.created_at).format('D MMM YYYY')}
                </Typography>
              </Box>

              <Divider sx={{ my: 1.5 }} />

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, mb: 2 }}>
                <Box sx={{ flex: '1 1 200px' }}>
                  <Typography variant="caption" color="text.secondary" gutterBottom sx={{ display: 'block', fontWeight: 600, mb: 0 }}>
                    CATEGORY
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{ticket.category}</Typography>
                </Box>
                <Box sx={{ flex: '1 1 200px' }}>
                  <Typography variant="caption" color="text.secondary" gutterBottom sx={{ display: 'block', fontWeight: 600, mb: 0 }}>
                    PRIORITY
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{ticket.priority}</Typography>
                </Box>
                <Box sx={{ flex: '1 1 200px' }}>
                  <Typography variant="caption" color="text.secondary" gutterBottom sx={{ display: 'block', fontWeight: 600, mb: 0 }}>
                    SUBMITTED TO
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{ticket.assignedAgent ? `${ticket.assignedAgent.first_name} ${ticket.assignedAgent.last_name}` : 'Unassigned'}</Typography>
                </Box>
                <Box sx={{ flex: '1 1 200px' }}>
                  <Typography variant="caption" color="text.secondary" gutterBottom sx={{ display: 'block', fontWeight: 600, mb: 0 }}>
                    CUSTOMER
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{ticket.customer ? `${ticket.customer.first_name} ${ticket.customer.last_name}` : '-'}</Typography>
                </Box>
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
                    No messages yet.
                  </Typography>
                ) : (
                  ticket.comments.map((comment) => {
                    const isAdmin = comment.sender.role === 'ADMIN';
                    return (
                      <Box key={comment.id} sx={{ display: 'flex', gap: 2, flexDirection: isAdmin ? 'row-reverse' : 'row' }}>
                        <Avatar sx={{ bgcolor: isAdmin ? 'primary.main' : 'secondary.main', width: 36, height: 36, fontSize: '0.9rem' }}>
                          {getInitials(comment.sender.first_name, comment.sender.last_name)}
                        </Avatar>
                        <Box sx={{ maxWidth: '75%' }}>
                          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 0.5, flexDirection: isAdmin ? 'row-reverse' : 'row' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                {comment.sender.first_name} {comment.sender.last_name} {isAdmin && '(You)'}
                              </Typography>
                              <Box component="span" sx={{ px: 0.75, py: 0.25, bgcolor: '#000', borderRadius: 1, fontSize: '0.65rem', color: '#fff', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                {comment.sender.role}
                              </Box>
                            </Box>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                              {dayjs(comment.created_at).format('MMM D, h:mm A')}
                            </Typography>
                          </Box>
                          <Paper sx={{ p: 2, bgcolor: isAdmin ? '#e3f2fd' : '#f5f5f5', borderRadius: 2, boxShadow: 'none' }}>
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
                  placeholder="Type a message to the customer/agent..."
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
    </AdminLayout>
  );
};

export default AdminTicketDetails;
