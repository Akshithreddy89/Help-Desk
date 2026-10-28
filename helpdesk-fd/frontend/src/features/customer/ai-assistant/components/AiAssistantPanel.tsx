import React from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import { COMPOSER_PLACEHOLDER } from '../constants';
import { useAiAssistant } from '../hooks/useAiAssistant';
import ChatComposer from './ChatComposer';
import ChatMessageList from './ChatMessageList';

interface AiAssistantPanelProps {
  onClose: () => void; // Closes the panel and returns the dashboard to full width
}

const AiAssistantPanel: React.FC<AiAssistantPanelProps> = ({ onClose }) => {
  const {
    flow,
    messages,
    isLoading,
    composerEnabled,
    startOver,
    selectIntent,
    lookupTicket,
    askFaq,
    submitDraft,
    sendComposerMessage,
  } = useAiAssistant();

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        bgcolor: '#ffffff',
      }}
    >
      {/* ── Premium Light Header ── */}
      <Box
        sx={{
          flexShrink: 0,
          bgcolor: '#ffffff',
          borderBottom: '1px solid #eaedf1',
          px: 2.5,
          pt: 2.25,
          pb: 2,
          position: 'relative',
        }}
      >
        {/* Subtle accent bar at top */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: 'linear-gradient(90deg, #1976d2, #38bdf8, #6366f1)',
          }}
        />

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Avatar + Info */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/* AI Avatar */}
            <Box
              sx={{
                position: 'relative',
                width: 42,
                height: 42,
                borderRadius: 2.5,
                bgcolor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(25,118,210,0.2)',
                flexShrink: 0,
              }}
            >
              <AutoAwesomeIcon sx={{ color: '#fff', fontSize: 20 }} />
              {/* Online dot */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -1,
                  right: -1,
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  bgcolor: '#10b981',
                  border: '2px solid #ffffff',
                }}
              />
            </Box>

            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    color: '#0f172a',
                    letterSpacing: 0.2,
                  }}
                >
                  HelpDesk AI
                </Typography>
                <Box
                  sx={{
                    px: 0.8,
                    py: 0.15,
                    borderRadius: 1,
                    bgcolor: 'rgba(25,118,210,0.08)',
                    border: '1px solid rgba(25,118,210,0.2)',
                    fontSize: '0.62rem',
                    letterSpacing: 0.5,
                    fontWeight: 800,
                    color: 'primary.main',
                  }}
                >
                  AI
                </Box>
              </Box>
              <Typography
                variant="caption"
                sx={{ color: '#64748b', fontSize: '0.73rem', display: 'flex', alignItems: 'center', gap: 0.6, mt: 0.2 }}
              >
                <Box
                  component="span"
                  sx={{
                    display: 'inline-block',
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: '#10b981',
                  }}
                />
                Always online - 24/7 AI Assistant
              </Typography>
            </Box>
          </Box>

          {/* Header actions */}
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <IconButton
              onClick={startOver}
              size="small"
              title="Start over"
              sx={{
                color: '#64748b',
                borderRadius: 1.5,
                '&:hover': { color: 'primary.main', bgcolor: '#f1f5f9' },
              }}
            >
              <RefreshRoundedIcon sx={{ fontSize: 19 }} />
            </IconButton>
            <IconButton
              onClick={onClose}
              size="small"
              aria-label="Close"
              sx={{
                color: '#64748b',
                borderRadius: 1.5,
                '&:hover': { color: '#ef4444', bgcolor: 'rgba(239,68,68,0.08)' },
              }}
            >
              <CloseIcon sx={{ fontSize: 19 }} />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* ── Chat Body ── */}
      <ChatMessageList
        messages={messages}
        isLoading={isLoading}
        onSelectIntent={selectIntent}
        onLookupTicket={lookupTicket}
        onAskFaq={askFaq}
        onConfirmDraft={submitDraft}
      />

      {/* ── Composer ── */}
      <ChatComposer
        placeholder={COMPOSER_PLACEHOLDER[flow]}
        disabled={!composerEnabled}
        onSend={sendComposerMessage}
        onBack={startOver}
        showBack={flow !== 'menu'}
      />
    </Box>
  );
};

export default AiAssistantPanel;
