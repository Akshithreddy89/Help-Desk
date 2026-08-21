import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, TextField, InputAdornment, 
  Avatar, IconButton
} from '@mui/material';
import { 
  Search as SearchIcon,
  Add as AddIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import AdminLayout from '../components/AdminLayout';
import AddAgentDialog from '../components/AddAgentDialog';
import DataTable, { type Column } from '../../../components/DataTable';
import axiosInstance from '../../../utils/axios';
import { getInitials, stringToColor, formatDate } from '../../../utils/ticketHelpers';

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
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      params.append('page', page.toString());
      params.append('size', '10');
      
      const response = await axiosInstance.get(`/admin/agents?${params.toString()}`);
      if (response.data.success) {
        setAgents(response.data.data.agents);
        setTotalPages(response.data.data.totalPages);
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
  }, [searchTerm, page]);

  // Reset page to 1 when search term changes
  useEffect(() => {
    setPage(1);
  }, [searchTerm]);





  const columns: Column<Agent>[] = [
    {
      id: 'agent',
      label: 'AGENT',
      render: (agent) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem', bgcolor: stringToColor(`${agent.first_name} ${agent.last_name}`), color: 'white', fontWeight: 'bold' }}>
            {getInitials(agent.first_name, agent.last_name)}
          </Avatar>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {agent.first_name} {agent.last_name}
          </Typography>
        </Box>
      )
    },
    {
      id: 'email',
      label: 'EMAIL',
      render: (agent) => <Typography variant="body2" color="text.secondary">{agent.email}</Typography>
    },
    {
      id: 'phone',
      label: 'PHONE',
      render: (agent) => <Typography variant="body2" color="text.secondary">{agent.phone_number || '-'}</Typography>
    },
    {
      id: 'joined',
      label: 'JOINED',
      render: (agent) => <Typography variant="body2" color="text.secondary">{formatDate(agent.created_at)}</Typography>
    },
    {
      id: 'total_tickets',
      label: 'TOTAL TICKETS',
      align: 'center',
      render: (agent) => <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{agent.total_tickets || 0}</Typography>
    },
    {
      id: 'open_tickets',
      label: 'OPEN',
      align: 'center',
      render: (agent) => <Typography variant="body2" sx={{ color: 'text.secondary' }}>{agent.open_tickets || 0}</Typography>
    },
    {
      id: 'resolved_closed',
      label: 'RESOLVED / CLOSED',
      align: 'center',
      render: (agent) => <Typography variant="body2" sx={{ color: '#4CAF50' }}>{agent.resolved_closed_tickets || 0}</Typography>
    },
    {
      id: 'status',
      label: 'STATUS',
      render: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#4CAF50' }} />
          <Typography variant="body2" sx={{ color: '#4CAF50', fontWeight: 500, fontSize: '0.8125rem' }}>Active</Typography>
        </Box>
      )
    }
  ];

  return (
    <AdminLayout>
      <Box sx={{ p: 3, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', overflow: 'hidden' }}>
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
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsAddDialogOpen(true)}
            sx={{ bgcolor: '#111318', '&:hover': { bgcolor: '#2c313d' }, borderRadius: 2, px: 3, textTransform: 'none' }}
          >
            Add Agent
          </Button>
        </Box>

        <DataTable 
          columns={columns} 
          data={agents} 
          loading={loading} 
          emptyMessage='No agents found. Click "Add Agent" to create one.' 
          minWidth={900}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
        

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
