import React from 'react';
import { Box, Typography, type TypographyProps } from '@mui/material';
import { getPriorityColor } from '../utils/ticketHelpers';

interface PriorityChipProps {
  priority: string;
  variant?: 'dot' | 'textOnly';
  textProps?: TypographyProps;
}

const PriorityChip: React.FC<PriorityChipProps> = ({ 
  priority, 
  variant = 'dot',
  textProps 
}) => {
  const color = getPriorityColor(priority);

  if (variant === 'textOnly') {
    return (
      <Typography variant="body2" sx={{ color: color, fontWeight: 600, fontSize: '0.8rem', ...textProps?.sx }} {...textProps}>
        {priority} Priority
      </Typography>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color }} />
      <Typography variant="body2" sx={{ fontWeight: 500, ...textProps?.sx }} {...textProps}>
        {priority}
      </Typography>
    </Box>
  );
};

export default PriorityChip;
