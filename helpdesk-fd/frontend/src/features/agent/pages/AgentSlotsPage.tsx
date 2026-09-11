import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { type Dayjs } from 'dayjs';

import AgentLayout from '../components/AgentLayout';
import AvailabilityForm from '../components/slots/AvailabilityForm';
import SlotCard from '../components/slots/SlotCard';
import PublicMeetingLink from '../components/slots/PublicMeetingLink';
import { useToast } from '../../../context/ToastContext';
import { 
  createAvailability, 
  getAvailabilities, 
  getMeetingLink, 
  createMeetingLink, 
  type AgentAvailabilityPayload,
  type AgentAvailabilityResponse,
  type MeetingLinkResponse
} from '../services/availability.service';

const AgentSlotsPage: React.FC = () => {
  const { showToast } = useToast();
  const [selectedDates, setSelectedDates] = useState<Dayjs[]>([]);
  const [startTime, setStartTime] = useState<Dayjs | null>(null);
  const [endTime, setEndTime] = useState<Dayjs | null>(null);
  const [duration, setDuration] = useState<number>(30);
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month'>('week');
  const [selectedMonth, setSelectedMonth] = useState<Dayjs>(dayjs());
  
  const [groupedAvailabilities, setGroupedAvailabilities] = useState<Record<string, AgentAvailabilityResponse[]>>({});
  const [meetingLink, setMeetingLink] = useState<MeetingLinkResponse | null>(null);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchData();
  }, [dateRange, selectedMonth]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch meeting link, if not exists, DO NOT create it yet.
      // Optimize: Only fetch if we haven't already.
      if (!meetingLink) {
        const link = await getMeetingLink();
        setMeetingLink(link);
      }

      // 2. Fetch availabilities based on dateRange
      let startDateStr = '';
      let endDateStr = '';
      
      if (dateRange === 'today') {
        startDateStr = dayjs().format('YYYY-MM-DD');
        endDateStr = startDateStr;
      } else if (dateRange === 'week') {
        startDateStr = dayjs().startOf('week').format('YYYY-MM-DD');
        endDateStr = dayjs().endOf('week').format('YYYY-MM-DD');
      } else if (dateRange === 'month') {
        startDateStr = selectedMonth.startOf('month').format('YYYY-MM-DD');
        endDateStr = selectedMonth.endOf('month').format('YYYY-MM-DD');
      }

      const availData = await getAvailabilities(startDateStr, endDateStr);
      
      // Group by date (2 block ranges on same day)
      const grouped: Record<string, AgentAvailabilityResponse[]> = {};
      availData.forEach(a => {
        if (!grouped[a.availability_date]) {
          grouped[a.availability_date] = [];
        }
        grouped[a.availability_date].push(a);
      });
      
      // Sort keys (dates) sorting the dates accendingly by the date
      let sortedKeys = Object.keys(grouped).sort();
      
      // If dateRange is 'month', sort the exact selectedMonth date to the top
      if (dateRange === 'month') {
        const selectedStr = selectedMonth.format('YYYY-MM-DD');
        if (sortedKeys.includes(selectedStr)) {
          sortedKeys = [selectedStr, ...sortedKeys.filter(k => k !== selectedStr)];
        }
      }

      const sortedGrouped: Record<string, AgentAvailabilityResponse[]> = {};
      sortedKeys.forEach(key => {
        sortedGrouped[key] = grouped[key];
      });
      setGroupedAvailabilities(sortedGrouped);

    } catch (err: any) {
      console.error('Error fetching data', err);
      showToast('Failed to load slots and availabilities.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateSlots = async () => {
    if (selectedDates.length === 0) {
      showToast("Please select at least one date.", 'error');
      return;
    }
    if (!startTime || !endTime) {
      showToast("Please select both start and end times.", 'error');
      return;
    }
    
    // Format times to HH:mm
    const startTimeStr = startTime.format('HH:mm');
    const endTimeStr = endTime.format('HH:mm');
    
    if (startTimeStr >= endTimeStr) {
      showToast("Start time must be before end time.", 'error');
      return;
    }

    const payload: AgentAvailabilityPayload = {
      availability_dates: selectedDates.map(d => d.format('YYYY-MM-DD')),
      start_time: startTimeStr,
      end_time: endTimeStr,
      slot_duration_minutes: duration
    };

    setIsLoading(true);
    try {
      await createAvailability(payload);
      
      // If a meeting link does not exist yet, create one now.
      if (!meetingLink) {
        await createMeetingLink();
      }

      showToast("Availability created and slots generated successfully!", 'success');
      // Clear form
      setSelectedDates([]);
      setStartTime(null);
      setEndTime(null);
      setDuration(30);
      
      // Refresh data
      await fetchData();
    } catch (err: any) {
      console.error('Error creating availability', err);
      if (err.response?.status === 409) {
        showToast(
          'You cannot create this availability because this time is already created.',
          'error',
        );
      } else {
        showToast(err.response?.data?.message || 'Failed to create availability.', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (meetingLink?.url) {
      navigator.clipboard.writeText(meetingLink.url);
      showToast("Link copied to clipboard!", 'success');
    }
  };

  return (
    <AgentLayout>
      <Box sx={{ p: { xs: 2, md: 4 }, height: '100%', overflowY: 'auto', bgcolor: 'background.default' }}>
        <Box sx={{ maxWidth: 1200, margin: '0 auto' }}>
          
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, fontFamily: 'serif' }}>
              Slots & Availability
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Create availability windows — the system generates bookable time slots and a public scheduling link.
            </Typography>
          </Box>

          <AvailabilityForm 
            selectedDates={selectedDates}
            setSelectedDates={setSelectedDates}
            startTime={startTime}
            setStartTime={setStartTime}
            endTime={endTime}
            setEndTime={setEndTime}
            duration={duration}
            setDuration={setDuration}
            onGenerate={handleGenerateSlots}
            isLoading={isLoading}
          />

          {/* Common Public Meeting Link */}
          {meetingLink && Object.keys(groupedAvailabilities).length > 0 && (
            <Paper elevation={0} sx={{ mb: 4, borderRadius: 2, border: 1, borderColor: 'divider', overflow: 'hidden' }}>
              <PublicMeetingLink meetingLink={meetingLink} onCopy={handleCopyLink} />
            </Paper>
          )}

          {/* List of Availabilities Header & Controls */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Your Availabilities
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <ToggleButtonGroup
                value={dateRange}
                exclusive
                onChange={(_e, newValue) => {
                  if (newValue) setDateRange(newValue);
                }}
                size="small"
              >
                <ToggleButton value="today" sx={{ textTransform: 'none', color: 'text.primary', '&.Mui-selected': { color: 'primary.main' } }}>Today</ToggleButton>
                <ToggleButton value="week" sx={{ textTransform: 'none', color: 'text.primary', '&.Mui-selected': { color: 'primary.main' } }}>This Week</ToggleButton>
              </ToggleButtonGroup>
              
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  value={selectedMonth}
                  onChange={(newValue) => {
                    if (newValue) {
                      setSelectedMonth(newValue);
                      setDateRange('month');
                    }
                  }}
                  slotProps={{ 
                    textField: { 
                      size: 'small', 
                      sx: { 
                        width: 170,
                        '.MuiInputBase-root': {
                          backgroundColor: dateRange === 'month' ? 'action.hover' : 'transparent',
                          color: dateRange === 'month' ? 'primary.main' : 'text.primary'
                        }
                      } 
                    } 
                  }}
                  format="D MMM YYYY"
                />
              </LocalizationProvider>
            </Box>
          </Box>

          {/* List of Availabilities */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {Object.keys(groupedAvailabilities).length === 0 && !isLoading && (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No availabilities found for this period.
              </Typography>
            )}

            {Object.keys(groupedAvailabilities).map(dateStr => (
              <SlotCard 
                key={dateStr}
                dateStr={dateStr}
                blocks={groupedAvailabilities[dateStr]}
              />
            ))}
          </Box>
          
        </Box>
      </Box>

    </AgentLayout>
  );
};

export default AgentSlotsPage;
