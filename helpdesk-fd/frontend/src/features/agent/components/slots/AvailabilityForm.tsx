import React from 'react';
import { Box, Paper, Typography, Button, CircularProgress } from '@mui/material';
import type { Dayjs } from 'dayjs';


import DateSelector from './DateSelector';
import TimeRangeSelector from './TimeRangeSelector';
import SlotDurationSelector from './SlotDurationSelector';

interface AvailabilityFormProps {
  selectedDates: Dayjs[];
  setSelectedDates: (dates: Dayjs[]) => void;
  startTime: Dayjs | null;
  setStartTime: (time: Dayjs | null) => void;
  endTime: Dayjs | null;
  setEndTime: (time: Dayjs | null) => void;
  duration: number;
  setDuration: (duration: number) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

const AvailabilityForm: React.FC<AvailabilityFormProps> = ({ 
  selectedDates, setSelectedDates,
  startTime, setStartTime,
  endTime, setEndTime,
  duration, setDuration,
  onGenerate, isLoading 
}) => {
  return (
    <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 2, border: 1, borderColor: 'divider' }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
        Create Availability
      </Typography>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, alignItems: 'flex-end' }}>
        <DateSelector selectedDates={selectedDates} onChange={setSelectedDates} />
        <TimeRangeSelector 
          startTime={startTime} 
          endTime={endTime} 
          onStartTimeChange={setStartTime} 
          onEndTimeChange={setEndTime} 
        />
        <SlotDurationSelector duration={duration} onChange={setDuration} />
      </Box>

      <Box sx={{ mt: 3 }}>
        <Button 
          variant="contained" 
          onClick={onGenerate}
          disabled={isLoading}
          sx={{ 
            bgcolor: 'primary.main', 
            color: 'primary.contrastText', 
            px: 4, 
            py: 1,
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 2,
            '&:hover': { bgcolor: 'primary.dark' }
          }}
        >
          {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Generate Slots'}
        </Button>
      </Box>
    </Paper>
  );
};

export default AvailabilityForm;
