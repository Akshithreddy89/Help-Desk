import React, { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, InputAdornment, MenuItem,
  Avatar, Button, Menu, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText,
  FormControl, Autocomplete, Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  PersonAddAlt as AssignIcon,
  MoreVert as MoreVertIcon,
  Visibility as ViewIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useToast } from '../../../context/ToastContext';
import AdminLayout from '../components/AdminLayout';
import DataTable, { type Column } from '../../../components/DataTable';
import FilterSelect from '../../../components/FilterSelect';
import { STATUS_FILTER_OPTIONS, PRIORITY_FILTER_OPTIONS } from '../../../utils/constants';
import { useNavigate } from 'react-router-dom';
import { getInitials, formatDate } from '../../../utils/ticketHelpers';
import StatusChip from '../../../components/StatusChip';
import PriorityChip from '../../../components/PriorityChip';
import { useAdminTickets, useAssignTicket } from '../hooks/useAdminTickets';
import { useAdminAgentOptions } from '../hooks/useAdminAgents';
import type { AdminTicketItem } from '../services/adminTicket.service';

const AdminTickets: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [agentFilter, setAgentFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const navigate = useNavigate();

  // Assign Menu State
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedAgentToAssign, setSelectedAgentToAssign] = useState('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const { showToast } = useToast();

  // Debounce search input by 400ms to avoid unnecessary network queries
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // React Query hook for tickets list with automatic caching and smooth pagination
  const {
    data: ticketsData,
    isLoading,
    isPlaceholderData,
    error,
  } = useAdminTickets({
    search: debouncedSearch,
    status: statusFilter,
    priority: priorityFilter,
    agentId: agentFilter,
    page,
    size: pageSize,
  });

  // Cached agent options for dropdown selection
  const { data: agents = [] } = useAdminAgentOptions();

  // Mutation hook for assigning tickets
  const assignTicketMutation = useAssignTicket();

  const tickets = ticketsData?.tickets || [];
  const totalPages = ticketsData?.totalPages || 1;
  const errorMessage = error instanceof Error ? error.message : error ? 'Failed to load tickets.' : null;

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handlePriorityChange = (value: string) => {
    setPriorityFilter(value);
    setPage(1);
  };

  const handleAgentChange = (value: string) => {
    setAgentFilter(value);
    setPage(1);
  };

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
      await assignTicketMutation.mutateAsync({
        ticketId: selectedTicketId,
        agentId: selectedAgentToAssign,
      });
      showToast('Ticket assigned successfully!', 'success');
    } catch (err: any) {
      console.error('Failed to assign ticket', err);
      showToast(err?.response?.data?.message || 'Failed to assign ticket', 'error');
    } finally {
      handleCloseConfirmDialog();
      handleCloseAssignDialog();
      setSelectedTicketId(null);
      setSelectedAgentToAssign('');
    }
  };

  const columns: Column<AdminTicketItem>[] = [
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
          <Avatar sx={{ width: 24, height: 24, fontSize: '0.65rem', bgcolor: 'rgba(0,0,0,0.05)', color: 'primary.main', fontWeight: 'bold' }}>
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
          <Avatar sx={{ width: 24, height: 24, fontSize: '0.65rem', bgcolor: 'primary.main', color: 'white', fontWeight: 'bold' }}>
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
          <MoreVertIcon />
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

        {errorMessage && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errorMessage}
          </Alert>
        )}

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
              onChange={handleStatusChange}
              options={STATUS_FILTER_OPTIONS}
            />

            <FilterSelect
              value={priorityFilter}
              onChange={handlePriorityChange}
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
              onChange={(_, newValue) => handleAgentChange(newValue ? newValue.id : 'All')}
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
          loading={isLoading && !isPlaceholderData} 
          emptyMessage="No tickets found matching your filters." 
          minWidth={1000}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          size={pageSize}
          onSizeChange={(newSize) => {
            setPageSize(newSize);
            setPage(1);
          }}
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
            <Button 
              onClick={handleOpenConfirmDialog} 
              variant="contained" 
              disabled={!selectedAgentToAssign || assignTicketMutation.isPending}
            >
              Assign
            </Button>
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
            <Button 
              onClick={handleConfirmAssign} 
              variant="contained" 
              color="primary"
              disabled={assignTicketMutation.isPending}
            >
              {assignTicketMutation.isPending ? 'Assigning...' : 'OK'}
            </Button>
          </DialogActions>
        </Dialog>

      </Box>

    </AdminLayout>
  );
};

export default AdminTickets;
