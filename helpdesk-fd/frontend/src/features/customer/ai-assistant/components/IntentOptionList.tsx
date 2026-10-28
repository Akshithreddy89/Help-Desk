import React, { memo } from 'react';
import { Box, Typography } from '@mui/material';
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import HelpOutlineIcon from '@mui/icons-material/HelpOutlineOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutlined';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { INTENT_OPTIONS } from '../constants';
import type { AssistantFlow } from '../types';

const INTENT_META: Record<
  string,
  { icon: React.ReactNode; border: string; hoverBorder: string; iconBg: string; activeColor: string }
> = {
  ticket_status: {
    icon: <ConfirmationNumberOutlinedIcon sx={{ fontSize: 20, color: '#1976d2' }} />,
    border: '#e2e8f0',
    hoverBorder: '#93c5fd',
    iconBg: '#eff6ff',
    activeColor: '#1976d2',
  },
  faq: {
    icon: <HelpOutlineIcon sx={{ fontSize: 20, color: '#059669' }} />,
    border: '#e2e8f0',
    hoverBorder: '#6ee7b7',
    iconBg: '#ecfdf5',
    activeColor: '#059669',
  },
  raise_ticket: {
    icon: <AddCircleOutlineIcon sx={{ fontSize: 20, color: '#d97706' }} />,
    border: '#e2e8f0',
    hoverBorder: '#fcd34d',
    iconBg: '#fffbeb',
    activeColor: '#d97706',
  },
};

interface IntentOptionListProps {
  onSelect: (intent: AssistantFlow) => void;
  disabled?: boolean;
}

const IntentOptionList: React.FC<IntentOptionListProps> = ({ onSelect, disabled }) => (
  <Box>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
      <Typography
        sx={{
          fontWeight: 700,
          fontSize: '0.9rem',
          color: '#0f172a',
          letterSpacing: 0.1,
        }}
      >
        How can I help you?
      </Typography>
    </Box>
    <Typography
      variant="caption"
      sx={{ display: 'block', color: '#64748b', mb: 1.5, fontSize: '0.75rem' }}
    >
      Select an option to get started instantly.
    </Typography>

    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {INTENT_OPTIONS.map((option) => {
        const meta = INTENT_META[option.id];
        return (
          <Box
            key={option.id}
            component="button"
            disabled={disabled}
            onClick={() => onSelect(option.id)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              width: '100%',
              textAlign: 'left',
              cursor: disabled ? 'default' : 'pointer',
              bgcolor: '#ffffff',
              border: `1px solid ${meta.border}`,
              borderRadius: 2.5,
              px: 1.75,
              py: 1.25,
              font: 'inherit',
              transition: 'all 0.18s ease',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
              '&:hover:not(:disabled)': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 14px rgba(0,0,0,0.06)',
                borderColor: meta.hoverBorder,
                bgcolor: '#fafbfc',
                '& .intent-arrow': {
                  color: meta.activeColor,
                  transform: 'translateX(3px)',
                },
              },
              '&:disabled': { opacity: 0.5, cursor: 'default' },
            }}
          >
            {/* Icon bubble */}
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 2,
                bgcolor: meta.iconBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {meta.icon}
            </Box>

            {/* Text */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                sx={{ fontWeight: 600, fontSize: '0.85rem', color: '#0f172a', lineHeight: 1.3 }}
              >
                {option.title}
              </Typography>
              <Typography sx={{ fontSize: '0.73rem', color: '#64748b', mt: 0.2 }}>
                {option.subtitle}
              </Typography>
            </Box>

            <ArrowForwardRoundedIcon
              className="intent-arrow"
              sx={{
                fontSize: 17,
                color: '#94a3b8',
                flexShrink: 0,
                transition: 'all 0.18s ease',
              }}
            />
          </Box>
        );
      })}
    </Box>
  </Box>
);

export default memo(IntentOptionList);
