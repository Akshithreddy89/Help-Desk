import React, { useState } from 'react';
import { 
  Box, Typography, Button, TextField, InputAdornment, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper 
} from '@mui/material';
import { 
  Search as SearchIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import AdminLayout from '../components/AdminLayout';
import AddAgentDialog from '../components/AddAgentDialog';

const AdminAgents: React.FC = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <AdminLayout>
      <Box sx={{ p: 4, maxWidth: 1200, margin: '0 auto' }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1, fontFamily: 'serif' }}>
            Agents
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your support team and view their ticket workload.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
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

        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ '& th': { borderBottom: '1px solid #eee', color: 'text.secondary', fontWeight: 'bold', fontSize: '0.75rem' } }}>
                <TableCell>AGENT</TableCell>
                <TableCell>EMAIL</TableCell>
                <TableCell>PHONE</TableCell>
                <TableCell>JOINED</TableCell>
                <TableCell align="center">TOTAL TICKETS</TableCell>
                <TableCell align="center">OPEN</TableCell>
                <TableCell align="center">RESOLVED / CLOSED</TableCell>
                <TableCell align="center">STATUS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Empty state per user request since GET API doesn't exist yet */}
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                  <Typography variant="body1" color="text.secondary">
                    No agents found. Click "Add Agent" to create one.
                  </Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <AddAgentDialog 
        open={isAddDialogOpen} 
        onClose={() => setIsAddDialogOpen(false)} 
        onAgentAdded={() => {
          // You would normally fetch agents here, but there is no GET API yet.
          console.log('Agent added successfully');
        }}
      />
    </AdminLayout>
  );
};

export default AdminAgents;
