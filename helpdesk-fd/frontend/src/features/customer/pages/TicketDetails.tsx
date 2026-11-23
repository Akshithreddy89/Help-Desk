import React, { useState } from 'react';
import CustomerLayout from '../components/CustomerLayout';
import { useParams, useNavigate } from 'react-router-dom';
import TicketDetailsView from '../../../components/TicketDetails/TicketDetailsView';
import { useTicketDetails, useAddTicketComment } from '../hooks/useCustomerTickets';
import { useToast } from '../../../context/ToastContext';

const TicketDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [newComment, setNewComment] = useState('');

  // React Query hook for ticket details with automatic caching
  const { data: ticket, isLoading, error } = useTicketDetails(id);

  // Mutation hook to add a new comment
  const addCommentMutation = useAddTicketComment();

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

  const errorMessage = error instanceof Error ? error.message : error ? 'Failed to load ticket details.' : null;

  return (
    <CustomerLayout>
      <TicketDetailsView
        ticket={ticket || null}
        role="CUSTOMER"
        onBack={() => navigate('/customer/tickets')}
        backButtonText="Back to My Tickets"
        onAddComment={handleSendComment}
        newComment={newComment}
        setNewComment={setNewComment}
        submittingComment={addCommentMutation.isPending}
        loading={isLoading}
        error={errorMessage}
      />
    </CustomerLayout>
  );
};

export default TicketDetails;
