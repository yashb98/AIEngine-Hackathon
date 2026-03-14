import { AlertTriangle, Info, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CATEGORY_CONFIG } from '@/lib/types';
import type { RegulationChange } from '@/lib/types';

const severityStyles = {
  high: 'border-l-deadline-urgent bg-red-50',
  medium: 'border-l-deadline-warning bg-amber-50',
  low: 'border-l-brand-accent bg-blue-50',
};

const severityBadge = {
  high: 'bg-deadline-urgent text-white',
  medium: 'bg-deadline-warning text-white',
  low: 'bg-brand-accent text-white',
};

interface RegChangeAlertProps {
  changes: RegulationChange[];
}

export function RegChangeAlerts({ changes }: RegChangeAlertProps) {
  if (changes.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-deadline-warning" />
        <h3 className="font-semibold text-text-primary">Recent Regulation Changes</h3>
        <Badge variant="secondary" className="text-xs">{changes.length} update{changes.length > 1 ? 's' : ''}</Badge>
      </div>
      <div className="space-y-2">
        {changes.map(change => {
          const cat = CATEGORY_CONFIG[change.category];
          return (
            <Card key={change.id} className={cn('border-l-4 shadow-sm', severityStyles[change.severity])}>
              <CardContent className="py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-sm">{cat?.icon}</span>
                      <span className="text-xs font-medium text-text-secondary">{cat?.label}</span>
                      <span className="text-xs text-text-secondary">{change.date}</span>
                    </div>
                    <h4 className="text-sm font-semibold text-text-primary">{change.title}</h4>
                    <p className="mt-0.5 text-xs text-text-secondary">{change.summary}</p>
                    <p className="mt-1 text-xs">
                      <Info className="mr-1 inline h-3 w-3 text-brand-accent" />
                      <span className="font-medium text-text-primary">Impact:</span>{' '}
                      <span className="text-text-secondary">{change.impact}</span>
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <Badge className={cn('text-[10px]', severityBadge[change.severity])}>
                      {change.severity}
                    </Badge>
                    {change.sourceUrl && (
                      <a
                        href={change.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-0.5 text-[11px] text-brand-accent hover:underline"
                      >
                        Source <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
