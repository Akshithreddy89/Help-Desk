import React from 'react';
import { Chip, type ChipProps } from '@mui/material';
import { getStatusColor } from '../utils/ticketHelpers';

interface StatusChipProps extends Omit<ChipProps, 'color'> {
  status: string;
}

const StatusChip: React.FC<StatusChipProps> = ({ status, size = 'small', sx, ...props }) => {
  const color = getStatusColor(status);

  return (
    <Chip
      label={status}
      size={size}
      sx={{
        bgcolor: `${color}15`,
        color: color,
        fontWeight: 600,
        borderRadius: 1.5,
        border: `1px solid ${color}40`,
        ...sx,
      }}
      {...props}
    />
  );
};

export default StatusChip;
