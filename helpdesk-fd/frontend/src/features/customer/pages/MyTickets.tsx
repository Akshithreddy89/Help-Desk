import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, TextField, CircularProgress, Alert, Paper, Chip, ToggleButtonGroup, ToggleButton, InputAdornment, IconButton } from '@mui/material';
import { Add as AddIcon, Search as SearchIcon, Close as CloseIcon } from '@mui/icons-material';
import CustomerLayout from '../components/CustomerLayout';
import RaiseTicketDialog from '../components/RaiseTicketDialog';
import axiosInstance from '../../../utils/axios';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

interface Ticket {
  id: string;
  ticket_number: string;
  subject: string;
  priority: string;
  status: string;
  created_at: string;
}

const MyTickets: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  const [isRaiseTicketOpen, setIsRaiseTicketOpen] = useState(false);
  const navigate = useNavigate();

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/tickets', {
        params: {
          search: search || undefined,
          status: statusFilter !== 'All' ? statusFilter : undefined,
        }
      });
      setTickets(response.data.data);
      setError(null);
    } catch (err: any) {
      console.error("Failed to fetch tickets", err);
      setError('Failed to load tickets. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Adding a debounce for search
    const delayDebounceFn = setTimeout(() => {
      fetchTickets();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search, statusFilter]);

  const handleStatusChange = (
    _event: React.MouseEvent<HTMLElement>,
    newStatus: string | null,
  ) => {
    if (newStatus !== null) {
      setStatusFilter(newStatus);
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

  return (
    <CustomerLayout>
      <Box sx={{ p: 3, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', overflow: 'hidden' }}>
        <Box sx={{ mb: 4, flexShrink: 0 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }} gutterBottom>My Tickets</Typography>
          <Typography variant="body2" color="text.secondary">
            Track and manage all your submitted tickets.
          </Typography>
        </Box>

        {/* Filters and Actions */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { md: 'center' }, gap: 2, mb: 4 }}>
          <TextField
            placeholder="Search tickets..."
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ width: { xs: '100%', md: 300 }, backgroundColor: '#fff', borderRadius: 1 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                endAdornment: search ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearch('')} edge="end">
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              },
            }}
          />

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
            <ToggleButtonGroup
              color="primary"
              value={statusFilter}
              exclusive
              onChange={handleStatusChange}
              size="small"
              sx={{ backgroundColor: '#fff' }}
            >
              <ToggleButton value="All" sx={{ textTransform: 'none', px: 2 }}>All</ToggleButton>
              <ToggleButton value="Open" sx={{ textTransform: 'none', px: 2 }}>Open</ToggleButton>
              <ToggleButton value="In Progress" sx={{ textTransform: 'none', px: 2 }}>In Progress</ToggleButton>
              <ToggleButton value="Resolved" sx={{ textTransform: 'none', px: 2 }}>Resolved</ToggleButton>
              <ToggleButton value="Closed" sx={{ textTransform: 'none', px: 2 }}>Closed</ToggleButton>
            </ToggleButtonGroup>

            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => setIsRaiseTicketOpen(true)}
              sx={{ backgroundColor: '#000', color: '#fff', '&:hover': { backgroundColor: '#333' }, textTransform: 'none', borderRadius: 2, px: 3, py: 1 }}
            >
              Raise Ticket
            </Button>
          </Box>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {/* Ticket List */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto', flex: 1, pr: 1 }}>
            {tickets.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3, border: '1px solid #eee', boxShadow: 'none' }}>
                <Typography color="text.secondary">No tickets found.</Typography>
              </Paper>
            ) : (
              tickets.map((ticket) => (
                <Paper key={ticket.id} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #eee', boxShadow: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', '&:hover': { borderColor: '#ddd', backgroundColor: '#fafafa' }, transition: 'all 0.2s' }}>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>{ticket.ticket_number}</Typography>
                      <Typography variant="caption" sx={{ color: getPriorityColor(ticket.priority), fontWeight: 600 }}>{ticket.priority}</Typography>
                    </Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }} gutterBottom>{ticket.subject}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {dayjs(ticket.created_at).format('D MMM YYYY')}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Chip label={ticket.status} color={getStatusColor(ticket.status) as any} size="small" variant="outlined" sx={{ fontWeight: 600, minWidth: 80 }} />
                    <Button 
                      variant="outlined" 
                      color="inherit" 
                      size="small" 
                      onClick={() => navigate(`/customer/tickets/${ticket.id}`)}
                      sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600 }}
                    >
                      View
                    </Button>
                  </Box>
                </Paper>
              ))
            )}
          </Box>
        )}

      </Box>

      {/* Raise Ticket Dialog */}
      <RaiseTicketDialog 
        open={isRaiseTicketOpen} 
        onClose={() => setIsRaiseTicketOpen(false)}
        onSuccess={() => {
          fetchTickets();
        }}
      />
    </CustomerLayout>
  );
};

export default MyTickets;
