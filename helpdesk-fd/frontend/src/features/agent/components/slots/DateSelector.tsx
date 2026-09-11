import React, { useState } from 'react';
import { Box, Typography, Button, Popover } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar, PickerDay, type PickerDayProps } from '@mui/x-date-pickers';
import { CalendarToday } from '@mui/icons-material';
import dayjs, { type Dayjs } from 'dayjs';

interface DateSelectorProps {
  selectedDates: Dayjs[];
  onChange: (dates: Dayjs[]) => void;
}

const CustomDay = (props: PickerDayProps & { selectedDays?: Dayjs[] }) => {
  const { day, selectedDays, ...other } = props;
  const isSelected = selectedDays?.some(d => d.isSame(dayjs(day as any), 'day'));

  return (
    <PickerDay
      {...other}
      day={day}
      selected={isSelected}
      sx={isSelected ? {
        backgroundColor: (theme) => theme.palette.primary.main + ' !important',
        color: 'white !important',
        '&:hover, &:focus': {
          backgroundColor: (theme) => theme.palette.primary.dark + ' !important',
        }
      } : {}}
    />
  );
};

const DateSelector: React.FC<DateSelectorProps> = ({ selectedDates, onChange }) => {
  const [datePopoverAnchor, setDatePopoverAnchor] = useState<HTMLElement | null>(null);

  const handleDateChange = (date: Dayjs | null) => {
    if (!date) return;
    const isSelected = selectedDates.some(d => d.isSame(date, 'day'));
    if (isSelected) {
      onChange(selectedDates.filter(d => !d.isSame(date, 'day')));
    } else {
      onChange([...selectedDates, date]);
    }
  };

  const getDatesDisplayString = () => {
    if (selectedDates.length === 0) return "Select dates";
    if (selectedDates.length === 1) return selectedDates[0].format('MM/DD/YYYY');
    return `${selectedDates.length} dates selected`;
  };

  return (
    <Box sx={{ flex: '1 1 200px' }}>
      <Typography variant="caption" sx={{ mb: 1, display: 'block', color: 'text.secondary' }}>Date</Typography>
      <Button
        variant="outlined"
        fullWidth
        onClick={(e) => setDatePopoverAnchor(e.currentTarget)}
        endIcon={<CalendarToday fontSize="small" />}
        sx={{ 
          justifyContent: 'space-between', 
          color: selectedDates.length ? 'text.primary' : 'text.secondary',
          borderColor: '#c4c4c4',
          height: '40px',
          textTransform: 'none',
          fontWeight: 'normal',
          bgcolor: 'white',
          '&:hover': {
            borderColor: 'text.primary',
            backgroundColor: 'white'
          }
        }}
      >
        {getDatesDisplayString()}
      </Button>
      <Popover
        open={Boolean(datePopoverAnchor)}
        anchorEl={datePopoverAnchor}
        onClose={() => setDatePopoverAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateCalendar
            value={null}
            onChange={handleDateChange}
            slots={{ day: CustomDay }}
            slotProps={{
              day: { selectedDays: selectedDates } as any,
            }}
          />
        </LocalizationProvider>
      </Popover>
    </Box>
  );
};

export default DateSelector;
