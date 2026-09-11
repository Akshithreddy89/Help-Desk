import React, { useEffect, useState } from 'react';
import { Box, Typography, IconButton, Divider, Chip, Skeleton } from '@mui/material';
import { 
  Close as CloseIcon, 
  Event as EventIcon, 
  AccessTime as AccessTimeIcon, 
  Person as PersonIcon, 
  Email as EmailIcon, 
  Phone as PhoneIcon, 
  ConfirmationNumber as ConfirmationNumberIcon 
} from '@mui/icons-material';
import type { MeetingBooking } from '../pages/AgentCalendarPage';
import { fetchBookingDetails } from '../services/calendar.service';
import dayjs from 'dayjs';

interface BookingDetailsPanelProps {
  booking: MeetingBooking;
  onClose: () => void;
}

const BookingDetailsPanel: React.FC<BookingDetailsPanelProps> = ({ booking, onClose }) => {
  const [detailedBooking, setDetailedBooking] = useState<MeetingBooking | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const loadDetails = async () => {
      setIsLoading(true);
      try {
        const data = await fetchBookingDetails(booking.id);
        if (isMounted) {
          const mapped: MeetingBooking = {
            id: data.id,
            agentId: data.agent_id,
            customerName: data.customer_name,
            customerEmail: data.customer_email,
            customerPhone: data.customer_phone,
            bookingDate: data.meeting_date,
            startTime: data.start_time.substring(0, 5),
            endTime: data.end_time.substring(0, 5),
            meetingType: 'Virtual',
            status: data.status.toLowerCase() as any,
            bookingRef: data.booking_reference,
          };
          setDetailedBooking(mapped);
        }
      } catch (error) {
        console.error('Failed to fetch detailed booking', error);
        // Fallback to the basic booking data passed as prop if fetch fails
        if (isMounted) {
          setDetailedBooking(booking);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadDetails();

    return () => {
      isMounted = false;
    };
  }, [booking.id, booking]);

  const displayData = detailedBooking || booking;

  return (
    <Box sx={{ p: 3, height: '100%', overflowY: 'auto', bgcolor: 'background.paper', borderLeft: '1px solid #e0e0e0' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Booking Details</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider sx={{ mb: 3 }} />
      
      {/* Date & Time */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>Schedule</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <EventIcon sx={{ color: 'primary.main', mr: 1, fontSize: 20 }} />
          {isLoading ? <Skeleton width={150} /> : <Typography>{dayjs(displayData.bookingDate).format('MMMM D, YYYY')}</Typography>}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AccessTimeIcon sx={{ color: 'primary.main', mr: 1, fontSize: 20 }} />
          {isLoading ? <Skeleton width={120} /> : <Typography>{displayData.startTime} - {displayData.endTime}</Typography>}
        </Box>
      </Box>

      {/* Customer Info */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>Customer Information</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <PersonIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
          {isLoading ? <Skeleton width={140} /> : <Typography>{displayData.customerName}</Typography>}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <EmailIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
          {isLoading ? <Skeleton width={180} /> : <Typography>{displayData.customerEmail}</Typography>}
        </Box>
        {(isLoading || displayData.customerPhone) && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PhoneIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
            {isLoading ? <Skeleton width={120} /> : <Typography>{displayData.customerPhone}</Typography>}
          </Box>
        )}
      </Box>

      {/* Meeting Details */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>Meeting Details</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <ConfirmationNumberIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
          {isLoading ? <Skeleton width={150} /> : <Typography>Ref: {displayData.bookingRef}</Typography>}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2" sx={{ mr: 1, color: 'text.secondary' }}>Type:</Typography>
          {isLoading ? <Skeleton width={60} height={32} /> : <Chip label={displayData.meetingType} size="small" variant="outlined" />}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="body2" sx={{ mr: 1, color: 'text.secondary' }}>Status:</Typography>
          {isLoading ? (
            <Skeleton width={80} height={32} />
          ) : (
            <Chip 
              label={displayData.status.toUpperCase()} 
              size="small" 
              color={displayData.status === 'confirmed' ? 'success' : displayData.status === 'pending' ? 'warning' : 'error'} 
            />
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default BookingDetailsPanel;
