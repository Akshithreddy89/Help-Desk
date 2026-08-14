import React, { useEffect, useState, useCallback } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Chip, Button, InputAdornment, TextField, 
  Select, MenuItem, CircularProgress, Avatar, IconButton
} from '@mui/material';
import { Search as SearchIcon, Visibility as VisibilityIcon, Close as CloseIcon } from '@mui/icons-material';
import AgentLayout from '../components/AgentLayout';
import axiosInstance from '../../../utils/axios';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';

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
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      search: '',
      status: 'All',
      priority: 'All',
    },
    onSubmit: () => {
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

      const response = await axiosInstance.get(`/agent/tickets?${params.toString()}`);
      setTickets(response.data.data);
    } catch (error) {
      console.error("Failed to fetch agent tickets", error);
    } finally {
      setLoading(false);
    }
  }, [formik.values.search, formik.values.status, formik.values.priority]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTickets();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchTickets]);

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

  const clearFilters = () => {
    formik.resetForm();
  };

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
            <Select
              name="status"
              value={formik.values.status}
              onChange={formik.handleChange}
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
              name="priority"
              value={formik.values.priority}
              onChange={formik.handleChange}
              size="small"
              sx={{ bgcolor: 'white', borderRadius: 2, minWidth: 150 }}
            >
              <MenuItem value="All">All Priorities</MenuItem>
              <MenuItem value="Low">Low</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="High">High</MenuItem>
            </Select>
            
            <Button 
              variant="text" 
              onClick={clearFilters}
              sx={{ textTransform: 'none', fontWeight: 600, color: 'primary.main' }}
            >
              Clear Filters
            </Button>
          </Box>
        </Box>

        {/* Tickets Table */}
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', flexGrow: 1, overflow: 'auto', minHeight: 0 }}>
          <Table stickyHeader sx={{ minWidth: 900 }}>
            <TableHead>
              <TableRow sx={{ '& th': { borderBottom: '1px solid #eee', color: 'text.secondary', fontWeight: 'bold', fontSize: '0.75rem', bgcolor: 'white' } }}>
                <TableCell>TICKET ID</TableCell>
                <TableCell>TITLE</TableCell>
                <TableCell>CUSTOMER</TableCell>
                <TableCell>STATUS</TableCell>
                <TableCell>PRIORITY</TableCell>
                <TableCell>DATE</TableCell>
                <TableCell align="center">ACTION</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : tickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                    <Typography color="text.secondary">No tickets found matching your filters.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                tickets.map((ticket) => (
                  <TableRow key={ticket.id} hover sx={{ '& td': { borderBottom: '1px solid #f5f5f5', py: 1.5 } }}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                        {ticket.ticket_number}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main', mb: 0.5 }}>
                        {ticket.subject}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {ticket.category}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 24, height: 24, fontSize: '0.7rem', bgcolor: '#e0e0e0', color: '#000' }}>
                          {ticket.customer?.first_name?.[0]}{ticket.customer?.last_name?.[0]}
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {ticket.customer ? `${ticket.customer.first_name} ${ticket.customer.last_name}` : 'Unknown'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={ticket.status} 
                        size="small" 
                        sx={{ 
                          bgcolor: `${getStatusColor(ticket.status)}15`, 
                          color: getStatusColor(ticket.status),
                          fontWeight: 600,
                          borderRadius: 1.5,
                          border: `1px solid ${getStatusColor(ticket.status)}40`
                        }} 
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: getPriorityColor(ticket.priority) }} />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {ticket.priority}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {dayjs(ticket.created_at).format('YYYY-MM-DD')}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<VisibilityIcon fontSize="small" />}
                        onClick={() => navigate(`/agent/tickets/${ticket.id}`)}
                        sx={{ textTransform: 'none', borderRadius: 2, color: 'text.secondary', borderColor: '#ddd' }}
                      >
                        View Ticket
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Footer */}
        {!loading && (
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-start', flexShrink: 0 }}>
            <Typography variant="caption" color="text.secondary">
              Showing {tickets.length} of {tickets.length} tickets
            </Typography>
          </Box>
        )}
      </Box>
    </AgentLayout>
  );
};

export default AgentTickets;
