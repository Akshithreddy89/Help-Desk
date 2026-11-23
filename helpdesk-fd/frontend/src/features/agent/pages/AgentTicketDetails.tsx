import React, { useState } from 'react';
import AgentLayout from '../components/AgentLayout';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../../../context/ToastContext';
import TicketDetailsView from '../../../components/TicketDetails/TicketDetailsView';
import { 
  useAgentTicketDetails, 
  useUpdateTicketStatus, 
  useAddAgentTicketComment 
} from '../hooks/useAgentTickets';

const AgentTicketDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [newComment, setNewComment] = useState('');

  // React Query hook for single ticket details with automatic caching
  const { data: ticket, isLoading, error } = useAgentTicketDetails(id);

  // Mutation hooks
  const updateStatusMutation = useUpdateTicketStatus();
  const addCommentMutation = useAddAgentTicketComment();

  const handleStatusChange = async (event: any) => {
    const newStatus = event.target.value;
    if (!id) return;
    try {
      await updateStatusMutation.mutateAsync({ ticketId: id, status: newStatus });
      showToast('Ticket status updated successfully', 'success');
    } catch (err: any) {
      console.error("Failed to update status", err);
      showToast(err?.response?.data?.message || 'Failed to update status.', 'error');
    }
  };

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
    <AgentLayout>
      <TicketDetailsView
        ticket={ticket || null}
        role="AGENT"
        onBack={() => navigate('/agent/my-tickets')}
        backButtonText="Back to My Tickets"
        onAddComment={handleSendComment}
        newComment={newComment}
        setNewComment={setNewComment}
        submittingComment={addCommentMutation.isPending}
        onStatusChange={handleStatusChange}
        updatingStatus={updateStatusMutation.isPending}
        loading={isLoading}
        error={errorMessage}
      />
    </AgentLayout>
  );
};

export default AgentTicketDetails;
