import axiosInstance from '../../../utils/axios';

export interface PublicAgent {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
}

export interface PublicSlot {
  id: string;
  start_datetime: string;
  end_datetime: string;
  status: string;
}

export interface PublicScheduleResponse {
  agent: PublicAgent;
  dates: string[];
  date?: string;
  slots: PublicSlot[];
}

export interface HoldSession {
  id: string;
  session_token: string;
  status: string;
  held_until: string;
}

export interface HoldSlotResponse {
  session: HoldSession;
  slot: PublicSlot;
}

export interface BookSlotRequest {
  sessionToken: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  notes?: string;
}

export interface BookingDetailsResponse {
  bookingId: string;
  agent: { id: string };
  customer: { name: string; email: string; phone: string };
  meeting: { date: string; startTime: string; endTime: string; status: string };
  notes: string;
  bookingReference?: string;
}

export const getPublicSchedule = async (
  token: string,
  date?: string
): Promise<PublicScheduleResponse> => {
  const params: Record<string, string> = {};
  if (date) {
    params.date = date;
  }
  const response = await axiosInstance.get(`/public/schedule/${token}`, { params });
  return response.data.data;
};

export const holdSlot = async (
  token: string,
  slotId: string
): Promise<HoldSlotResponse> => {
  const response = await axiosInstance.post(`/public/schedule/${token}/hold`, { slot_id: slotId });
  return response.data.data;
};

export const bookSlot = async (
  token: string,
  data: BookSlotRequest
): Promise<{ bookingId: string }> => {
  const response = await axiosInstance.post(`/public/schedule/${token}/book`, data);
  return response.data.data;
};

export const getBookingDetails = async (
  token: string,
  bookingId: string
): Promise<BookingDetailsResponse> => {
  const response = await axiosInstance.get(`/public/schedule/${token}/bookings/${bookingId}`);
  return response.data.data;
};
