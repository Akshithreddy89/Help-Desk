import React, { useEffect, useState } from 'react';
import CustomerLayout from '../components/CustomerLayout';
import axiosInstance from '../../../utils/axios';
import { useParams, useNavigate } from 'react-router-dom';
import TicketDetailsView from '../../../components/TicketDetails/TicketDetailsView';
import type { TicketDetail } from '../../../components/TicketDetails/types';

const TicketDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const fetchTicketDetails = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/tickets/${id}`);
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
    <CustomerLayout>
      <TicketDetailsView
        ticket={ticket}
        role="CUSTOMER"
        onBack={() => navigate('/customer/tickets')}
        backButtonText="Back to My Tickets"
        onAddComment={handleSendComment}
        newComment={newComment}
        setNewComment={setNewComment}
        submittingComment={submittingComment}
        loading={loading}
        error={error}
      />
    </CustomerLayout>
  );
};

export default TicketDetails;
