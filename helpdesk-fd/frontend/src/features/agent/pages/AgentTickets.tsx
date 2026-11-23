import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Button, InputAdornment, TextField, 
  CircularProgress, Avatar, IconButton, ToggleButtonGroup, ToggleButton, Alert
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Visibility as VisibilityIcon, 
  Close as CloseIcon, 
  ViewList as ViewListIcon, 
  ViewKanban as ViewKanbanIcon 
} from '@mui/icons-material';
import AgentLayout from '../components/AgentLayout';
import KanbanBoard from '../components/KanbanBoard';
import DataTable, { type Column } from '../../../components/DataTable';
import FilterSelect from '../../../components/FilterSelect';
import { STATUS_FILTER_OPTIONS, PRIORITY_FILTER_OPTIONS } from '../../../utils/constants';
import { arrayMove } from '@dnd-kit/sortable';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../../context/ToastContext';
import StatusChip from '../../../components/StatusChip';
import PriorityChip from '../../../components/PriorityChip';
import { getInitials } from '../../../utils/ticketHelpers';
import { useAgentTickets, useUpdateTicketStatus } from '../hooks/useAgentTickets';
import type { AgentTicketItem } from '../services/agentTicket.service';

const AgentTickets: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [localTickets, setLocalTickets] = useState<AgentTicketItem[]>([]);
  
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Debounce search input by 400ms to avoid unnecessary network queries
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // React Query hook for agent tickets
  const {
    data: ticketsData,
    isLoading,
    isPlaceholderData,
    error,
  } = useAgentTickets({
    search: debouncedSearch,
    status: statusFilter,
    priority: priorityFilter,
    page: viewMode === 'table' ? page : 1,
    size: viewMode === 'table' ? pageSize : 1000,
  });

  const updateTicketStatusMutation = useUpdateTicketStatus();

  const tickets = ticketsData?.tickets || [];
  const totalPages = ticketsData?.totalPages || 1;
  const errorMessage = error instanceof Error ? error.message : error ? 'Failed to load tickets.' : null;

  // Keep localTickets in sync with React Query cached data for smooth Kanban dragging
  useEffect(() => {
    if (ticketsData?.tickets) {
      setLocalTickets(ticketsData.tickets);
    }
  }, [ticketsData?.tickets]);

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    try {
      await updateTicketStatusMutation.mutateAsync({ ticketId, status: newStatus });
      showToast('Status updated successfully!', 'success');
    } catch (err: any) {
      console.error("Failed to update ticket status", err);
      showToast(err?.response?.data?.message || 'Failed to update ticket status', 'error');
    }
  };

  const handleReorder = (activeId: string, overId: string | null, newStatus?: string) => {
    setLocalTickets((prev) => {
      const activeIndex = prev.findIndex((t) => t.id === activeId);
      if (activeIndex === -1) return prev;
      const activeTicket = prev[activeIndex];

      let newTickets = [...prev];

      if (newStatus && activeTicket.status !== newStatus) {
        newTickets[activeIndex] = { ...activeTicket, status: newStatus };
      }

      if (overId) {
        const overIndex = newTickets.findIndex((t) => t.id === overId);
        if (overIndex !== -1 && activeIndex !== overIndex) {
          newTickets = arrayMove(newTickets, activeIndex, overIndex);
        }
      }

      return newTickets;
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('All');
    setPriorityFilter('All');
    setPage(1);
  };

  const columns: Column<AgentTicketItem>[] = [
    {
      id: 'ticket_number',
      label: 'TICKET ID',
      render: (ticket) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
          {ticket.ticket_number}
        </Typography>
      )
    },
    {
      id: 'subject',
      label: 'TITLE',
      render: (ticket) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main', mb: 0.5 }}>{ticket.subject}</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>{ticket.category}</Typography>
        </Box>
      )
    },
    {
      id: 'customer',
      label: 'CUSTOMER',
      render: (ticket) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ width: 24, height: 24, fontSize: '0.7rem', bgcolor: 'primary.main', color: '#fff' }}>
            {getInitials(ticket.customer?.first_name, ticket.customer?.last_name)}
          </Avatar>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {ticket.customer ? `${ticket.customer.first_name} ${ticket.customer.last_name}` : 'Unknown'}
          </Typography>
        </Box>
      )
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
      id: 'created_at',
      label: 'DATE',
      render: (ticket) => (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {dayjs(ticket.created_at).format('YYYY-MM-DD')}
        </Typography>
      )
    },
    {
      id: 'action',
      label: 'ACTION',
      align: 'center',
      render: (ticket) => (
        <IconButton
          size="small"
          onClick={() => navigate(`/agent/tickets/${ticket.id}`)}
          sx={{ color: 'text.secondary' }}
        >
          <VisibilityIcon fontSize="small" />
        </IconButton>
      )
    }
  ];

  return (
    <AgentLayout>
      <Box sx={{ p: 3, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', overflow: 'hidden' }}>
        
        {/* Header */}
        <Box sx={{ mb: 4, flexShrink: 0 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1, fontFamily: 'serif' }}>
            My Tickets
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tickets assigned to you, newest first.
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

          {/* Controls - Right Side */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, newMode) => newMode && setViewMode(newMode)}
              size="small"
              sx={{ bgcolor: 'white' }}
            >
              <ToggleButton value="table" aria-label="table view">
                <ViewListIcon fontSize="small" />
              </ToggleButton>
              <ToggleButton value="kanban" aria-label="kanban view">
                <ViewKanbanIcon fontSize="small" />
              </ToggleButton>
            </ToggleButtonGroup>

            <FilterSelect
              value={statusFilter}
              onChange={(val) => {
                setStatusFilter(val);
                setPage(1);
              }}
              options={STATUS_FILTER_OPTIONS}
            />

            <FilterSelect
              value={priorityFilter}
              onChange={(val) => {
                setPriorityFilter(val);
                setPage(1);
              }}
              options={PRIORITY_FILTER_OPTIONS}
            />
            
            {(searchTerm || statusFilter !== 'All' || priorityFilter !== 'All') && (
              <Button 
                variant="text" 
                onClick={clearFilters}
                sx={{ textTransform: 'none', fontWeight: 600, color: 'primary.main' }}
              >
                Clear Filters
              </Button>
            )}
          </Box>
        </Box>

        {/* Content Area */}
        {viewMode === 'table' ? (
          <DataTable 
            columns={columns} 
            data={tickets} 
            loading={isLoading && !isPlaceholderData} 
            emptyMessage="No tickets found matching your filters." 
            minWidth={900}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            size={pageSize}
            onSizeChange={(newSize) => {
              setPageSize(newSize);
              setPage(1);
            }}
          />
        ) : (
          <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
            {isLoading && localTickets.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
              </Box>
            ) : (
              <KanbanBoard 
                tickets={localTickets} 
                onStatusChange={handleStatusChange} 
                onTicketClick={(id) => navigate(`/agent/tickets/${id}`)} 
                onReorder={handleReorder}
              />
            )}
          </Box>
        )}
        
      </Box>
    </AgentLayout>
  );
};

export default AgentTickets;
