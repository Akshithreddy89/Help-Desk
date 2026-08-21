import React, { useEffect, useState } from 'react';
import AgentLayout from '../components/AgentLayout';
import axiosInstance from '../../../utils/axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../../../context/ToastContext';
import TicketDetailsView from '../../../components/TicketDetails/TicketDetailsView';
import type { TicketDetail } from '../../../components/TicketDetails/types';

const AgentTicketDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchTicketDetails = async () => {
    try {
      const response = await axiosInstance.get(`/agent/tickets/${id}`);
      setTicket(response.data.data);
      setError(null);
    } catch (err: any) {
      console.error("Failed to fetch ticket details", err);
      setError('Failed to load ticket details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchTicketDetails();
    }
  }, [id]);

  const handleStatusChange = async (event: any) => {
    const newStatus = event.target.value;
    setUpdatingStatus(true);
    try {
      await axiosInstance.patch(`/agent/tickets/${id}/status`, { status: newStatus });
      setTicket(prev => prev ? { ...prev, status: newStatus } : null);
      showToast('Ticket status updated successfully', 'success');
    } catch (err: any) {
      console.error("Failed to update status", err);
      alert('Failed to update status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSendComment = async () => {
    if (!newComment.trim()) return;
    setSubmittingComment(true);
    try {
      await axiosInstance.post('/comments', {
        ticket_id: id,
        message: newComment
      });
      setNewComment('');
      fetchTicketDetails();
    } catch (err: any) {
      console.error("Failed to add comment", err);
      alert('Failed to add comment.');
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <AgentLayout>
      <TicketDetailsView
        ticket={ticket}
        role="AGENT"
        onBack={() => navigate('/agent/my-tickets')}
        backButtonText="Back to My Tickets"
        onAddComment={handleSendComment}
        newComment={newComment}
        setNewComment={setNewComment}
        submittingComment={submittingComment}
        onStatusChange={handleStatusChange}
        updatingStatus={updatingStatus}
        loading={loading}
        error={error}
      />
    </AgentLayout>
  );
};

export default AgentTicketDetails;
