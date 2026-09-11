import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import axiosInstance from '../../../utils/axios';
import { useParams, useNavigate } from 'react-router-dom';
import TicketDetailsView from '../../../components/TicketDetails/TicketDetailsView';
import type { TicketDetail } from '../../../components/TicketDetails/types';

const AdminTicketDetails: React.FC = () => {
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
      const response = await axiosInstance.get(`/admin/tickets/${id}`);
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
    <AdminLayout>
      <TicketDetailsView
        ticket={ticket}
        role="ADMIN"
        onBack={() => navigate('/admin/tickets')}
        backButtonText="Back to Admin Tickets"
        onAddComment={handleSendComment}
        newComment={newComment}
        setNewComment={setNewComment}
        submittingComment={submittingComment}
        loading={loading}
        error={error}
      />
    </AdminLayout>
  );
};

export default AdminTicketDetails;
