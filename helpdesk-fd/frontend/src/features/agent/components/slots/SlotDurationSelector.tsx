import React from 'react';
import { Box, Typography, FormControl, Select, MenuItem } from '@mui/material';

interface SlotDurationSelectorProps {
  duration: number;
  onChange: (duration: number) => void;
}

const SlotDurationSelector: React.FC<SlotDurationSelectorProps> = ({ duration, onChange }) => {
  return (
    <Box sx={{ flex: '1 1 200px' }}>
      <Typography variant="caption" sx={{ mb: 1, display: 'block', color: 'text.secondary' }}>Meeting Duration</Typography>
      <FormControl fullWidth size="small">
        <Select
          value={duration}
          onChange={(e) => onChange(Number(e.target.value))}
          sx={{ bgcolor: 'white', height: '40px' }}
        >
          <MenuItem value={15}>15 minutes</MenuItem>
          <MenuItem value={30}>30 minutes</MenuItem>
          <MenuItem value={45}>45 minutes</MenuItem>
          <MenuItem value={60}>60 minutes</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

export default SlotDurationSelector;
