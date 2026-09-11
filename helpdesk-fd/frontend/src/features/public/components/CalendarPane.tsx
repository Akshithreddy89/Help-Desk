import React from 'react';
import { Box, Typography } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { PickerDay,type PickerDayProps } from '@mui/x-date-pickers/PickerDay';
import { DayCalendarSkeleton } from '@mui/x-date-pickers/DayCalendarSkeleton';
import dayjs, { Dayjs } from 'dayjs';
import { Globe } from 'lucide-react';

interface CalendarPaneProps {
  availableDates: string[];
  selectedDate: Dayjs | null;
  onDateSelect: (date: Dayjs) => void;
  isLoading?: boolean;
}

const CustomPickersDay = (
  props: PickerDayProps & { availableDates?: string[] }
) => {
  const { day, availableDates = [], outsideCurrentMonth, ...other } = props;
  
  const dayObj = dayjs(day);
  const formattedDate = dayObj.format('YYYY-MM-DD');
  const isAvailable = availableDates.includes(formattedDate);
  const isPast = dayObj.isBefore(dayjs(), 'day');

  return (
    <Box sx={{ position: 'relative' }}>
      <PickerDay
        {...other}
        outsideCurrentMonth={outsideCurrentMonth}
        day={day}
        disabled={!isAvailable || isPast || outsideCurrentMonth}
        sx={{
          ...(isAvailable && !isPast && !outsideCurrentMonth && {
            color: 'primary.main',
            fontWeight: 'bold',
            bgcolor: 'action.hover',
            '&:hover': {
              bgcolor: 'primary.light',
              color: 'primary.contrastText',
            },
            '&.Mui-selected': {
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
            }
          })
        }}
      />
    </Box>
  );
};

const CalendarPane: React.FC<CalendarPaneProps> = ({ 
  availableDates, 
  selectedDate, 
  onDateSelect,
  isLoading 
}) => {
  return (
    <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
        Select a Date & Time
      </Typography>
      
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DateCalendar
          value={selectedDate}
          onChange={(newDate) => {
            if (newDate) onDateSelect(newDate);
          }}
          loading={isLoading}
          renderLoading={() => <DayCalendarSkeleton />}
          dayOfWeekFormatter={(day) => day.format('ddd')}
          slots={{
            day: CustomPickersDay,
          }}
          slotProps={{
            day: {
              availableDates,
            } as any,
          }}
          sx={{
            width: '100%',
            maxHeight: '400px',
            '& .MuiPickersCalendarHeader-root': {
              paddingLeft: 2,
              paddingRight: 2,
            },
            '& .MuiDayCalendar-weekContainer': {
              justifyContent: 'space-between',
              margin: '2px 0',
            },
            '& .MuiDayCalendar-header': {
              justifyContent: 'space-between',
            }
          }}
        />
      </LocalizationProvider>
      
      <Box sx={{ mt: 'auto', pt: 4 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold', mb: 1, display: 'block' }}>
          Time zone
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', gap: 1 }}>
          <Globe size={16} />
          <Typography variant="body2">
            {Intl.DateTimeFormat().resolvedOptions().timeZone} ({dayjs().format('h:mma')})
          </Typography>
        </Box>
        

      </Box>
    </Box>
  );
};

export default CalendarPane;
