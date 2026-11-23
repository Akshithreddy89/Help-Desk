import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, TextField, CircularProgress, Alert, Paper, InputAdornment, IconButton, Pagination, Autocomplete } from '@mui/material';
import { Add as AddIcon, Search as SearchIcon, Close as CloseIcon } from '@mui/icons-material';
import CustomerLayout from '../components/CustomerLayout';
import RaiseTicketDialog from '../components/RaiseTicketDialog';
import { useNavigate } from 'react-router-dom';
import StatusChip from '../../../components/StatusChip';
import PriorityChip from '../../../components/PriorityChip';
import { formatDate } from '../../../utils/ticketHelpers';
import FilterSelect from '../../../components/FilterSelect';
import { STATUS_FILTER_OPTIONS } from '../../../utils/constants';
import { useCustomerTickets } from '../hooks/useCustomerTickets';

const MyTickets: React.FC = () => {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  const [isRaiseTicketOpen, setIsRaiseTicketOpen] = useState(false);
  const navigate = useNavigate();

  // Debounce search input by 400ms to avoid unnecessary network queries
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  // React Query hook for tickets list with automatic caching and smooth pagination
  const {
    data,
    isLoading,
    isPlaceholderData,
    error,
  } = useCustomerTickets({
    search: debouncedSearch,
    status: statusFilter,
    page,
    size: pageSize,
  });

  const tickets = data?.tickets || [];
  const totalPages = data?.totalPages || 1;
  const errorMessage = error instanceof Error ? error.message : error ? 'Failed to load tickets.' : null;

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

        {errorMessage && <Alert severity="error" sx={{ mb: 3 }}>{errorMessage}</Alert>}

        {/* Ticket List */}
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 2, 
            overflowY: 'auto', 
            flex: 1, 
            pr: 1,
            opacity: isPlaceholderData ? 0.65 : 1,
            transition: 'opacity 0.2s ease',
          }}>
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

        {!isLoading && (totalPages > 1 || tickets.length > 0) && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3, mb: 2, flexShrink: 0, px: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">Rows per page:</Typography>
              <Autocomplete
                freeSolo
                options={['5', '10', '15', '20']}
                value={pageSize.toString()}
                onChange={(_, newValue) => {
                  const newSize = parseInt(newValue || '10', 10);
                  if (!isNaN(newSize) && newSize > 0) {
                    setPageSize(newSize);
                    setPage(1);
                  }
                }}
                onInputChange={(_, newInputValue) => {
                  const newSize = parseInt(newInputValue, 10);
                  if (!isNaN(newSize) && newSize > 0) {
                    setPageSize(newSize);
                    setPage(1);
                  }
                }}
                disableClearable
                renderInput={(params) => (
                  <TextField {...params} variant="outlined" size="small" sx={{ width: 80, '& .MuiInputBase-root': { fontSize: '0.875rem', backgroundColor: '#fff' } }} />
                )}
              />
            </Box>
            {totalPages > 1 && (
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={(_, value) => setPage(value)} 
                color="primary" 
              />
            )}
          </Box>
        )}

      </Box>

      {/* Raise Ticket Dialog */}
      <RaiseTicketDialog 
        open={isRaiseTicketOpen} 
        onClose={() => setIsRaiseTicketOpen(false)} 
      />
    </CustomerLayout>
  );
};

export default MyTickets;
