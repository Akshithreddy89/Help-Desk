import React, { useEffect, useState, useCallback } from 'react';
import { 
  Box, Typography, Button, InputAdornment, TextField, 
  CircularProgress, Avatar, IconButton, ToggleButtonGroup, ToggleButton
} from '@mui/material';
import { Search as SearchIcon, Visibility as VisibilityIcon, Close as CloseIcon, ViewList as ViewListIcon, ViewKanban as ViewKanbanIcon } from '@mui/icons-material';
import AgentLayout from '../components/AgentLayout';
import KanbanBoard from '../components/KanbanBoard';
import DataTable, { type Column } from '../../../components/DataTable';
import FilterSelect from '../../../components/FilterSelect';
import { STATUS_FILTER_OPTIONS, PRIORITY_FILTER_OPTIONS } from '../../../utils/constants';
import { arrayMove } from '@dnd-kit/sortable';
import axiosInstance from '../../../utils/axios';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import { useToast } from '../../../context/ToastContext';
import StatusChip from '../../../components/StatusChip';
import PriorityChip from '../../../components/PriorityChip';
import { getInitials } from '../../../utils/ticketHelpers';

interface Ticket {
  id: string;
  ticket_number: string;
  subject: string;
  category: string;
  status: string;
  priority: string;
  created_at: string;
  customer?: {
    first_name: string;
    last_name: string;
  };
}

const AgentTickets: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    try {
      await axiosInstance.patch(`/agent/tickets/${ticketId}/status`, { status: newStatus });
      showToast('Status updated successfully!');
    } catch (error) {
      console.error("Failed to update ticket status", error);
      showToast('Failed to update ticket status', 'error');
      fetchTickets();
    }
  };

  const handleReorder = (activeId: string, overId: string | null, newStatus?: string) => {
    setTickets((prev) => {
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

  const formik = useFormik({
    initialValues: {
      search: '',
      status: 'All',
      priority: 'All',
    },
    onSubmit: () => {
      setPage(1);
      fetchTickets();
    },
  });

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (formik.values.search) params.append('search', formik.values.search);
      if (formik.values.status !== 'All') params.append('status', formik.values.status);
      if (formik.values.priority !== 'All') params.append('priority', formik.values.priority);
      if (viewMode === 'table') {
        params.append('page', page.toString());
        params.append('size', '10');
      } else {
        params.append('size', '1000');
      }

      const response = await axiosInstance.get(`/agent/tickets?${params.toString()}`);
      setTickets(response.data.data.tickets);
      setTotalPages(response.data.data.totalPages);
    } catch (error) {
      console.error("Failed to fetch agent tickets", error);
    } finally {
      setLoading(false);
    }
  }, [formik.values.search, formik.values.status, formik.values.priority, page, viewMode]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTickets();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchTickets]);

  const clearFilters = () => {
    formik.resetForm();
  };

  const columns: Column<Ticket>[] = [
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
        <Button
          variant="outlined"
          size="small"
          startIcon={<VisibilityIcon fontSize="small" />}
          onClick={() => navigate(`/agent/tickets/${ticket.id}`)}
          sx={{ textTransform: 'none', borderRadius: 2, color: 'text.secondary', borderColor: '#ddd' }}
        >
          View Ticket
        </Button>
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

        {/* Filters Row */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexShrink: 0 }}>
          {/* Search Bar - Left Side */}
          <TextField
            placeholder="Search tickets, ID, customer..."
            size="small"
            name="search"
            value={formik.values.search}
            onChange={formik.handleChange}
            sx={{ bgcolor: 'white', borderRadius: 2, minWidth: 320 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                endAdornment: formik.values.search ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => formik.setFieldValue('search', '')} edge="end">
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }
            }}
          />

          {/* Dropdowns - Right Side */}
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
              value={formik.values.status}
              onChange={(val) => formik.setFieldValue('status', val)}
              options={STATUS_FILTER_OPTIONS}
            />

            <FilterSelect
              value={formik.values.priority}
              onChange={(val) => formik.setFieldValue('priority', val)}
              options={PRIORITY_FILTER_OPTIONS}
            />
            
            {(formik.values.search || formik.values.status !== 'All' || formik.values.priority !== 'All') && (
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
            loading={loading} 
            emptyMessage="No tickets found matching your filters." 
            minWidth={900}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        ) : (
          <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
              </Box>
            ) : (
              <KanbanBoard 
                tickets={tickets} 
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
