import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { CATEGORY_CONFIG } from '@/lib/types';
import type { Deadline } from '@/lib/types';
import { cn } from '@/lib/utils';

interface DeadlineCardProps {
  deadline: Deadline;
}

function formatRelativeDate(dateStr: string | null): string {
  if (!dateStr) return 'Ongoing';
  const due = new Date(dateStr);
  const now = new Date();
  const diffMs = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
  if (diffDays === 0) return 'Due today';
  if (diffDays === 1) return 'Due tomorrow';
  if (diffDays <= 30) return `In ${diffDays} days`;
  const months = Math.round(diffDays / 30);
  return `In ~${months} month${months > 1 ? 's' : ''}`;
}

const borderColorMap: Record<string, string> = {
  overdue: 'border-l-deadline-overdue',
  urgent: 'border-l-deadline-urgent',
  warning: 'border-l-deadline-warning',
  safe: 'border-l-deadline-safe',
};

export function DeadlineCard({ deadline }: DeadlineCardProps) {
  const cat = CATEGORY_CONFIG[deadline.category];

  return (
    <Card className={cn('border-brand-border border-l-4 shadow-sm', borderColorMap[deadline.severity])}>
      <CardContent className="py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <span className="text-base">{cat.icon}</span>
              <span className="text-xs font-medium text-text-secondary">{cat.label}</span>
            </div>
            <h4 className="font-semibold text-text-primary">{deadline.title}</h4>
            <p className="mt-1 text-sm text-text-secondary">{deadline.description}</p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-secondary">
              <span>Penalty: <strong className="text-deadline-urgent">{deadline.penalty}</strong></span>
              <span>Action: {deadline.action}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <StatusBadge severity={deadline.severity} />
            <span className="text-sm font-medium text-text-secondary">
              {formatRelativeDate(deadline.dueDate)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
