import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, TextField, InputAdornment, 
  Avatar, IconButton, Alert
} from '@mui/material';
import { 
  Search as SearchIcon,
  Add as AddIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import AdminLayout from '../components/AdminLayout';
import AddAgentDialog from '../components/AddAgentDialog';
import DataTable, { type Column } from '../../../components/DataTable';
import { getInitials, formatDate } from '../../../utils/ticketHelpers';
import { useAdminAgents } from '../hooks/useAdminAgents';
import type { AdminAgentItem } from '../services/adminAgent.service';

const AdminAgents: React.FC = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Debounce search input by 400ms to avoid unnecessary network queries
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // React Query hook for agents list with automatic caching and smooth pagination
  const {
    data: agentsData,
    isLoading,
    isPlaceholderData,
    error,
  } = useAdminAgents({
    search: debouncedSearch,
    page,
    size: pageSize,
  });

  const agents = agentsData?.agents || [];
  const totalPages = agentsData?.totalPages || 1;
  const errorMessage = error instanceof Error ? error.message : error ? 'Failed to load agents.' : null;

  const columns: Column<AdminAgentItem>[] = [
    {
      id: 'agent',
      label: 'AGENT',
      render: (agent) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem', bgcolor: 'primary.main', color: 'white', fontWeight: 'bold' }}>
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

        {errorMessage && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errorMessage}
          </Alert>
        )}

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
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setIsAddDialogOpen(true)}
            sx={{ borderRadius: 2, px: 3, textTransform: 'none' }}
          >
            Add Agent
          </Button>
        </Box>

        <DataTable 
          columns={columns} 
          data={agents} 
          loading={isLoading && !isPlaceholderData} 
          emptyMessage='No agents found. Click "Add Agent" to create one.' 
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

      </Box>

      <AddAgentDialog 
        open={isAddDialogOpen} 
        onClose={() => setIsAddDialogOpen(false)} 
      />
    </AdminLayout>
  );
};

export default AdminAgents;
