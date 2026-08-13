import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, TextField, InputAdornment, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Avatar
} from '@mui/material';
import { 
  Search as SearchIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import AdminLayout from '../components/AdminLayout';
import AddAgentDialog from '../components/AddAgentDialog';
import axiosInstance from '../../../utils/axios';

// Add type for Agent
interface Agent {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  created_at: string;
  account_status: string;
  total_tickets?: number;
  open_tickets?: number;
  resolved_closed_tickets?: number;
}

const AdminAgents: React.FC = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await axiosInstance.get(`/admin/agents?${params.toString()}`);
      if (response.data.success) {
        setAgents(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch agents', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchAgents();
    }, 500); // 500ms delay

    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  // function to generate somewhat random colors based on string
  const stringToColor = (string: string) => {
    let hash = 0;
    let i;
    for (i = 0; i < string.length; i += 1) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.slice(-2);
    }
    return color;
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-GB', options);
  };



  return (
    <AdminLayout>
      <Box sx={{ p: 4, maxWidth: 1200, width: '100%', margin: '0 auto', height: '100%', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', overflow: 'hidden' }}>
        <Box sx={{ mb: 4, flexShrink: 0 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1, fontFamily: 'serif' }}>
            Agents
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your support team and view their ticket workload.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexShrink: 0 }}>
          <TextField
            placeholder="Search agents..."
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ bgcolor: 'white', borderRadius: 2, minWidth: 300 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                )
              }
            }}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsAddDialogOpen(true)}
            sx={{ bgcolor: '#111318', '&:hover': { bgcolor: '#2c313d' }, borderRadius: 2, px: 3, textTransform: 'none' }}
          >
            Add Agent
          </Button>
        </Box>

        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', flexGrow: 1, overflow: 'auto', minHeight: 0 }}>
          <Table stickyHeader sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ '& th': { borderBottom: '1px solid #eee', color: 'text.secondary', fontWeight: 'bold', fontSize: '0.75rem', bgcolor: 'white' } }}>
                <TableCell>AGENT</TableCell>
                <TableCell>EMAIL</TableCell>
                <TableCell>PHONE</TableCell>
                <TableCell>JOINED</TableCell>
                <TableCell align="center">TOTAL TICKETS</TableCell>
                <TableCell align="center">OPEN</TableCell>
                <TableCell align="center">RESOLVED / CLOSED</TableCell>
                <TableCell>STATUS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Loading agents...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : agents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <Typography variant="body1" color="text.secondary">
                      No agents found. Click "Add Agent" to create one.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                agents.map((agent) => (
                  <TableRow key={agent.id} sx={{ '& td': { borderBottom: '1px solid #eee' }, '&:last-child td': { borderBottom: 0 } }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar 
                          sx={{ 
                            width: 32, 
                            height: 32, 
                            fontSize: '0.875rem', 
                            bgcolor: stringToColor(`${agent.first_name} ${agent.last_name}`),
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                        >
                          {getInitials(agent.first_name, agent.last_name)}
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {agent.first_name} {agent.last_name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {agent.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {agent.phone_number || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(agent.created_at)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {agent.total_tickets || 0}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {agent.open_tickets || 0}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" sx={{ color: '#4CAF50' }}>
                        {agent.resolved_closed_tickets || 0}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#4CAF50' }} />
                        <Typography variant="body2" sx={{ color: '#4CAF50', fontWeight: 500, fontSize: '0.8125rem' }}>
                          Active
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        {!loading && (
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-start', flexShrink: 0 }}>
            <Typography variant="caption" color="text.secondary">
              {agents.length} agent{agents.length !== 1 ? 's' : ''} total
            </Typography>
          </Box>
        )}
      </Box>

      <AddAgentDialog 
        open={isAddDialogOpen} 
        onClose={() => setIsAddDialogOpen(false)} 
        onAgentAdded={() => {
          fetchAgents();
        }}
      />
    </AdminLayout>
  );
};

export default AdminAgents;
