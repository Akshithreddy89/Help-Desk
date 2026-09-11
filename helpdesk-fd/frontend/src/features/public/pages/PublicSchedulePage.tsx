import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Paper, Typography, Divider, useTheme, useMediaQuery } from '@mui/material';
import  { Dayjs } from 'dayjs';
import { useToast } from '../../../context/ToastContext';
import { getPublicSchedule, holdSlot, bookSlot, type PublicScheduleResponse, type PublicSlot, type HoldSession } from '../services/publicSchedule.service';
import AgentInfoPane from '../components/AgentInfoPane';
import CalendarPane from '../components/CalendarPane';
import SlotsPane from '../components/SlotsPane';
import BookingFormPane from '../components/BookingFormPane';
import BookingSuccessPane from '../components/BookingSuccessPane';
import FullScreenLoader from '../../../components/loader/FullScreenLoader';

const PublicSchedulePage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const { showToast } = useToast();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [isLoading, setIsLoading] = useState(true);
  const [scheduleData, setScheduleData] = useState<PublicScheduleResponse | null>(null);
  
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [isSlotsLoading, setIsSlotsLoading] = useState(false);

  const [heldSession, setHeldSession] = useState<HoldSession | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<PublicSlot | null>(null);
  const [isHolding, setIsHolding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      fetchInitialSchedule();
    }
  }, [token]);

  const fetchInitialSchedule = async () => {
    setIsLoading(true);
    try {
      const data = await getPublicSchedule(token!);
      setScheduleData(data);
    } catch (error: any) {
      console.error('Error fetching public schedule:', error);
      showToast('Failed to load scheduling page. The link might be invalid or expired.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateSelect = async (date: Dayjs) => {
    setSelectedDate(date);
    if (!token) return;

    setIsSlotsLoading(true);
    try {
      const dateStr = date.format('YYYY-MM-DD');
      const data = await getPublicSchedule(token, dateStr);
      setScheduleData(data);
    } catch (error: any) {
      console.error('Error fetching slots for date:', error);
      showToast('Failed to load time slots for this date.', 'error');
    } finally {
      setIsSlotsLoading(false);
    }
  };

  const handleSlotSelect = async (slot: PublicSlot) => {
    if (!token) return;
    setIsHolding(true);
    try {
      const response = await holdSlot(token, slot.id);
      setHeldSession(response.session);
      setSelectedSlot(response.slot);
    } catch (error: any) {
      console.error('Error holding slot:', error);
      showToast(error.response?.data?.message || 'Failed to hold slot. It might be unavailable.', 'error');
      if (selectedDate) handleDateSelect(selectedDate);
    } finally {
      setIsHolding(false);
    }
  };

  const handleBookingSubmit = async (data: { name: string; email: string; phone: string; notes: string }) => {
    if (!token || !heldSession) return;
    setIsSubmitting(true);
    try {
      const response = await bookSlot(token, {
        sessionToken: heldSession.session_token,
        customerName: data.name,
        customerEmail: data.email,
        customerPhone: data.phone,
        notes: data.notes
      });
      showToast('Meeting booked successfully!', 'success');
      setConfirmedBookingId(response.bookingId);
      setHeldSession(null);
      setSelectedSlot(null);
      setSelectedDate(null);
    } catch (error: any) {
      console.error('Error booking slot:', error);
      showToast(error.response?.data?.message || 'Failed to book slot.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToCalendar = () => {
    setHeldSession(null);
    setSelectedSlot(null);
    if (selectedDate) handleDateSelect(selectedDate);
  };

  if (isLoading) {
    return <FullScreenLoader />;
  }

  if (!scheduleData || !scheduleData.agent) {
    return (
      <Box sx={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', bgcolor: 'background.default' }}>
        <Typography variant="h5" color="text.secondary">Invalid or expired scheduling link.</Typography>
      </Box>
    );
  }

  if (confirmedBookingId && token) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: 'background.default', py: 4 }}>
        <Paper 
          elevation={3} 
          sx={{ display: 'flex', width: '100%', maxWidth: 800, minHeight: 400, borderRadius: 2, overflow: 'hidden' }}
        >
          <BookingSuccessPane 
            token={token} 
            bookingId={confirmedBookingId} 
            agentName={scheduleData.agent.full_name} 
          />
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: 'background.default', py: 4 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          width: '100%',
          maxWidth: heldSession ? 1000 : (selectedDate ? 1060 : 800), 
          height: isMobile ? 'auto' : 600,
          minHeight: isMobile ? 600 : 'auto',
          borderRadius: 2,
          overflow: 'hidden',
          transition: 'max-width 0.3s ease'
        }}
      >
        {/* Left Pane - Agent Info */}
        <Box sx={{ width: isMobile ? '100%' : (heldSession ? '35%' : (selectedDate ? '25%' : '35%')), bgcolor: 'background.paper', borderRight: isMobile ? 0 : 1, borderBottom: isMobile ? 1 : 0, borderColor: 'divider', transition: 'width 0.3s ease' }}>
          <AgentInfoPane 
            agent={scheduleData.agent} 
            selectedSlot={selectedSlot || undefined}
            onBack={heldSession ? handleBackToCalendar : undefined}
          />
        </Box>

        {heldSession ? (
          <Box sx={{ width: isMobile ? '100%' : '65%', bgcolor: 'background.paper', transition: 'width 0.3s ease' }}>
            <BookingFormPane 
              heldUntil={heldSession.held_until}
              onTimeout={() => {
                showToast('Your session has expired. Please select a time again.', 'error');
                handleBackToCalendar();
              }}
              onSubmit={handleBookingSubmit}
              isSubmitting={isSubmitting}
            />
          </Box>
        ) : (
          <>
            {/* Center Pane - Calendar */}
            <Box sx={{ width: isMobile ? '100%' : (selectedDate ? '45%' : '65%'), bgcolor: 'background.paper', transition: 'width 0.3s ease' }}>
              <CalendarPane 
                availableDates={scheduleData.dates} 
                selectedDate={selectedDate} 
                onDateSelect={handleDateSelect} 
              />
            </Box>

            {/* Right Pane - Slots (Conditionally Rendered) */}
            {selectedDate && (
              <>
                {!isMobile && <Divider orientation="vertical" flexItem />}
                <Box sx={{ width: isMobile ? '100%' : '30%', bgcolor: 'background.paper', minWidth: 260, height: isMobile ? 500 : '100%' }}>
                  <SlotsPane 
                    selectedDate={selectedDate} 
                    slots={scheduleData.slots} 
                    isLoading={isSlotsLoading || isHolding}
                    onSlotSelect={handleSlotSelect}
                  />
                </Box>
              </>
            )}
          </>
        )}
      </Paper>
    </Box>
  );
};

export default PublicSchedulePage;
