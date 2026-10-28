import React, { memo, useState } from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import RocketLaunchRoundedIcon from '@mui/icons-material/RocketLaunchRounded';
import { TICKET_CATEGORIES, TICKET_PRIORITIES } from '../constants';
import type { TicketDraft } from '../types';

interface TicketDraftCardProps {
  draft: TicketDraft;
  disabled?: boolean;
  onConfirm: (draft: TicketDraft) => void;
}

const PRIORITY_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  High:   { bg: '#fef2f2', border: '#fecaca', text: '#dc2626' },
  Medium: { bg: '#fffbeb', border: '#fde68a', text: '#d97706' },
  Low:    { bg: '#f0fdf4', border: '#bbf7d0', text: '#16a34a' },
};

const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  Technical: { bg: '#eff6ff', border: '#bfdbfe', text: '#1976d2' },
  General:   { bg: '#f8fafc', border: '#cbd5e1', text: '#475569' },
  Billing:   { bg: '#f0fdf4', border: '#bbf7d0', text: '#16a34a' },
  Account:   { bg: '#faf5ff', border: '#e9d5ff', text: '#7e22ce' },
};

function ChipRow({
  label,
  options,
  value,
  colorMap,
  onChange,
}: {
  label: string;
  options: readonly string[];
  value: string;
  colorMap: Record<string, { bg: string; border: string; text: string }>;
  onChange: (next: string) => void;
}) {
  return (
    <Box>
      <Typography
        variant="caption"
        sx={{ fontWeight: 700, color: '#64748b', letterSpacing: 0.5, fontSize: '0.68rem', textTransform: 'uppercase' }}
      >
        {label}
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 0.6 }}>
        {options.map((opt) => {
          const selected = opt === value;
          const c = colorMap[opt] ?? { bg: '#eff6ff', border: '#bfdbfe', text: '#1976d2' };
          return (
            <Box
              key={opt}
              component="button"
              type="button"
              onClick={() => onChange(opt)}
              sx={{
                border: `1px solid ${selected ? c.border : '#e2e8f0'}`,
                bgcolor: selected ? c.bg : '#ffffff',
                color: selected ? c.text : '#64748b',
                borderRadius: 5,
                px: 1.3,
                py: 0.45,
                fontSize: '0.72rem',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
                boxShadow: selected ? '0 1px 3px rgba(0,0,0,0.04)' : 'none',
                transition: 'all 0.15s ease',
                '&:hover': {
                  borderColor: c.border,
                  bgcolor: selected ? c.bg : '#f8fafc',
                  color: c.text,
                },
              }}
            >
              {opt}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

const TicketDraftCard: React.FC<TicketDraftCardProps> = ({ draft, disabled, onConfirm }) => {
  const [form, setForm] = useState<TicketDraft>(draft);
  const valid =
    form.subject.trim() &&
    form.description.trim().length >= 10 &&
    form.category &&
    form.priority;

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      bgcolor: '#f8fafc',
      borderRadius: 2,
      fontSize: '0.82rem',
      color: '#0f172a',
      '& fieldset': { borderColor: '#e2e8f0' },
      '&:hover fieldset': { borderColor: '#cbd5e1' },
      '&.Mui-focused fieldset': { borderColor: 'primary.main', borderWidth: 1.5 },
    },
    '& .MuiInputLabel-root': { color: '#64748b', fontSize: '0.8rem' },
    '& .MuiInputLabel-root.Mui-focused': { color: 'primary.main' },
    '& .MuiOutlinedInput-input': {
      color: '#0f172a',
      '&::placeholder': { color: '#94a3b8', opacity: 1 },
    },
  };

  return (
    <Box
      sx={{
        mt: 1.5,
        p: 1.75,
        bgcolor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 2.5,
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
      }}
    >
      {/* Draft header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
        <EditNoteRoundedIcon sx={{ fontSize: 20, color: 'primary.main' }} />
        <Typography sx={{ fontWeight: 700, fontSize: '0.84rem', color: '#0f172a' }}>
          Review your ticket draft
        </Typography>
      </Box>

      {/* Subject */}
      <TextField
        size="small"
        label="Subject"
        value={form.subject}
        onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
        slotProps={{ htmlInput: { maxLength: 255 } }}
        sx={inputSx}
      />

      {/* Category chips */}
      <ChipRow
        label="Category"
        options={TICKET_CATEGORIES}
        value={form.category}
        colorMap={CATEGORY_COLORS}
        onChange={(category) => setForm((prev) => ({ ...prev, category }))}
      />

      {/* Priority chips */}
      <ChipRow
        label="Priority"
        options={TICKET_PRIORITIES}
        value={form.priority}
        colorMap={PRIORITY_COLORS}
        onChange={(priority) => setForm((prev) => ({ ...prev, priority }))}
      />

      {/* Description */}
      <TextField
        size="small"
        label="Description"
        multiline
        minRows={3}
        value={form.description}
        onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
        sx={inputSx}
      />

      {/* Submit */}
      <Button
        variant="contained"
        disabled={disabled || !valid}
        onClick={() => onConfirm(form)}
        startIcon={<RocketLaunchRoundedIcon sx={{ fontSize: '16px !important' }} />}
        sx={{
          alignSelf: 'stretch',
          borderRadius: 2,
          textTransform: 'none',
          fontWeight: 700,
          fontSize: '0.84rem',
          bgcolor: 'primary.main',
          color: '#ffffff',
          boxShadow: valid && !disabled ? '0 4px 12px rgba(25,118,210,0.25)' : 'none',
          '&:hover': {
            bgcolor: 'primary.main',
            opacity: 0.95,
            boxShadow: '0 6px 16px rgba(25,118,210,0.35)',
          },
          '&.Mui-disabled': { bgcolor: '#f1f5f9', color: '#cbd5e1', border: '1px solid #e2e8f0' },
        }}
      >
        Confirm & Raise Ticket
      </Button>
    </Box>
  );
};

export default memo(TicketDraftCard);
