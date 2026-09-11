import React, { useState } from 'react';
import { Box, Typography, Button, Fade } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import { type PublicSlot } from '../services/publicSchedule.service';

interface SlotsPaneProps {
  selectedDate: Dayjs;
  slots: PublicSlot[];
  onSlotSelect?: (slot: PublicSlot) => void;
  isLoading?: boolean;
}

const SlotsPane: React.FC<SlotsPaneProps> = ({ selectedDate, slots, onSlotSelect, isLoading }) => {
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  const handleSlotClick = (slot: PublicSlot) => {
    setSelectedSlotId(slot.id);
  };

  const handleNextClick = (slot: PublicSlot) => {
    if (onSlotSelect) {
      onSlotSelect(slot);
    }
  };

  return (
    <Box sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="body1" sx={{ mb: 3 }}>
        {selectedDate.format('dddd, MMMM D')}
      </Typography>

      <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {isLoading ? (
          <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
            Loading slots...
          </Typography>
        ) : slots.length === 0 ? (
          <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
            No times available
          </Typography>
        ) : (
          slots.map((slot) => {
            const isSelected = selectedSlotId === slot.id;
            const timeString = dayjs(slot.start_datetime).format('h:mma');

            return (
              <Box key={slot.id} sx={{ display: 'flex', width: '100%', gap: 1 }}>
                <Button
                  variant={isSelected ? 'contained' : 'outlined'}
                  onClick={() => handleSlotClick(slot)}
                  sx={{
                    flexGrow: isSelected ? 0.5 : 1,
                    py: 1.5,
                    bgcolor: isSelected ? 'action.disabledBackground' : 'transparent',
                    color: isSelected ? 'text.primary' : 'primary.main',
                    borderColor: isSelected ? 'transparent' : 'primary.main',
                    fontWeight: 'bold',
                    '&:hover': {
                      borderWidth: 2,
                      borderColor: 'primary.main',
                    }
                  }}
                >
                  {timeString}
                </Button>
                
                {isSelected && (
                  <Fade in={isSelected}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleNextClick(slot)}
                      sx={{
                        flexGrow: 1,
                        py: 1.5,
                        fontWeight: 'bold',
                        boxShadow: 2
                      }}
                    >
                      Next
                    </Button>
                  </Fade>
                )}
              </Box>
            );
          })
        )}
      </Box>
    </Box>
  );
};

export default SlotsPane;
