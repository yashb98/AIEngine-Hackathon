'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DeadlineCard } from '@/components/DeadlineCard';
import type { Deadline } from '@/lib/types';

type Filter = 'all' | 'urgent' | 'month' | 'quarter';

interface DeadlineTimelineProps {
  deadlines: Deadline[];
}

export function DeadlineTimeline({ deadlines }: DeadlineTimelineProps) {
  const [filter, setFilter] = useState<Filter>('all');

  const now = new Date();

  const filtered = deadlines.filter(d => {
    if (filter === 'all') return true;
    if (filter === 'urgent') return d.severity === 'overdue' || d.severity === 'urgent';
    if (!d.dueDate) return false;
    const due = new Date(d.dueDate);
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (filter === 'month') return diffDays <= 30;
    return diffDays <= 90;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'urgent', label: 'Urgent' },
    { key: 'month', label: 'This Month' },
    { key: 'quarter', label: 'This Quarter' },
  ];

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {filters.map(f => (
          <Button
            key={f.key}
            variant={filter === f.key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(f.key)}
            className={filter === f.key ? 'bg-brand-accent hover:bg-blue-600' : ''}
          >
            {f.label}
          </Button>
        ))}
      </div>
      {sorted.length === 0 ? (
        <p className="py-8 text-center text-text-secondary">No deadlines match this filter.</p>
      ) : (
        <div className="space-y-3">
          {sorted.map(d => (
            <DeadlineCard key={d.id} deadline={d} />
          ))}
        </div>
      )}
    </div>
  );
}
