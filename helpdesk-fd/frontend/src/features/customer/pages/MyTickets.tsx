import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, TextField, CircularProgress, Alert, Paper, InputAdornment, IconButton, Pagination } from '@mui/material';
import { Add as AddIcon, Search as SearchIcon, Close as CloseIcon } from '@mui/icons-material';
import CustomerLayout from '../components/CustomerLayout';
import RaiseTicketDialog from '../components/RaiseTicketDialog';
import axiosInstance from '../../../utils/axios';
import { useNavigate } from 'react-router-dom';
import StatusChip from '../../../components/StatusChip';
import PriorityChip from '../../../components/PriorityChip';
import { formatDate } from '../../../utils/ticketHelpers';
import FilterSelect from '../../../components/FilterSelect';
import { STATUS_FILTER_OPTIONS } from '../../../utils/constants';

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
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [isRaiseTicketOpen, setIsRaiseTicketOpen] = useState(false);
  const navigate = useNavigate();

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/tickets', {
        params: {
          search: search || undefined,
          status: statusFilter !== 'All' ? statusFilter : undefined,
          page,
          size: 10
        }
      });
      
      if (Array.isArray(response.data.data)) {
        setTickets(response.data.data);
      } else {
        setTickets(response.data.data.tickets || []);
        setTotalPages(response.data.data.totalPages || 1);
      }
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
  }, [search, statusFilter, page]);

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
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
            <FilterSelect
              value={statusFilter}
              onChange={handleStatusChange}
              options={STATUS_FILTER_OPTIONS}
            />

            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => setIsRaiseTicketOpen(true)}
              color="primary"
              sx={{ textTransform: 'none', borderRadius: 2, px: 3, py: 1 }}
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
                      <PriorityChip priority={ticket.priority} variant="textOnly" />
                    </Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }} gutterBottom>{ticket.subject}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(ticket.created_at)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <StatusChip status={ticket.status} sx={{ minWidth: 80 }} />
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

        {!loading && totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 2, flexShrink: 0 }}>
            <Pagination 
              count={totalPages} 
              page={page} 
              onChange={(_, value) => setPage(value)} 
              color="primary" 
            />
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
