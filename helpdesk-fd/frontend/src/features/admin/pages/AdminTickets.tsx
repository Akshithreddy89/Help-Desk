import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, TextField, InputAdornment, MenuItem, Select,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Avatar, Button, Menu, CircularProgress, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText,
  FormControl, InputLabel
} from '@mui/material';
import {
  Search as SearchIcon,
  PersonAddAlt as AssignIcon,
  FormatListBulleted as ListDashIcon,
  Visibility as ViewIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import AdminLayout from '../components/AdminLayout';
import axiosInstance from '../../../utils/axios';
import { useNavigate } from 'react-router-dom';

interface User {
  first_name: string;
  last_name: string;
  email: string;
}

interface Ticket {
  id: string;
  ticket_number: string;
  subject: string;
  category: string;
  status: string;
  priority: string;
  created_at: string;
  customer?: User;
  assignedAgent?: User;
}

interface Agent {
  id: string;
  first_name: string;
  last_name: string;
}

const AdminTickets: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [agentFilter, setAgentFilter] = useState('All');

  // Assign Menu State
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedAgentToAssign, setSelectedAgentToAssign] = useState('');

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/admin/tickets', {
        params: {
          search: searchTerm,
          status: statusFilter,
          priority: priorityFilter,
          agentId: agentFilter
        }
      });
      if (response.data.success) {
        setTickets(response.data.data);
        setTotal(response.data.total);
      }
    } catch (error) {
      console.error('Failed to fetch tickets', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, priorityFilter, agentFilter]);

  const fetchAgents = async () => {
    try {
      const response = await axiosInstance.get('/admin/agents');
      if (response.data.success) {
        setAgents(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch agents', error);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  useEffect(() => {
    // Debounce search slightly
    const delay = setTimeout(() => {
      fetchTickets();
    }, 300);
    return () => clearTimeout(delay);
  }, [fetchTickets]);

  const handleAssignClick = (event: React.MouseEvent<HTMLButtonElement>, ticketId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedTicketId(ticketId);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleOpenAssignDialog = () => {
    setAssignDialogOpen(true);
    handleCloseMenu();
  };

  const handleCloseAssignDialog = () => {
    setAssignDialogOpen(false);
    setSelectedAgentToAssign('');
  };

  const handleOpenConfirmDialog = () => {
    setConfirmDialogOpen(true);
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDialogOpen(false);
  };

  const handleConfirmAssign = async () => {
    if (!selectedTicketId || !selectedAgentToAssign) return;
    try {
      const response = await axiosInstance.patch(`/admin/tickets/${selectedTicketId}/assign`, {
        agent_id: selectedAgentToAssign
      });
      if (response.data.success) {
        fetchTickets(); // Refresh list after assignment
      }
    } catch (error) {
      console.error('Failed to assign ticket', error);
    } finally {
      handleCloseConfirmDialog();
      handleCloseAssignDialog();
      setSelectedTicketId(null);
      setSelectedAgentToAssign('');
    }
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || '?';
  };

  const stringToColor = (string: string) => {
    let hash = 0;
    for (let i = 0; i < string.length; i += 1) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.slice(-2);
    }
    return color;
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-GB', options);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open': return '#2196F3';
      case 'in progress': return '#FF9800';
      case 'resolved': return '#4CAF50';
      case 'closed': return '#9E9E9E';
      default: return '#757575';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return '#F44336';
      case 'medium': return '#FF9800';
      case 'low': return '#9E9E9E';
      default: return '#757575';
    }
  };

  return (
    <AdminLayout>
      <Box sx={{ p: 3, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', overflow: 'hidden' }}>
        
        {/* Header */}
        <Box sx={{ mb: 4, flexShrink: 0 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1, fontFamily: 'serif' }}>
            All Tickets
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage and assign support tickets across your team.
          </Typography>
        </Box>

        {/* Filters Row */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexShrink: 0 }}>
          {/* Search Bar - Left Side */}
          <TextField
            placeholder="Search tickets, ID, customer..."
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ bgcolor: 'white', borderRadius: 2, minWidth: 320 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                endAdornment: searchTerm ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchTerm('')} edge="end">
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }
            }}
          />

          {/* Dropdowns - Right Side */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              size="small"
              sx={{ bgcolor: 'white', borderRadius: 2, minWidth: 150 }}
            >
              <MenuItem value="All">All Statuses</MenuItem>
              <MenuItem value="Open">Open</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Resolved">Resolved</MenuItem>
              <MenuItem value="Closed">Closed</MenuItem>
            </Select>

            <Select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              size="small"
              sx={{ bgcolor: 'white', borderRadius: 2, minWidth: 150 }}
            >
              <MenuItem value="All">All Priorities</MenuItem>
              <MenuItem value="Low">Low</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="High">High</MenuItem>
            </Select>

            <Select
              value={agentFilter}
              onChange={(e) => setAgentFilter(e.target.value)}
              size="small"
              sx={{ bgcolor: 'white', borderRadius: 2, minWidth: 150 }}
            >
              <MenuItem value="All">All Agents</MenuItem>
              {agents.map(agent => (
                <MenuItem key={agent.id} value={agent.id}>
                  {agent.first_name} {agent.last_name}
                </MenuItem>
              ))}
              <MenuItem value="Unassigned">Unassigned Tickets</MenuItem>
            </Select>
          </Box>
        </Box>

        {/* Tickets Table */}
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', flexGrow: 1, overflow: 'auto', minHeight: 0 }}>
          <Table stickyHeader sx={{ minWidth: 900 }}>
            <TableHead>
              <TableRow sx={{ '& th': { borderBottom: '1px solid #eee', color: 'text.secondary', fontWeight: 'bold', fontSize: '0.75rem', bgcolor: 'white' } }}>
                <TableCell sx={{ position: 'sticky', left: 0, bgcolor: 'white', zIndex: 3 }}>TICKET ID</TableCell>
                <TableCell>TITLE</TableCell>
                <TableCell>CUSTOMER</TableCell>
                <TableCell>STATUS</TableCell>
                <TableCell>PRIORITY</TableCell>
                <TableCell>ASSIGNED AGENT</TableCell>
                <TableCell>DATE</TableCell>
                <TableCell align="right" sx={{ position: 'sticky', right: 0, bgcolor: 'white', zIndex: 3 }}>ACTION</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={24} sx={{ mr: 2 }} />
                  </TableCell>
                </TableRow>
              ) : tickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <Typography variant="body1" color="text.secondary">
                      No tickets found matching your criteria.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                tickets.map((ticket) => (
                  <TableRow key={ticket.id} sx={{ '& td': { borderBottom: '1px solid #eee' }, '&:last-child td': { borderBottom: 0 } }}>
                    <TableCell sx={{ position: 'sticky', left: 0, bgcolor: 'white', zIndex: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                        {ticket.ticket_number}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {ticket.subject}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {ticket.category || 'General'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {ticket.customer ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar 
                            sx={{ 
                              width: 24, height: 24, fontSize: '0.65rem', 
                              bgcolor: '#f5f5f5', color: '#666'
                            }}
                          >
                            {getInitials(ticket.customer.first_name, ticket.customer.last_name)}
                          </Avatar>
                          <Typography variant="body2">
                            {ticket.customer.first_name} {ticket.customer.last_name}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">-</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ 
                        display: 'inline-flex', px: 1.5, py: 0.5, borderRadius: 4,
                        bgcolor: `${getStatusColor(ticket.status)}15`,
                        color: getStatusColor(ticket.status)
                      }}>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          {ticket.status}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: getPriorityColor(ticket.priority) }} />
                        <Typography variant="body2" sx={{ color: getPriorityColor(ticket.priority), fontWeight: 500, fontSize: '0.8125rem' }}>
                          {ticket.priority}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {ticket.assignedAgent ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar 
                            sx={{ 
                              width: 24, height: 24, fontSize: '0.65rem', 
                              bgcolor: stringToColor(`${ticket.assignedAgent.first_name} ${ticket.assignedAgent.last_name}`),
                              color: 'white', fontWeight: 'bold'
                            }}
                          >
                            {getInitials(ticket.assignedAgent.first_name, ticket.assignedAgent.last_name)}
                          </Avatar>
                          <Typography variant="body2">
                            {ticket.assignedAgent.first_name} {ticket.assignedAgent.last_name}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                          Unassigned
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(ticket.created_at)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ position: 'sticky', right: 0, bgcolor: 'white', zIndex: 1 }}>
                      <IconButton onClick={(e) => handleAssignClick(e, ticket.id)}>
                        <ListDashIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleCloseMenu}
          slotProps={{
            paper: {
              elevation: 3,
              sx: { mt: 1, minWidth: 120, borderRadius: 2 }
            }
          }}
        >
          <MenuItem onClick={() => { handleCloseMenu(); if(selectedTicketId) navigate(`/admin/tickets/${selectedTicketId}`); }}>
            <ViewIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
            View
          </MenuItem>
          <MenuItem onClick={handleOpenAssignDialog}>
            <AssignIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
            Assign
          </MenuItem>
        </Menu>

        {/* Assign Dialog */}
        <Dialog open={assignDialogOpen} onClose={handleCloseAssignDialog} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 'bold' }}>Assign Ticket</DialogTitle>
          <DialogContent dividers>
            {(() => {
              const selectedTicket = tickets.find(t => t.id === selectedTicketId);
              if (!selectedTicket) return null;
              return (
                <Box>
                  <Typography variant="body2" gutterBottom><strong>Ticket ID:</strong> {selectedTicket.ticket_number}</Typography>
                  <Typography variant="body2" gutterBottom><strong>Subject:</strong> {selectedTicket.subject}</Typography>
                  <Typography variant="body2" gutterBottom><strong>Priority:</strong> {selectedTicket.priority}</Typography>
                  
                  <FormControl fullWidth sx={{ mt: 3 }}>
                    <InputLabel id="assign-agent-label">Assign To</InputLabel>
                    <Select
                      labelId="assign-agent-label"
                      value={selectedAgentToAssign}
                      label="Assign To"
                      onChange={(e) => setSelectedAgentToAssign(e.target.value)}
                    >
                      {agents.map((agent) => (
                        <MenuItem key={agent.id} value={agent.id}>
                          {agent.first_name} {agent.last_name}
                        </MenuItem>
                      ))}
                      {agents.length === 0 && (
                        <MenuItem disabled value="">No agents available</MenuItem>
                      )}
                    </Select>
                  </FormControl>
                </Box>
              );
            })()}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseAssignDialog} color="inherit">Cancel</Button>
            <Button onClick={handleOpenConfirmDialog} variant="contained" disabled={!selectedAgentToAssign}>Assign</Button>
          </DialogActions>
        </Dialog>

        {/* Confirm Dialog */}
        <Dialog open={confirmDialogOpen} onClose={handleCloseConfirmDialog}>
          <DialogContent sx={{ minWidth: 300, textAlign: 'center', py: 4 }}>
            <DialogContentText sx={{ color: 'text.primary', fontWeight: 500 }}>
              Are you sure you want to assign this ticket to this agent?
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
            <Button onClick={handleCloseConfirmDialog} color="inherit" sx={{ mr: 2 }}>Cancel</Button>
            <Button onClick={handleConfirmAssign} variant="contained" color="primary">OK</Button>
          </DialogActions>
        </Dialog>

        {/* Footer */}
        {!loading && (
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', flexShrink: 0 }}>
            <Typography variant="caption" color="text.secondary">
              Showing {tickets.length} of {total} tickets
            </Typography>
            {agentFilter === 'Unassigned' && (
              <Typography variant="caption" color="text.secondary">
                {total} unassigned
              </Typography>
            )}
          </Box>
        )}
      </Box>
    </AdminLayout>
  );
};

export default AdminTickets;
