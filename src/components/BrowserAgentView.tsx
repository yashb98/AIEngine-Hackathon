'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Monitor, Globe, MousePointer2, Type, CheckCircle2,
  Loader2, ExternalLink, AlertTriangle, RotateCcw,
  Eye, Pause, Play, SkipForward,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { FormField } from '@/lib/types';

interface AgentStep {
  id: number;
  action: 'navigate' | 'click' | 'type' | 'select' | 'verify' | 'wait' | 'scroll' | 'submit';
  target: string;
  value?: string;
  description: string;
  status: 'pending' | 'running' | 'done' | 'error';
  fieldId?: string;
}

interface BrowserAgentViewProps {
  fields: FormField[];
  portalUrl: string;
  filingType: string;
  onComplete: () => void;
  onBack: () => void;
}

function generateSteps(fields: FormField[], portalUrl: string, filingType: string): AgentStep[] {
  let stepId = 0;
  const steps: AgentStep[] = [];

  steps.push({
    id: stepId++,
    action: 'navigate',
    target: portalUrl,
    description: `Opening ${filingType} portal`,
    status: 'pending',
  });

  steps.push({
    id: stepId++,
    action: 'wait',
    target: 'page',
    description: 'Waiting for page to load',
    status: 'pending',
  });

  steps.push({
    id: stepId++,
    action: 'click',
    target: 'Login / Start Filing button',
    description: 'Clicking to start the filing process',
    status: 'pending',
  });

  const sections = fields.reduce((acc, f) => {
    (acc[f.section] ??= []).push(f);
    return acc;
  }, {} as Record<string, FormField[]>);

  for (const [section, sectionFields] of Object.entries(sections)) {
    steps.push({
      id: stepId++,
      action: 'scroll',
      target: section,
      description: `Navigating to "${section}" section`,
      status: 'pending',
    });

    for (const field of sectionFields) {
      if (field.fieldType === 'checkbox') {
        steps.push({
          id: stepId++,
          action: 'click',
          target: `checkbox: ${field.label}`,
          value: field.value,
          description: `${field.value === 'true' ? 'Checking' : 'Unchecking'} "${field.label}"`,
          status: 'pending',
          fieldId: field.id,
        });
      } else if (field.fieldType === 'select') {
        steps.push({
          id: stepId++,
          action: 'select',
          target: `dropdown: ${field.label}`,
          value: field.value,
          description: `Selecting "${field.value}" in "${field.label}"`,
          status: 'pending',
          fieldId: field.id,
        });
      } else {
        steps.push({
          id: stepId++,
          action: 'click',
          target: `input: ${field.label}`,
          description: `Clicking on "${field.label}" field`,
          status: 'pending',
          fieldId: field.id,
        });
        steps.push({
          id: stepId++,
          action: 'type',
          target: `input: ${field.label}`,
          value: field.value,
          description: `Typing "${field.value}" into "${field.label}"`,
          status: 'pending',
          fieldId: field.id,
        });
      }
    }
  }

  steps.push({
    id: stepId++,
    action: 'verify',
    target: 'all fields',
    description: 'Verifying all fields are correctly filled',
    status: 'pending',
  });

  steps.push({
    id: stepId++,
    action: 'scroll',
    target: 'submit section',
    description: 'Scrolling to submission area',
    status: 'pending',
  });

  steps.push({
    id: stepId++,
    action: 'wait',
    target: 'user',
    description: 'PAUSED — Waiting for your approval before submitting',
    status: 'pending',
  });

  return steps;
}

const actionIcons: Record<AgentStep['action'], typeof Globe> = {
  navigate: Globe,
  click: MousePointer2,
  type: Type,
  select: MousePointer2,
  verify: Eye,
  wait: Pause,
  scroll: Monitor,
  submit: CheckCircle2,
};

export function BrowserAgentView({ fields, portalUrl, filingType, onComplete, onBack }: BrowserAgentViewProps) {
  const [steps, setSteps] = useState<AgentStep[]>(() => generateSteps(fields, portalUrl, filingType));
  const [currentIdx, setCurrentIdx] = useState(-1);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [browserUrl, setBrowserUrl] = useState('about:blank');

  const runNextStep = useCallback(() => {
    setCurrentIdx(prev => {
      const next = prev + 1;
      if (next >= steps.length) {
        setIsRunning(false);
        return prev;
      }

      setSteps(s => s.map((step, i) =>
        i === next ? { ...step, status: 'running' as const }
          : i < next ? { ...step, status: 'done' as const }
            : step
      ));

      const step = steps[next];
      if (step?.action === 'navigate') {
        setBrowserUrl(step.target);
      }

      if (step?.action === 'wait' && step.target === 'user') {
        setIsPaused(true);
        setIsRunning(false);
      }

      return next;
    });
  }, [steps]);

  useEffect(() => {
    if (!isRunning || isPaused) return;

    const speed = steps[currentIdx]?.action === 'type' ? 800 : 500;
    const timer = setTimeout(runNextStep, speed);
    return () => clearTimeout(timer);
  }, [isRunning, isPaused, currentIdx, runNextStep, steps]);

  const startAgent = () => {
    setIsRunning(true);
    setIsPaused(false);
    runNextStep();
  };

  const resumeAgent = () => {
    setIsPaused(false);
    setIsRunning(true);
    runNextStep();
  };

  const skipToEnd = () => {
    setSteps(s => s.map(step => ({ ...step, status: 'done' as const })));
    setCurrentIdx(steps.length - 1);
    setIsRunning(false);
    setIsPaused(false);
  };

  const restartAgent = () => {
    setSteps(generateSteps(fields, portalUrl, filingType));
    setCurrentIdx(-1);
    setIsRunning(false);
    setIsPaused(false);
    setBrowserUrl('about:blank');
  };

  const allDone = steps.every(s => s.status === 'done');
  const currentStep = currentIdx >= 0 ? steps[currentIdx] : null;
  const completedCount = steps.filter(s => s.status === 'done').length;

  return (
    <div className="flex h-full flex-col">
      {/* Browser chrome mockup */}
      <div className="border-b border-brand-border bg-gray-100 px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
            <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
            <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 flex items-center gap-1.5 rounded-md bg-white border px-2.5 py-1 text-xs text-text-secondary">
            <Globe className="h-3 w-3 shrink-0" />
            <span className="truncate">{browserUrl}</span>
          </div>
          <Badge variant="secondary" className="text-[10px] shrink-0">
            {completedCount}/{steps.length}
          </Badge>
        </div>
      </div>

      {/* Browser viewport */}
      <div className="flex-1 overflow-hidden flex">
        {/* Simulated page area */}
        <div className="flex-1 bg-white p-4 overflow-y-auto">
          {currentIdx < 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <Monitor className="mb-3 h-12 w-12 text-brand-accent" />
              <h3 className="mb-1 text-lg font-bold text-text-primary">Browser Agent Ready</h3>
              <p className="mb-4 max-w-xs text-sm text-text-secondary">
                The agent will open the {filingType} portal and fill in {fields.length} fields automatically. You can review before submission.
              </p>
              <Button onClick={startAgent} className="bg-brand-accent hover:bg-blue-600 gap-1.5">
                <Play className="h-4 w-4" /> Start Agent
              </Button>
            </div>
          ) : allDone ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <CheckCircle2 className="mb-3 h-12 w-12 text-deadline-safe" />
              <h3 className="mb-1 text-lg font-bold text-text-primary">All Fields Filled</h3>
              <p className="mb-2 max-w-xs text-sm text-text-secondary">
                The agent has filled all {fields.length} fields on the {filingType} form. Review the entries on the portal before submitting.
              </p>
              <div className="flex gap-2 mt-2">
                <Button variant="outline" size="sm" onClick={restartAgent} className="gap-1">
                  <RotateCcw className="h-3.5 w-3.5" /> Restart
                </Button>
                <a href={portalUrl} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" className="bg-brand-accent hover:bg-blue-600 gap-1">
                    Open Real Portal <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </a>
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center">
              {/* Current action visualization */}
              <div className="mb-4 w-full max-w-sm">
                {currentStep && (
                  <div className="rounded-lg border-2 border-brand-accent bg-blue-50 p-4 text-center">
                    {(() => {
                      const Icon = actionIcons[currentStep.action];
                      return <Icon className="mx-auto mb-2 h-8 w-8 text-brand-accent" />;
                    })()}
                    <p className="text-sm font-semibold text-text-primary">{currentStep.description}</p>
                    {currentStep.value && (
                      <div className="mt-2 rounded-md bg-white border px-3 py-1.5 text-xs font-mono text-brand-accent">
                        {currentStep.value}
                      </div>
                    )}
                    {currentStep.action === 'type' && (
                      <div className="mt-2 flex justify-center">
                        <span className="inline-block h-4 w-0.5 animate-pulse bg-brand-accent" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Pause/skip controls */}
              {isPaused ? (
                <div className="space-y-2 text-center">
                  <AlertTriangle className="mx-auto h-6 w-6 text-deadline-warning" />
                  <p className="text-sm font-semibold text-text-primary">Agent Paused</p>
                  <p className="text-xs text-text-secondary max-w-xs">
                    All fields have been filled. Review the form in the portal, then approve to continue or go back to make changes.
                  </p>
                  <div className="flex gap-2 justify-center mt-2">
                    <Button variant="outline" size="sm" onClick={onBack} className="text-xs">
                      ← Edit Fields
                    </Button>
                    <Button size="sm" onClick={resumeAgent} className="bg-deadline-safe hover:bg-green-700 text-xs gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Approve & Continue
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => { setIsPaused(true); setIsRunning(false); }} className="text-xs gap-1">
                    <Pause className="h-3 w-3" /> Pause
                  </Button>
                  <Button variant="outline" size="sm" onClick={skipToEnd} className="text-xs gap-1">
                    <SkipForward className="h-3 w-3" /> Skip to End
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Step log sidebar */}
        <div className="w-56 shrink-0 border-l border-brand-border bg-gray-50 overflow-y-auto">
          <div className="sticky top-0 bg-gray-50 border-b px-3 py-2">
            <p className="text-[11px] font-bold text-text-secondary uppercase tracking-wide">Agent Log</p>
          </div>
          <div className="p-2 space-y-0.5">
            {steps.map((step, i) => {
              const Icon = actionIcons[step.action];
              return (
                <div
                  key={step.id}
                  className={cn(
                    'flex items-start gap-1.5 rounded-md px-2 py-1 text-[11px] transition-colors',
                    step.status === 'running' && 'bg-blue-100 text-brand-accent font-medium',
                    step.status === 'done' && 'text-text-secondary',
                    step.status === 'pending' && 'text-gray-400',
                    step.status === 'error' && 'bg-red-50 text-deadline-urgent',
                    i === currentIdx && 'ring-1 ring-brand-accent'
                  )}
                >
                  <div className="shrink-0 mt-0.5">
                    {step.status === 'running' ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : step.status === 'done' ? (
                      <CheckCircle2 className="h-3 w-3 text-deadline-safe" />
                    ) : (
                      <Icon className="h-3 w-3" />
                    )}
                  </div>
                  <span className="leading-tight">{step.description}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 border-t border-brand-border px-4 py-2 bg-gray-50">
        <Button variant="ghost" size="sm" onClick={onBack} className="text-xs">
          ← Back
        </Button>
        <div className="flex-1 text-center text-[11px] text-text-secondary">
          {isRunning && !isPaused && (
            <span className="inline-flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              Agent running...
            </span>
          )}
          {allDone && 'Agent completed all steps'}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onComplete}
          className="text-xs"
        >
          Done
        </Button>
      </div>
    </div>
  );
}
