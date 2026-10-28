import axios from 'axios';
import axiosInstance from '../../../../utils/axios';
import type { CreatedTicket, RecentTicket, TicketDraft, TicketStatusResult } from '../types';

const BASE = '/ai-assistant';

function apiError(error: unknown, fallback: string): Error {
  if (axios.isAxiosError(error)) {
    return new Error(error.response?.data?.message || fallback);
  }
  return new Error(fallback);
}

export async function getRecentTickets(signal?: AbortSignal): Promise<RecentTicket[]> {
  try {
    const response = await axiosInstance.get(`${BASE}/my-recent-tickets`, { signal });
    return response.data.data ?? [];
  } catch (error) {
    throw apiError(error, 'Failed to load recent tickets.');
  }
}

export async function getTicketStatusByName(
  name: string,
  signal?: AbortSignal,
): Promise<TicketStatusResult[]> {
  try {
    const response = await axiosInstance.get(`${BASE}/ticket-status-by-name`, {
      params: { name },
      signal,
    });
    const data = response.data.data;
    return Array.isArray(data) ? data : data ? [data] : [];
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return [];
    }
    throw apiError(error, 'Failed to look up ticket status.');
  }
}

export async function chatFaq(
  payload: { query?: string; topicId?: string },
  signal?: AbortSignal,
): Promise<{ title: string; answer: string }> {
  try {
    const response = await axiosInstance.post(`${BASE}/faq-chat`, payload, { signal });
    return response.data.data;
  } catch (error) {
    throw apiError(error, 'Failed to answer that question.');
  }
}

export async function classifyIssue(rawDescription: string, signal?: AbortSignal): Promise<TicketDraft> {
  try {
    const response = await axiosInstance.post(
      `${BASE}/classify-issue`,
      { rawDescription },
      { signal },
    );
    return response.data.data;
  } catch (error) {
    throw apiError(error, 'Failed to prepare the ticket draft.');
  }
}

export async function confirmTicket(draft: TicketDraft, signal?: AbortSignal): Promise<CreatedTicket> {
  try {
    const response = await axiosInstance.post(`${BASE}/confirm-ticket`, draft, { signal });
    return response.data.data;
  } catch (error) {
    throw apiError(error, 'Failed to create the ticket.');
  }
}
