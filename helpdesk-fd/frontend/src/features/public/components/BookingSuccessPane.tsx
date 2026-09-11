import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';
import { CheckCircle2, User, Calendar as CalendarIcon, Globe, Hash } from 'lucide-react';
import dayjs from 'dayjs';
import { getBookingDetails, type BookingDetailsResponse } from '../services/publicSchedule.service';
import { useToast } from '../../../context/ToastContext';

interface BookingSuccessPaneProps {
  token: string;
  bookingId: string;
  agentName: string;
}

const BookingSuccessPane: React.FC<BookingSuccessPaneProps> = ({ token, bookingId, agentName }) => {
  const [details, setDetails] = useState<BookingDetailsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const data = await getBookingDetails(token, bookingId);
        setDetails(data);
      } catch (error: any) {
        console.error('Error fetching booking details:', error);
        showToast('Failed to load booking details.', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetails();
  }, [token, bookingId, showToast]);

  if (isLoading) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!details) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Typography color="error">Could not load booking information.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
        <CheckCircle2 color="#2e7d32" size={28} />
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          You are scheduled!
        </Typography>
      </Box>

      <Paper variant="outlined" sx={{ p: 4, width: '100%', maxWidth: 500, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
          New Meeting
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'text.secondary' }}>
            <User size={20} />
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {agentName}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, color: 'text.secondary' }}>
            <CalendarIcon size={20} style={{ marginTop: 2 }} />
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {dayjs(details.meeting.startTime).format('h:mma')} - {dayjs(details.meeting.endTime).format('h:mma')}, {dayjs(details.meeting.startTime).format('dddd, MMMM D, YYYY')}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'text.secondary' }}>
            <Globe size={20} />
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {Intl.DateTimeFormat().resolvedOptions().timeZone}
            </Typography>
          </Box>

          {details.bookingReference && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'text.secondary', mt: 1 }}>
              <Hash size={20} />
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                Reference: <Typography component="span" variant="body1" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>{details.bookingReference}</Typography>
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default BookingSuccessPane;
