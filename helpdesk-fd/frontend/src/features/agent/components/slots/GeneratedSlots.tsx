import React from 'react';
import { Box, Typography, Collapse } from '@mui/material';
import dayjs from 'dayjs';
import type { SlotResponse } from '../../services/availability.service';

interface GeneratedSlotsProps {
  slots: SlotResponse[];
  isHidden: boolean;
}

const getSlotStatusConfig = (status?: string) => {
  const normStatus = (status || 'Available').toUpperCase();
  switch (normStatus) {
    case 'BOOKED':
      return {
        label: 'BOOKED',
        border: '#bfdbfe',
        bg: '#eff6ff',
        timeColor: '#f20606ff',
        badgeColor: '#f20606ff',
      };
    case 'HELD':
      return {
        label: 'HELD',
        border: '#fde68a',
        bg: '#fffbeb',
        timeColor: '#92400e',
        badgeColor: '#d97706',
      };
    case 'EXPIRED':
      return {
        label: 'EXPIRED',
        border: '#e5e7eb',
        bg: '#f9fafb',
        timeColor: '#6b7280',
        badgeColor: '#9ca3af',
      };
    case 'AVAILABLE':
    default:
      return {
        label: 'AVAILABLE',
        border: '#a7f3d0',
        bg: '#ecfdf5',
        timeColor: '#065f46',
        badgeColor: '#059669',
      };
  }
};

const GeneratedSlots: React.FC<GeneratedSlotsProps> = ({ slots, isHidden }) => {
  return (
    <Collapse in={!isHidden}>
      <Box sx={{ p: 3, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {slots.length === 0 && <Typography variant="body2" color="text.secondary">No slots generated.</Typography>}
        {slots.map(slot => {
          const config = getSlotStatusConfig(slot.status);
          return (
            <Box 
              key={slot.id} 
              sx={{ 
                px: 3, 
                py: 1, 
                border: `1px solid ${config.border}`, 
                borderRadius: 1.5,
                bgcolor: config.bg,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: 120
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600, color: config.timeColor }}>
                {dayjs(slot.start_datetime).format('h:mm A')}
              </Typography>
              <Typography variant="caption" sx={{ color: config.badgeColor, fontWeight: 600, fontSize: '0.65rem', mt: 0.25, letterSpacing: '0.025em' }}>
                {config.label}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Collapse>
  );
};

export default GeneratedSlots;
