import React, { useState } from 'react';
import { Box, Typography, Paper, Button, Chip } from '@mui/material';
import dayjs from 'dayjs';

import GeneratedSlots from './GeneratedSlots';
import { getSlots, type AgentAvailabilityResponse, type SlotResponse } from '../../services/availability.service';

interface SlotCardProps {
  dateStr: string;
  blocks: AgentAvailabilityResponse[];
}

const SlotCard: React.FC<SlotCardProps> = ({ dateStr, blocks }) => {
  const [isHidden, setIsHidden] = useState(true);
  const [slots, setSlots] = useState<SlotResponse[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isPast = dayjs(dateStr).isBefore(dayjs().startOf('day'));

  const handleToggle = async () => {
    if (isHidden && slots === null) {
      setIsLoading(true);
      try {
        const fetchedSlots = await getSlots(dateStr);
        setSlots(fetchedSlots);
      } catch (error) {
        console.error("Failed to fetch slots", error);
      } finally {
        setIsLoading(false);
      }
    }
    setIsHidden(!isHidden);
  };

  const displayDate = dayjs(dateStr).format('D MMMM YYYY');
  const firstBlock = blocks[0];
  const startTimeFormatted = dayjs(`${dateStr}T${firstBlock.start_time}`).format('h:mm A');
  const endTimeFormatted = dayjs(`${dateStr}T${firstBlock.end_time}`).format('h:mm A');
  const summaryText = `${startTimeFormatted} - ${endTimeFormatted}${blocks.length > 1 ? ` (+${blocks.length - 1} more ranges)` : ''} • ${firstBlock.slot_duration_minutes} min slots${slots ? ` • ${slots.length} slots` : ''}`;

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 0, 
        borderRadius: 2, 
        border: 1, 
        borderColor: 'divider', 
        bgcolor: isPast ? '#fbfbfb' : 'background.paper',
        overflow: 'hidden' 
      }}
    >
      {/* Header Row */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3, borderBottom: isHidden ? 'none' : 1, borderColor: 'divider' }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem', color: isPast ? 'text.secondary' : 'text.primary' }}>
              {displayDate}
            </Typography>
            {isPast && (
              <Chip 
                label="Expired" 
                size="small" 
                sx={{ 
                  bgcolor: '#f3f4f6', 
                  color: '#6b7280', 
                  fontWeight: 600, 
                  fontSize: '0.7rem', 
                  height: 22,
                  borderRadius: 1
                }} 
              />
            )}
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {summaryText}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            variant="outlined" 
            size="small"
            onClick={handleToggle}
            sx={{ textTransform: 'none', color: 'text.secondary', borderColor: 'divider', borderRadius: 1.5 }}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : isHidden ? 'View Slots' : 'Hide Slots'}
          </Button>
        </Box>
      </Box>

      {/* Slots Grid */}
      <GeneratedSlots slots={slots || []} isHidden={isHidden} />
    </Paper>
  );
};

export default SlotCard;
