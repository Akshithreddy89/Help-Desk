import React, { useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { useParams, useNavigate } from 'react-router-dom';
import TicketDetailsView from '../../../components/TicketDetails/TicketDetailsView';
import { useAdminTicketDetails, useAddAdminTicketComment } from '../hooks/useAdminTickets';
import { useToast } from '../../../context/ToastContext';

const AdminTicketDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [newComment, setNewComment] = useState('');

  // React Query hook for admin ticket details with automatic caching
  const { data: ticket, isLoading, error } = useAdminTicketDetails(id);

  // Mutation hook to add a comment
  const addCommentMutation = useAddAdminTicketComment();

  const handleSendComment = async () => {
    if (!newComment.trim() || !id) return;
    try {
      await addCommentMutation.mutateAsync({
        ticket_id: id,
        message: newComment.trim(),
      });
      setNewComment('');
      showToast('Comment posted successfully', 'success');
    } catch (err: any) {
      console.error("Failed to add comment", err);
      showToast(err?.response?.data?.message || 'Failed to add comment.', 'error');
    }
  };

  const errorMessage = error instanceof Error ? error.message : error ? 'Failed to load ticket details. Please try again later.' : null;

  return (
    <AdminLayout>
      <TicketDetailsView
        ticket={ticket || null}
        role="ADMIN"
        onBack={() => navigate('/admin/tickets')}
        backButtonText="Back to Admin Tickets"
        onAddComment={handleSendComment}
        newComment={newComment}
        setNewComment={setNewComment}
        submittingComment={addCommentMutation.isPending}
        loading={isLoading}
        error={errorMessage}
      />
    </AdminLayout>
  );
};

export default AdminTicketDetails;
