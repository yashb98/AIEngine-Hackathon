import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { DeadlineSeverity } from '@/lib/types';

const severityConfig: Record<DeadlineSeverity, { label: string; className: string }> = {
  overdue: { label: 'Overdue', className: 'bg-deadline-overdue text-white' },
  urgent: { label: 'Urgent', className: 'bg-deadline-urgent text-white' },
  warning: { label: 'Due Soon', className: 'bg-deadline-warning text-white' },
  safe: { label: 'On Track', className: 'bg-deadline-safe text-white' },
};

interface StatusBadgeProps {
  severity: DeadlineSeverity;
}

export function StatusBadge({ severity }: StatusBadgeProps) {
  const config = severityConfig[severity];
  return (
    <Badge className={cn('text-xs font-semibold', config.className)}>
      {config.label}
    </Badge>
  );
}
