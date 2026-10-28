import React, { useState } from 'react';
import { Box, IconButton, TextField, Tooltip } from '@mui/material';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';

interface ChatComposerProps {
  placeholder: string;
  disabled?: boolean;
  onSend: (value: string) => void;
  onBack?: () => void;
  showBack?: boolean;
}

const ChatComposer: React.FC<ChatComposerProps> = ({
  placeholder,
  disabled,
  onSend,
  onBack,
  showBack = false,
}) => {
  const [value, setValue] = useState('');

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
  };

  return (
    <Box
      sx={{
        px: 2,
        py: 1.5,
        borderTop: '1px solid #eaedf1',
        bgcolor: '#ffffff',
        flexShrink: 0,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
        {/* Back button */}
        {showBack && onBack && (
          <Tooltip title="Back to main menu" placement="top">
            <IconButton
              onClick={onBack}
              size="small"
              aria-label="Back to main menu"
              sx={{
                mb: 0.25,
                color: '#475569',
                bgcolor: '#f1f5f9',
                border: '1px solid #e2e8f0',
                borderRadius: 2,
                width: 38,
                height: 38,
                flexShrink: 0,
                transition: 'all 0.15s ease',
                '&:hover': {
                  color: '#0f172a',
                  bgcolor: '#e2e8f0',
                  borderColor: '#cbd5e1',
                },
              }}
            >
              <ArrowBackRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}

        {/* Input */}
        <TextField
          fullWidth
          multiline
          maxRows={4}
          size="small"
          placeholder={placeholder}
          value={value}
          disabled={disabled}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2.5,
              bgcolor: '#f8fafc',
              fontSize: '0.85rem',
              color: '#0f172a',
              '& fieldset': { borderColor: '#e2e8f0' },
              '&:hover fieldset': { borderColor: '#cbd5e1' },
              '&.Mui-focused fieldset': { borderColor: 'primary.main', borderWidth: 1.5 },
              '&.Mui-disabled': { opacity: 0.5, bgcolor: '#f1f5f9' },
            },
            '& .MuiOutlinedInput-input': {
              color: '#0f172a',
              '&::placeholder': { color: '#94a3b8', opacity: 1 },
            },
          }}
        />

        {/* Send button */}
        <IconButton
          onClick={submit}
          disabled={disabled || !value.trim()}
          sx={{
            mb: 0.25,
            width: 38,
            height: 38,
            borderRadius: 2,
            flexShrink: 0,
            bgcolor: disabled || !value.trim() ? '#f1f5f9' : 'primary.main',
            color: disabled || !value.trim() ? '#94a3b8' : '#ffffff',
            transition: 'all 0.15s ease',
            boxShadow: !disabled && value.trim() ? '0 2px 8px rgba(25,118,210,0.25)' : 'none',
            '&:hover:not(:disabled)': {
              boxShadow: '0 4px 12px rgba(25,118,210,0.35)',
              transform: 'scale(1.04)',
              bgcolor: 'primary.main',
              opacity: 0.95,
            },
            '&.Mui-disabled': { bgcolor: '#f1f5f9', color: '#cbd5e1' },
          }}
        >
          <SendRoundedIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      {/* Footer note */}
      <Box sx={{ textAlign: 'center', mt: 1 }}>
        <Box
          component="span"
          sx={{ fontSize: '0.68rem', color: '#94a3b8', letterSpacing: 0.2 }}
        >
          Powered by Gemini · Responses may not always be accurate
        </Box>
      </Box>
    </Box>
  );
};

export default ChatComposer;
