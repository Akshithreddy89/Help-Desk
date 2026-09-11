import React, { useState, useEffect } from 'react';
import { Box, Typography, Autocomplete, TextField } from '@mui/material';
import dayjs, { type Dayjs } from 'dayjs';

interface TimeRangeSelectorProps {
  startTime: Dayjs | null;
  endTime: Dayjs | null;
  onStartTimeChange: (time: Dayjs | null) => void;
  onEndTimeChange: (time: Dayjs | null) => void;
}

// 15-minute intervals (12:00am - 11:45pm)
const TIMES = Array.from({ length: 96 }, (_, i) => {
  const h = Math.floor(i / 4), m = (i % 4) * 15;
  return `${h % 12 || 12}:${m ? m : '00'}${h < 12 ? 'am' : 'pm'}`;
});

// Parses custom typed times (e.g. 9:13am, 17:00, 9am, 9:13)
const parseTime = (val: string, base?: Dayjs | null) => {
  if (!val?.trim()) return null;
  const match = val.trim().toLowerCase().match(/^(\d{1,2})(?:[:.](\d{1,2}))?\s*(am|pm|a|p)?$/i);
  if (!match) return null;
  let h = parseInt(match[1], 10), m = match[2] ? parseInt(match[2], 10) : 0;
  const mod = match[3]?.toLowerCase();
  if (m > 59) return null;
  if (mod) {
    if (h > 12 || h < 1) return null;
    if (mod.startsWith('p') && h !== 12) h += 12;
    if (mod.startsWith('a') && h === 12) h = 0;
  } else if (h > 23 || h < 0) return null;
  return (base || dayjs()).startOf('day').hour(h).minute(m).second(0);
};

const TimeSelect: React.FC<{
  label: string;
  value: Dayjs | null;
  onChange: (time: Dayjs | null) => void;
}> = ({ label, value, onChange }) => {
  const [inputVal, setInputVal] = useState(value ? value.format('h:mma') : '');

  useEffect(() => { setInputVal(value ? value.format('h:mma') : ''); }, [value]);

  const commitTime = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) { onChange(null); setInputVal(''); return; }
    const parsed = parseTime(trimmed, value);
    if (parsed) { onChange(parsed); setInputVal(parsed.format('h:mma')); }
    else { setInputVal(value ? value.format('h:mma') : ''); }
  };

  return (
    <Box sx={{ flex: '1 1 200px' }}>
      <Typography variant="caption" sx={{ mb: 1, display: 'block', color: 'text.secondary' }}>{label}</Typography>
      <Autocomplete
        freeSolo
        openOnFocus
        autoHighlight
        options={TIMES}
        inputValue={inputVal}
        onInputChange={(_, val, reason) => {
          setInputVal(val);
          if (reason === 'clear') { onChange(null); setInputVal(''); }
        }}
        onChange={(_, val) => commitTime(val || '')}
        onBlur={() => commitTime(inputVal)}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="e.g. 9:00am"
            size="small"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                commitTime(inputVal);
              }
            }}
            sx={{
              bgcolor: 'white',
              '& .MuiOutlinedInput-root': {
                height: '40px',
              },
            }}
          />
        )}
      />
    </Box>
  );
};

const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({ startTime, endTime, onStartTimeChange, onEndTimeChange }) => (
  <>
    <TimeSelect label="Start Time" value={startTime} onChange={onStartTimeChange} />
    <TimeSelect label="End Time" value={endTime} onChange={onEndTimeChange} />
  </>
);

export default TimeRangeSelector;
