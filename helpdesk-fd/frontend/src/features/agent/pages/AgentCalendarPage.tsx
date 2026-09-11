import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Box, Typography, Paper, IconButton, Button, Popover, ButtonGroup } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { ChevronLeft, ChevronRight, KeyboardArrowDown } from '@mui/icons-material';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import dayjs, { Dayjs } from 'dayjs';

import AgentLayout from '../components/AgentLayout';
import BookingDetailsPanel from '../components/BookingDetailsPanel';
import { fetchCalendarBookings } from '../services/calendar.service';
import type { CalendarBookingResponse } from '../services/calendar.service';
import { useToast } from '../../../context/ToastContext';
import LoadingOverlay from '../../../components/loader/LoadingOverlay';
import './AgentCalendar.css';

export interface MeetingBooking {
  id: string;
  agentId: string;
  slot_id?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  bookingDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm (24h format)
  endTime: string; // HH:mm
  meetingType: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  bookingRef: string;
}

import { useTheme } from '@mui/material/styles';

const AgentCalendarPage: React.FC = () => {
  const theme = useTheme();
  const primaryColor = theme.palette.primary.main;

  const { showToast } = useToast();
  const [selectedBooking, setSelectedBooking] = useState<MeetingBooking | null>(null);
  const [currentDate, setCurrentDate] = useState<Dayjs>(dayjs());
  const [calendarTitle, setCalendarTitle] = useState<string>('');
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [bookings, setBookings] = useState<MeetingBooking[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const calendarRef = useRef<any>(null);

  const popoverOpen = Boolean(anchorEl);

  // Ensure FullCalendar resizes correctly when the side panel opens or closes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (calendarRef.current) {
        calendarRef.current.getApi().updateSize();
      }
    }, 300); // Matches the 0.3s CSS transition duration
    return () => clearTimeout(timer);
  }, [selectedBooking]);

  // Map fetched bookings to FullCalendar events
  const events = useMemo(() => bookings.map(b => ({
    id: b.id,
    title: b.customerName,
    start: `${b.bookingDate}T${b.startTime}:00`,
    end: `${b.bookingDate}T${b.endTime}:00`,
    extendedProps: { booking: b }
  })), [bookings]);

  const handleEventClick = (clickInfo: any) => {
    const booking = clickInfo.event.extendedProps.booking as MeetingBooking;
    setSelectedBooking(booking);
  };

  const handleDateCalendarChange = (newValue: Dayjs | null) => {
    if (newValue) {
      setCurrentDate(newValue);
      const calendarApi = calendarRef.current?.getApi();
      if (calendarApi) {
        calendarApi.gotoDate(newValue.toDate());
      }
      setAnchorEl(null);
    }
  };

  const renderEventContent = (eventInfo: any) => {
    const timeStr = dayjs(eventInfo.event.start).format('h:mm A');
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 0.75, 
        px: 0.5, 
        py: 0.25, 
        overflow: 'hidden',
        height: '100%',
        width: '100%'
      }}>
        <Typography variant="caption" sx={{ fontWeight: 'bold', whiteSpace: 'nowrap', lineHeight: 1.2, color: '#ffffff', fontSize: '0.75rem', flexShrink: 0 }}>
          {timeStr}
        </Typography>
        <Typography variant="caption" sx={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', lineHeight: 1.2, color: '#e0e0e0', fontSize: '0.75rem' }}>
          {eventInfo.event.title}
        </Typography>
      </Box>
    );
  };

  const renderDayCellContent = (args: any) => {
    const dateStr = dayjs(args.date).format('YYYY-MM-DD');
    const bookingsForDay = bookings.filter(b => b.bookingDate === dateStr);
    
    return (
      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', px: 1, alignItems: 'center' }}>
        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{args.dayNumberText}</Typography>
        {bookingsForDay.length > 0 && (
          <Box sx={{ 
            bgcolor: 'primary.main', 
            color: 'white', 
            borderRadius: '50%', 
            width: 22, 
            height: 22, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontSize: '0.75rem',
            fontWeight: 'bold'
          }}>
            {bookingsForDay.length}
          </Box>
        )}
      </Box>
    );
  };

  const handleDatesSet = async (arg: any) => {
    setCalendarTitle(arg.view.title);
    const start = dayjs(arg.start);
    const end = dayjs(arg.end);
    if (currentDate.isBefore(start) || currentDate.isAfter(end)) {
       setCurrentDate(dayjs(arg.view.currentStart));
    }
    
    // Fetch bookings for the current view
    const startDateStr = start.format('YYYY-MM-DD');
    const endDateStr = end.format('YYYY-MM-DD');
    
    setIsLoading(true);
    try {
      const data = await fetchCalendarBookings(startDateStr, endDateStr);
      const mappedBookings: MeetingBooking[] = data.map((b: CalendarBookingResponse) => ({
        id: b.id,
        agentId: b.agent_id,
        customerName: b.customer_name,
        customerEmail: b.customer_email,
        customerPhone: b.customer_phone,
        bookingDate: b.meeting_date,
        startTime: b.start_time.substring(0, 5),
        endTime: b.end_time.substring(0, 5),
        meetingType: 'Virtual', // Default type
        status: b.status.toLowerCase() as any,
        bookingRef: b.booking_reference,
      }));
      setBookings(mappedBookings);
    } catch (err: any) {
      console.error('Failed to fetch bookings', err);
      showToast('Failed to load calendar events. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const calendarApi = () => calendarRef.current?.getApi();

  return (
    <AgentLayout>
      <Box sx={{ display: 'flex', height: '100%', width: '100%', overflow: 'hidden' }}>
        {/* Main Calendar Area */}
        <Box sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          overflow: 'hidden',
          bgcolor: '#f4f5f7'
        }}>
          {/* FullCalendar Wrapper */}
          <Box sx={{ 
            width: selectedBooking ? '70%' : '100%', 
            transition: 'width 0.3s ease',
            height: '100%',
            p: { xs: 2, md: 3 },
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column'
          }}>
            
            {/* Custom Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Button 
                  variant="outlined" 
                  color="inherit" 
                  onClick={() => calendarApi()?.today()} 
                  sx={{ textTransform: 'none', borderColor: '#e0e0e0', bgcolor: 'white' }}
                >
                  Today
                </Button>
                <Box>
                  <IconButton onClick={() => calendarApi()?.prev()} size="small"><ChevronLeft /></IconButton>
                  <IconButton onClick={() => calendarApi()?.next()} size="small"><ChevronRight /></IconButton>
                </Box>
                <Button 
                  variant="text" 
                  color="inherit" 
                  onClick={(e) => setAnchorEl(e.currentTarget)} 
                  endIcon={<KeyboardArrowDown />}
                  sx={{ fontSize: '1.25rem', fontWeight: 'bold', textTransform: 'none', color: 'primary.main' }}
                >
                  {calendarTitle}
                </Button>
                <Popover
                  open={popoverOpen}
                  anchorEl={anchorEl}
                  onClose={() => setAnchorEl(null)}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                >
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DateCalendar 
                      value={currentDate} 
                      onChange={handleDateCalendarChange}
                    />
                  </LocalizationProvider>
                </Popover>
              </Box>
              <ButtonGroup variant="outlined" size="small" color="inherit" sx={{ bgcolor: 'white' }}>
                 <Button onClick={() => calendarApi()?.changeView('dayGridMonth')}>Month</Button>
                 <Button onClick={() => calendarApi()?.changeView('timeGridWeek')}>Week</Button>
                 <Button onClick={() => calendarApi()?.changeView('timeGridDay')}>Day</Button>
              </ButtonGroup>
            </Box>

            <Paper elevation={0} sx={{ 
              p: 2, 
              borderRadius: 2, 
              border: '1px solid #e0e0e0', 
              flexGrow: 1,
              minHeight: 600,
              bgcolor: 'white',
              position: 'relative',
              '& .fc': { height: '100%' },
              '& .fc-timegrid-event': {
                borderRadius: '4px !important',
                cursor: 'pointer',
              },
              '& .fc-timegrid-event .fc-event-main': {
                padding: '2px 4px !important',
                display: 'flex !important',
                alignItems: 'center !important',
                overflow: 'hidden !important',
              }
            }}>
              <LoadingOverlay isLoading={isLoading} />
              <FullCalendar
                ref={calendarRef}
                // @ts-ignore
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                events={events}
                eventClick={handleEventClick}
                eventContent={renderEventContent}
                dayCellContent={renderDayCellContent}
                dayMaxEvents={2} // Show '+X more' if more than 2 events
                headerToolbar={false} // Disable native header
                eventDisplay="block" // Render events as solid blocks rather than dots
                eventColor={primaryColor} // Dynamic bg
                eventTextColor="#ffffff" // White text
                eventBorderColor={primaryColor} // Dynamic border
                datesSet={handleDatesSet}
              />
            </Paper>
          </Box>

          {/* Right Panel - Booking Details */}
          {selectedBooking && (
            <Box sx={{ 
              width: '30%', 
              flexShrink: 0,
              transition: 'width 0.3s ease',
              borderLeft: '1px solid #e0e0e0',
              bgcolor: 'white'
            }}>
              <BookingDetailsPanel 
                booking={selectedBooking} 
                onClose={() => setSelectedBooking(null)} 
              />
            </Box>
          )}
        </Box>
      </Box>
    </AgentLayout>
  );
};

export default AgentCalendarPage;
