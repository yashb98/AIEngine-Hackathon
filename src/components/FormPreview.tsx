'use client';

import { useState } from 'react';
import {
  CheckCircle2, AlertCircle, Edit3, Copy, Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { FormField } from '@/lib/types';

interface FormPreviewProps {
  fields: FormField[];
  summary: string;
  onFieldUpdate: (id: string, value: string) => void;
  onConfirm: () => void;
  onBack: () => void;
}

export function FormPreview({ fields, summary, onFieldUpdate, onConfirm, onBack }: FormPreviewProps) {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const sections = fields.reduce((acc, f) => {
    (acc[f.section] ??= []).push(f);
    return acc;
  }, {} as Record<string, FormField[]>);

  const valStr = (v: unknown): string => (typeof v === 'string' ? v : String(v ?? ''));
  const hasIssues = fields.some(f => !valStr(f.value) || valStr(f.value).startsWith('?'));
  const filledCount = fields.filter(f => valStr(f.value) && !valStr(f.value).startsWith('?')).length;

  const copyField = async (field: FormField) => {
    await navigator.clipboard.writeText(field.value);
    setCopiedField(field.id);
    setTimeout(() => setCopiedField(null), 1500);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-brand-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-text-primary">Review Form Data</h3>
            <p className="text-xs text-text-secondary">{summary}</p>
          </div>
          <Badge variant={hasIssues ? 'destructive' : 'secondary'} className="text-[10px]">
            {filledCount}/{fields.length} fields ready
          </Badge>
        </div>
      </div>

      {/* Fields */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {Object.entries(sections).map(([section, sectionFields]) => (
          <div key={section}>
            <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-text-secondary">
              {section}
            </h4>
            <div className="space-y-2">
              {sectionFields.map(field => {
                const isEditing = editingField === field.id;
                const fv = valStr(field.value);
                const needsAttention = !fv || fv.startsWith('?');

                return (
                  <div
                    key={field.id}
                    className={cn(
                      'rounded-lg border p-3 transition-colors',
                      needsAttention ? 'border-deadline-warning bg-amber-50' : 'border-brand-border bg-white'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          {needsAttention
                            ? <AlertCircle className="h-3.5 w-3.5 text-deadline-warning shrink-0" />
                            : <CheckCircle2 className="h-3.5 w-3.5 text-deadline-safe shrink-0" />
                          }
                          <span className="text-xs font-semibold text-text-primary">{field.label}</span>
                          {field.required && <span className="text-[10px] text-deadline-urgent">*</span>}
                        </div>

                        {isEditing ? (
                          <div className="mt-1.5 flex gap-1.5">
                            <Input
                              defaultValue={fv.replace(/^\?/, '')}
                              className="h-7 text-xs"
                              autoFocus
                              onBlur={e => {
                                onFieldUpdate(field.id, e.target.value);
                                setEditingField(null);
                              }}
                              onKeyDown={e => {
                                if (e.key === 'Enter') {
                                  onFieldUpdate(field.id, (e.target as HTMLInputElement).value);
                                  setEditingField(null);
                                }
                              }}
                            />
                          </div>
                        ) : (
                          <p className={cn(
                            'mt-0.5 text-sm',
                            needsAttention ? 'text-deadline-warning italic' : 'text-text-primary font-medium'
                          )}>
                            {fv || 'Not provided'}
                          </p>
                        )}

                        {field.helpText && (
                          <p className="mt-0.5 text-[11px] text-text-secondary">{field.helpText}</p>
                        )}
                      </div>

                      <div className="flex gap-0.5 shrink-0">
                        <button
                          onClick={() => setEditingField(isEditing ? null : field.id)}
                          className="rounded p-1 text-text-secondary hover:bg-brand-ghost hover:text-text-primary"
                          title="Edit"
                        >
                          <Edit3 className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => copyField(field)}
                          className="rounded p-1 text-text-secondary hover:bg-brand-ghost hover:text-text-primary"
                          title="Copy value"
                        >
                          {copiedField === field.id
                            ? <Check className="h-3 w-3 text-deadline-safe" />
                            : <Copy className="h-3 w-3" />
                          }
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 border-t border-brand-border p-4">
        <Button variant="outline" size="sm" onClick={onBack} className="text-xs">
          ← Back to chat
        </Button>
        <div className="flex-1" />
        <Button
          size="sm"
          onClick={onConfirm}
          className="bg-brand-accent hover:bg-blue-600 text-xs gap-1.5"
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          Confirm & Launch Agent
        </Button>
      </div>
    </div>
  );
}
