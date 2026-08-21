import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, TextField, InputAdornment, MenuItem,
  Avatar, Button, Menu, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText,
  FormControl, Autocomplete
} from '@mui/material';
import {
  Search as SearchIcon,
  PersonAddAlt as AssignIcon,
  FormatListBulleted as ListDashIcon,
  Visibility as ViewIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useToast } from '../../../context/ToastContext';
import AdminLayout from '../components/AdminLayout';
import DataTable, { type Column } from '../../../components/DataTable';
import FilterSelect from '../../../components/FilterSelect';
import { STATUS_FILTER_OPTIONS, PRIORITY_FILTER_OPTIONS } from '../../../utils/constants';
import axiosInstance from '../../../utils/axios';
import { useNavigate } from 'react-router-dom';
import { getInitials, stringToColor, formatDate } from '../../../utils/ticketHelpers';
import StatusChip from '../../../components/StatusChip';
import PriorityChip from '../../../components/PriorityChip';

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
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
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
  const [selectedAgentToAssign, setSelectedAgentToAssign] = useState('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const { showToast } = useToast();

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/admin/tickets', {
        params: {
          search: searchTerm,
          status: statusFilter,
          priority: priorityFilter,
          agentId: agentFilter,
          page,
          size: 10
        }
      });
      if (response.data.success) {
        setTickets(response.data.data.tickets);
        setTotalPages(response.data.data.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch tickets', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, priorityFilter, agentFilter, page]);

  const fetchAgents = async () => {
    try {
      const response = await axiosInstance.get('/admin/agents', { params: { size: 1000 } });
      if (response.data.success) {
        // Handle paginated response for agents
        const agentsData = Array.isArray(response.data.data) ? response.data.data : response.data.data.agents;
        setAgents(agentsData || []);
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

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter, priorityFilter, agentFilter]);

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
        showToast('Ticket assigned successfully!');
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

  const columns: Column<Ticket>[] = [
    {
      id: 'ticket_number',
      label: 'TICKET NUMBER',
      render: (ticket) => (
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
          {ticket.ticket_number}
        </Typography>
      )
    },
    {
      id: 'subject',
      label: 'SUBJECT',
      render: (ticket) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>{ticket.subject}</Typography>
          <Typography variant="caption" color="text.secondary">{ticket.category || 'General'}</Typography>
        </Box>
      )
    },
    {
      id: 'customer',
      label: 'CUSTOMER',
      render: (ticket) => ticket.customer ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ width: 24, height: 24, fontSize: '0.65rem', bgcolor: '#f5f5f5', color: '#666' }}>
            {getInitials(ticket.customer.first_name, ticket.customer.last_name)}
          </Avatar>
          <Typography variant="body2">{ticket.customer.first_name} {ticket.customer.last_name}</Typography>
        </Box>
      ) : <Typography variant="body2" color="text.secondary">-</Typography>
    },
    {
      id: 'status',
      label: 'STATUS',
      render: (ticket) => <StatusChip status={ticket.status} />
    },
    {
      id: 'priority',
      label: 'PRIORITY',
      render: (ticket) => <PriorityChip priority={ticket.priority} />
    },
    {
      id: 'assignedAgent',
      label: 'ASSIGNED TO',
      render: (ticket) => ticket.assignedAgent ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ width: 24, height: 24, fontSize: '0.65rem', bgcolor: stringToColor(`${ticket.assignedAgent.first_name} ${ticket.assignedAgent.last_name}`), color: 'white', fontWeight: 'bold' }}>
            {getInitials(ticket.assignedAgent.first_name, ticket.assignedAgent.last_name)}
          </Avatar>
          <Typography variant="body2">{ticket.assignedAgent.first_name} {ticket.assignedAgent.last_name}</Typography>
        </Box>
      ) : <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>Unassigned</Typography>
    },
    {
      id: 'created_at',
      label: 'DATE',
      render: (ticket) => <Typography variant="body2" color="text.secondary">{formatDate(ticket.created_at)}</Typography>
    },
    {
      id: 'actions',
      label: 'ACTIONS',
      align: 'right',
      render: (ticket) => (
        <IconButton onClick={(e) => handleAssignClick(e, ticket.id)}>
          <ListDashIcon />
        </IconButton>
      )
    }
  ];

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
            <FilterSelect
              value={statusFilter}
              onChange={setStatusFilter}
              options={STATUS_FILTER_OPTIONS}
            />

            <FilterSelect
              value={priorityFilter}
              onChange={setPriorityFilter}
              options={PRIORITY_FILTER_OPTIONS}
            />

            <Autocomplete
              options={[{ id: 'All', name: 'All Agents' }, ...agents.map(a => ({ id: a.id, name: `${a.first_name} ${a.last_name}` })), { id: 'Unassigned', name: 'Unassigned Tickets' }]}
              getOptionLabel={(option) => option.name}
              value={
                agentFilter === 'All' ? { id: 'All', name: 'All Agents' } :
                agentFilter === 'Unassigned' ? { id: 'Unassigned', name: 'Unassigned Tickets' } :
                agents.find(a => a.id === agentFilter) ? { id: agentFilter, name: `${agents.find(a => a.id === agentFilter)?.first_name} ${agents.find(a => a.id === agentFilter)?.last_name}` } :
                { id: 'All', name: 'All Agents' }
              }
              onChange={(_, newValue) => setAgentFilter(newValue ? newValue.id : 'All')}
              size="small"
              disableClearable
              slotProps={{
                popper: {
                  placement: 'bottom-start',
                },
              }}
              sx={{ bgcolor: 'white', borderRadius: 2, minWidth: 200 }}
              renderInput={(params) => <TextField {...params} />}
            />
          </Box>
        </Box>

        {/* Tickets Table */}
        <DataTable 
          columns={columns} 
          data={tickets} 
          loading={loading} 
          emptyMessage="No tickets found matching your filters." 
          minWidth={1000}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />

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
                    <Autocomplete
                      options={agents.map(a => ({ id: a.id, name: `${a.first_name} ${a.last_name}` }))}
                      getOptionLabel={(option) => option.name}
                      value={agents.find(a => a.id === selectedAgentToAssign) ? { id: selectedAgentToAssign, name: `${agents.find(a => a.id === selectedAgentToAssign)?.first_name} ${agents.find(a => a.id === selectedAgentToAssign)?.last_name}` } : null}
                      onChange={(_, newValue) => setSelectedAgentToAssign(newValue ? newValue.id : '')}
                      renderInput={(params) => <TextField {...params} label="Assign To" />}
                      disabled={agents.length === 0}
                      slotProps={{
                        popper: {
                          placement: 'bottom-start',
                          modifiers: [
                            {
                              name: 'flip',
                              enabled: false,
                            },
                          ],
                        },
                      }}
                    />
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

      </Box>

    </AdminLayout>
  );
};

export default AdminTickets;
