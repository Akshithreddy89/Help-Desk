import axiosInstance from '../../../utils/axios';

export interface CalendarBookingResponse {
  id: string;
  agent_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  status: string;
  meeting_date: string;
  start_time: string;
  end_time: string;
  booking_reference: string;
  slot_id?: string;
}

export const fetchCalendarBookings = async (startDate?: string, endDate?: string): Promise<CalendarBookingResponse[]> => {
  const params: Record<string, string> = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  const response = await axiosInstance.get('/agent/calendar', { params });
  return response.data.data;
};

export const fetchBookingDetails = async (bookingId: string): Promise<CalendarBookingResponse> => {
  const response = await axiosInstance.get(`/agent/calendar/${bookingId}`);
  return response.data.data;
};
