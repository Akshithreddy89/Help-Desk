import axiosInstance from '../../../utils/axios';

export interface AgentAvailabilityPayload {
  availability_dates: string[];
  start_time: string;
  end_time: string;
  slot_duration_minutes: number;
}

export interface AgentAvailabilityResponse {
  id: string;
  agent_id: string;
  availability_date: string;
  start_time: string;
  end_time: string;
  slot_duration_minutes: number;
  status: string;
}

export interface SlotResponse {
  id: string;
  availability_id: string;
  start_datetime: string;
  end_datetime: string;
  status: string;
}

export interface MeetingLinkResponse {
  id: string;
  public_token: string;
  status: string;
  url: string;
}

export const createAvailability = async (payload: AgentAvailabilityPayload) => {
  const response = await axiosInstance.post('/agent/availabilities', payload);
  return response.data;
};

export const getAvailabilities = async (startDate?: string, endDate?: string): Promise<AgentAvailabilityResponse[]> => {
  const params: Record<string, string> = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  const response = await axiosInstance.get('/agent/availabilities', { params });
  return response.data.data;
};

export const getSlots = async (date?: string): Promise<SlotResponse[]> => {
  const params: Record<string, string> = {};
  if (date) params.date = date;
  const response = await axiosInstance.get('/agent/slots', { params });
  return response.data.data;
};

export const getMeetingLink = async (): Promise<MeetingLinkResponse | null> => {
  try {
    const response = await axiosInstance.get('/agent/meeting-link');
    return response.data.meetingLink;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

export const createMeetingLink = async (): Promise<MeetingLinkResponse> => {
  const response = await axiosInstance.post('/agent/meeting-link');
  return response.data.meetingLink;
};
