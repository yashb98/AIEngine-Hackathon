import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  color?: 'default' | 'urgent' | 'warning' | 'safe';
}

const colorMap = {
  default: 'text-brand',
  urgent: 'text-deadline-urgent',
  warning: 'text-deadline-warning',
  safe: 'text-deadline-safe',
};

export function StatCard({ label, value, color = 'default' }: StatCardProps) {
  return (
    <Card className="border-brand-border shadow-sm">
      <CardContent className="pt-5 pb-4">
        <p className="text-sm font-medium text-text-secondary">{label}</p>
        <p className={cn('mt-1 text-2xl font-bold', colorMap[color])}>{value}</p>
      </CardContent>
    </Card>
  );
}
