import React from 'react';
import { Box, Typography } from '@mui/material';
import { Calendar as CalendarIcon, Globe, ArrowLeft } from 'lucide-react';
import { type PublicAgent, type PublicSlot } from '../services/publicSchedule.service';
import dayjs from 'dayjs';
import { IconButton } from '@mui/material';

interface AgentInfoPaneProps {
  agent: PublicAgent;
  duration?: number;
  selectedSlot?: PublicSlot;
  onBack?: () => void;
}

const AgentInfoPane: React.FC<AgentInfoPaneProps> = ({ agent, selectedSlot, onBack }) => {
  return (
    <Box sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {onBack && (
        <IconButton onClick={onBack} sx={{ alignSelf: 'flex-start', mb: 2, border: '1px solid', borderColor: 'divider' }}>
          <ArrowLeft size={20} color="#1976d2" />
        </IconButton>
      )}
      
      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
        {agent.full_name}
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
        {agent.email}
      </Typography>


      
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
        New Meeting
      </Typography>
      
      

    

      {selectedSlot && (
        <>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', color: 'text.secondary', mb: 2 }}>
            <CalendarIcon size={20} style={{ marginRight: 12, marginTop: 2 }} />
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {dayjs(selectedSlot.start_datetime).format('h:mma')} - {dayjs(selectedSlot.end_datetime).format('h:mma')}, {dayjs(selectedSlot.start_datetime).format('dddd, MMMM D, YYYY')}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', color: 'text.secondary', mb: 2 }}>
            <Globe size={20} style={{ marginRight: 12, marginTop: 2 }} />
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {Intl.DateTimeFormat().resolvedOptions().timeZone}
            </Typography>
          </Box>
        </>
      )}
      <Box sx={{ flexGrow: 1 }} />
      

    </Box>
  );
};

export default AgentInfoPane;
