import React, { useState } from 'react';
import { Box, Typography, Paper, Avatar, Chip } from '@mui/material';
import { 
  DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, 
  useSensor, useSensors 
} from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent, DragOverEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import dayjs from 'dayjs';

interface Ticket {
  id: string;
  ticket_number: string;
  subject: string;
  category: string;
  status: string;
  priority: string;
  created_at: string;
  customer?: {
    first_name: string;
    last_name: string;
  };
}

interface KanbanBoardProps {
  tickets: Ticket[];
  onStatusChange: (ticketId: string, newStatus: string) => void;
  onTicketClick: (ticketId: string) => void;
  onReorder?: (activeId: string, overId: string | null, newStatus?: string) => void;
}

const statuses = ['Open', 'In Progress', 'Resolved', 'Closed'];

const KanbanCard = ({ ticket, onClick, isOverlay = false }: { ticket: Ticket, onClick?: () => void, isOverlay?: boolean }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: ticket.id,
    data: {
      type: 'Ticket',
      ticket,
    },
    disabled: ticket.status === 'Closed',
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return '#F44336';
      case 'medium': return '#FF9800';
      case 'low': return '#9E9E9E';
      default: return '#757575';
    }
  };

  return (
    <Paper
      ref={setNodeRef}
      style={style}
      sx={{
        p: 2,
        mb: 2,
        cursor: ticket.status === 'Closed' ? 'pointer' : (isOverlay ? 'grabbing' : 'grab'),
        borderRadius: 2,
        boxShadow: isOverlay ? '0 8px 16px rgba(0,0,0,0.1)' : '0 2px 4px rgba(0,0,0,0.05)',
        '&:hover': { boxShadow: '0 4px 8px rgba(0,0,0,0.1)' },
        bgcolor: 'white',
        borderLeft: `4px solid ${getPriorityColor(ticket.priority)}`
      }}
      onClick={() => {
        // Prevent click if we are dragging
        if (!isDragging) {
          onClick?.();
        }
      }}
      {...attributes}
      {...listeners}
    >
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
        {ticket.ticket_number}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5, mb: 1, color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {ticket.subject}
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ width: 24, height: 24, fontSize: '0.7rem', bgcolor: 'primary.main', color: '#fff' }}>
            {ticket.customer?.first_name?.[0]}{ticket.customer?.last_name?.[0]}
          </Avatar>
        </Box>
        <Typography variant="caption" color="text.secondary">
          {dayjs(ticket.created_at).format('MMM D')}
        </Typography>
      </Box>
    </Paper>
  );
};

const KanbanColumn = ({ status, tickets, onTicketClick }: { status: string, tickets: Ticket[], onTicketClick: (id: string) => void }) => {
  const { setNodeRef } = useSortable({
    id: status,
    data: {
      type: 'Column',
      status,
    },
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open': return '#2196F3';
      case 'in progress': return '#FF9800';
      case 'resolved': return '#4CAF50';
      case 'closed': return '#9E9E9E';
      default: return '#757575';
    }
  };

  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 280,
        bgcolor: '#f4f6f8',
        borderRadius: 2,
        border: '1px solid #a3a2a2ff',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
          {status}
        </Typography>
        <Chip 
          label={tickets.length} 
          size="small" 
          sx={{ 
            bgcolor: `${getStatusColor(status)}20`, 
            color: getStatusColor(status), 
            fontWeight: 700 
          }} 
        />
      </Box>
      <Box ref={setNodeRef} sx={{ flexGrow: 1, overflowY: 'auto' }}>
        <SortableContext items={tickets.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tickets.map(ticket => (
            <KanbanCard key={ticket.id} ticket={ticket} onClick={() => onTicketClick(ticket.id)} />
          ))}
        </SortableContext>
      </Box>
    </Box>
  );
};

const KanbanBoard: React.FC<KanbanBoardProps> = ({ tickets, onStatusChange, onTicketClick, onReorder }) => {
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (active.data.current?.type === 'Ticket') {
      setActiveTicket(active.data.current.ticket);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTicket = active.data.current?.type === 'Ticket';
    const isOverColumn = over.data.current?.type === 'Column';
    const isOverTicket = over.data.current?.type === 'Ticket';

    if (!isActiveTicket) return;

    if (isOverColumn) {
      const newStatus = over.data.current?.status;
      if (onReorder) {
        onReorder(activeId as string, null, newStatus);
      }
    } else if (isOverTicket) {
      const newStatus = over.data.current?.ticket?.status;
      if (onReorder) {
        onReorder(activeId as string, overId as string, newStatus);
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) {
       setActiveTicket(null);
       return;
    }

    const activeId = active.id;
    const originalStatus = activeTicket?.status;
    const currentTicket = tickets.find(t => t.id === activeId);

    if (currentTicket && originalStatus && currentTicket.status !== originalStatus) {
      onStatusChange(currentTicket.id, currentTicket.status);
    }
    
    setActiveTicket(null);
  };

  const columns = statuses.map(status => ({
    status,
    tickets: tickets.filter(t => t.status === status)
  }));

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <Box sx={{ display: 'flex', gap: 3, height: '100%', overflowX: 'auto', pb: 2 }}>
        {columns.map(col => (
          <KanbanColumn key={col.status} status={col.status} tickets={col.tickets} onTicketClick={onTicketClick} />
        ))}
      </Box>
      <DragOverlay>
        {activeTicket ? <KanbanCard ticket={activeTicket} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
};

export default KanbanBoard;
