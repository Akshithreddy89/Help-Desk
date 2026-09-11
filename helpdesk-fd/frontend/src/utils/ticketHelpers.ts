export const getStatusColor = (status: string = ''): string => {
  switch (status.toLowerCase()) {
    case 'open':
      return '#2196F3';
    case 'in progress':
      return '#FF9800';
    case 'resolved':
      return '#4CAF50';
    case 'closed':
      return '#9E9E9E';
    default:
      return '#757575';
  }
};

export const getStatusMuiColor = (status: string = ''): 'primary' | 'warning' | 'success' | 'default' => {
  switch (status.toLowerCase()) {
    case 'open':
      return 'primary';
    case 'in progress':
      return 'warning';
    case 'resolved':
      return 'success';
    case 'closed':
      return 'default';
    default:
      return 'default';
  }
};

export const getPriorityColor = (priority: string = ''): string => {
  switch (priority.toLowerCase()) {
    case 'high':
      return '#F44336';
    case 'medium':
      return '#FF9800';
    case 'low':
      return '#4CAF50';
    default:
      return '#757575';
  }
};

export const getInitials = (firstName?: string, lastName?: string): string => {
  const first = firstName?.[0] || '';
  const last = lastName?.[0] || '';
  return (first + last).toUpperCase() || '?';
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const stringToColor = (str: string = ''): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  return color;
};
