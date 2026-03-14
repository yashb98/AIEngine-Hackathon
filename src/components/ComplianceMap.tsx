'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CATEGORY_CONFIG, type RegCategory, type Obligation } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ComplianceMapProps {
  obligations: Obligation[];
}

const borderMap: Record<RegCategory, string> = {
  hmrc: 'border-l-blue-500',
  companies_house: 'border-l-green-500',
  council: 'border-l-amber-500',
  employment: 'border-l-purple-500',
  food_safety: 'border-l-orange-500',
  data: 'border-l-cyan-500',
  scottish: 'border-l-teal-500',
};

export function ComplianceMap({ obligations }: ComplianceMapProps) {
  const [expanded, setExpanded] = useState<Set<RegCategory>>(new Set());

  const grouped = obligations.reduce<Record<RegCategory, Obligation[]>>((acc, ob) => {
    if (!acc[ob.category]) acc[ob.category] = [];
    acc[ob.category].push(ob);
    return acc;
  }, {} as Record<RegCategory, Obligation[]>);

  const toggle = (cat: RegCategory) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const categories = Object.keys(grouped) as RegCategory[];

  return (
    <div className="space-y-3">
      {categories.map(cat => {
        const config = CATEGORY_CONFIG[cat];
        const items = grouped[cat];
        const isOpen = expanded.has(cat);

        return (
          <Card key={cat} className={cn('border-brand-border border-l-4 shadow-sm', borderMap[cat])}>
            <button
              onClick={() => toggle(cat)}
              className="flex w-full items-center justify-between px-5 py-4 text-left"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{config.icon}</span>
                <span className="font-semibold text-text-primary">{config.label}</span>
                <Badge variant="secondary" className="ml-1 text-xs">{items.length}</Badge>
              </div>
              {isOpen ? (
                <ChevronDown className="h-5 w-5 text-text-secondary" />
              ) : (
                <ChevronRight className="h-5 w-5 text-text-secondary" />
              )}
            </button>
            {isOpen && (
              <CardContent className="border-t border-brand-border pt-3 pb-4">
                <div className="space-y-4">
                  {items.map(ob => (
                    <div key={ob.id} className="text-sm">
                      <div className="flex items-start justify-between gap-2">
                        <h5 className="font-semibold text-text-primary">{ob.title}</h5>
                        <span className="shrink-0 text-xs text-text-secondary">{ob.frequency}</span>
                      </div>
                      <p className="mt-1 text-text-secondary">{ob.description}</p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-secondary">
                        <span>Penalty: <strong className="text-deadline-urgent">{ob.penalty}</strong></span>
                        <span>Source: {ob.source}</span>
                        {ob.sourceUrl && (
                          <a
                            href={ob.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-0.5 text-brand-accent hover:underline"
                          >
                            Link <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
