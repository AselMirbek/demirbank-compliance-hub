import React from 'react';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusStyles: Record<string, string> = {
  'Active': 'bg-success/10 text-success border-success/20',
  'NEW': 'bg-primary/10 text-primary border-primary/20',
  'PENDING_APPROVAL': 'bg-warning/10 text-warning border-warning/20',
  'APPROVED': 'bg-success/10 text-success border-success/20',
  'REJECTED': 'bg-destructive/10 text-destructive border-destructive/20',
  'Deleted': 'bg-muted text-muted-foreground border-muted',
  'INSERT': 'bg-success/10 text-success border-success/20',
  'DELETE': 'bg-destructive/10 text-destructive border-destructive/20',
  'SEARCH': 'bg-primary/10 text-primary border-primary/20',
  'Exact': 'bg-destructive/10 text-destructive border-destructive/20',
  'Partial': 'bg-warning/10 text-warning border-warning/20',
  'low': 'bg-success/10 text-success border-success/20',
  'medium': 'bg-warning/10 text-warning border-warning/20',
  'high': 'bg-destructive/10 text-destructive border-destructive/20',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const style = statusStyles[status] || 'bg-muted text-muted-foreground border-muted';
  
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
      style,
      className
    )}>
      {status.replace('_', ' ')}
    </span>
  );
};
