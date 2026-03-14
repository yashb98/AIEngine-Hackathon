'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Download, Bell, Shield, Search, FileCheck, BookOpen, Scale } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/StatCard';
import { DeadlineTimeline } from '@/components/DeadlineTimeline';
import { ComplianceMap } from '@/components/ComplianceMap';
import { ComplianceChat } from '@/components/ComplianceChat';
import { GuidedFiling } from '@/components/GuidedFiling';
import { RegChangeAlerts } from '@/components/RegChangeAlert';
import { ReminderSettings } from '@/components/ReminderSettings';
import { getProfile, getComplianceMap, saveComplianceMap } from '@/lib/storage';
import { FALLBACK_COMPLIANCE_MAP } from '@/lib/fallback';
import type { ComplianceMap as ComplianceMapType, RegulationChange } from '@/lib/types';

const LOADING_STEPS = [
  { icon: Search, text: 'Analysing your business profile...' },
  { icon: BookOpen, text: 'Checking HMRC, Companies House & FSS regulations...' },
  { icon: Scale, text: 'Mapping Scottish licensing obligations...' },
  { icon: FileCheck, text: 'Calculating real deadlines & penalties...' },
  { icon: Shield, text: 'Building your compliance dashboard...' },
];

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<ComplianceMapType | null>(null);
  const [loading, setLoading] = useState(true);
  const [regChanges, setRegChanges] = useState<RegulationChange[]>([]);
  const [showReminders, setShowReminders] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  useEffect(() => {
    const profile = getProfile();
    if (!profile?.onboardingComplete) {
      router.push('/');
      return;
    }

    const cached = getComplianceMap();
    if (cached) {
      setData(cached);
      setLoading(false);
      fetchMonitor(profile);
      return;
    }

    // Animate through loading steps
    const stepInterval = setInterval(() => {
      setLoadingStep(prev => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
    }, 3000);

    const generate = async () => {
      try {
        const res = await fetch('/api/compliance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profile }),
        });
        if (!res.ok) throw new Error('API error');
        const map = await res.json();
        const full = { ...map, profile };
        saveComplianceMap(full);
        setData(full);
      } catch {
        const fallback = { ...FALLBACK_COMPLIANCE_MAP, profile };
        saveComplianceMap(fallback);
        setData(fallback);
      } finally {
        clearInterval(stepInterval);
        setLoading(false);
      }
    };

    generate();
    fetchMonitor(profile);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const fetchMonitor = async (profile: unknown) => {
    try {
      const res = await fetch('/api/monitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile }),
      });
      if (res.ok) {
        const { changes } = await res.json();
        setRegChanges(changes ?? []);
      }
    } catch {
      // silent fail
    }
  };

  if (loading) {
    const CurrentIcon = LOADING_STEPS[loadingStep].icon;
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-surface-secondary">
        <div className="mx-4 w-full max-w-md">
          {/* Animated card */}
          <div className="rounded-2xl border border-brand-border/60 bg-white p-8 shadow-lg">
            {/* Pulsing shield */}
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand-accent/10">
              <div className="relative">
                <div className="absolute inset-0 animate-ping rounded-full bg-brand-accent/20" />
                <Shield className="relative h-10 w-10 text-brand-accent" />
              </div>
            </div>

            <h2 className="text-center text-xl font-bold text-brand-dark mb-2">
              Building your compliance map
            </h2>
            <p className="text-center text-sm text-brand-light mb-8">
              Our AI is checking every regulation that applies to your business
            </p>

            {/* Step progress */}
            <div className="space-y-3">
              {LOADING_STEPS.map((step, i) => {
                const StepIcon = step.icon;
                const isActive = i === loadingStep;
                const isDone = i < loadingStep;

                return (
                  <div
                    key={i}
                    className={`flex items-center gap-3 rounded-lg px-4 py-2.5 transition-all duration-500 ${
                      isActive
                        ? 'bg-brand-accent/10 border border-brand-accent/30'
                        : isDone
                        ? 'bg-deadline-safe/5 border border-transparent'
                        : 'border border-transparent opacity-40'
                    }`}
                  >
                    <div className={`shrink-0 ${isActive ? 'animate-pulse' : ''}`}>
                      <StepIcon className={`h-4 w-4 ${
                        isActive ? 'text-brand-accent' : isDone ? 'text-deadline-safe' : 'text-brand-light'
                      }`} />
                    </div>
                    <span className={`text-sm ${
                      isActive ? 'font-medium text-brand-dark' : isDone ? 'text-deadline-safe' : 'text-brand-light'
                    }`}>
                      {step.text}
                    </span>
                    {isDone && (
                      <span className="ml-auto text-xs text-deadline-safe font-medium">Done</span>
                    )}
                    {isActive && (
                      <div className="ml-auto flex gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-accent animate-bounce [animation-delay:0ms]" />
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-accent animate-bounce [animation-delay:150ms]" />
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-accent animate-bounce [animation-delay:300ms]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Progress bar */}
            <div className="mt-6 h-1.5 rounded-full bg-brand-ghost overflow-hidden">
              <div
                className="h-full rounded-full bg-brand-accent transition-all duration-1000 ease-out"
                style={{ width: `${((loadingStep + 1) / LOADING_STEPS.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const urgentCount = data.deadlines.filter(d => d.severity === 'overdue' || d.severity === 'urgent').length;
  const nextDeadline = data.deadlines
    .filter(d => d.dueDate)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())[0];

  const nextLabel = nextDeadline
    ? (() => {
        const days = Math.ceil(
          (new Date(nextDeadline.dueDate!).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        return days < 0 ? `${Math.abs(days)}d overdue` : `${days} days`;
      })()
    : 'None';

  return (
    <div className="bg-surface-secondary min-h-[calc(100vh-4rem)]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">{data.profile.businessName}</h2>
            <p className="text-text-secondary">{data.summary}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowReminders(true)}
              className="gap-1.5"
            >
              <Bell className="h-4 w-4" /> Reminders
            </Button>
            <Link
              href="/report"
              prefetch={true}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1 text-sm font-medium hover:bg-muted transition"
            >
              <Download className="h-4 w-4" /> Report
            </Link>
          </div>
        </div>

        {/* Regulation Changes */}
        <RegChangeAlerts changes={regChanges} />

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total Obligations" value={data.obligations.length} />
          <StatCard
            label="Urgent Items"
            value={urgentCount}
            color={urgentCount > 0 ? 'urgent' : 'safe'}
          />
          <StatCard
            label="Next Deadline"
            value={nextLabel}
            color={nextDeadline?.severity === 'urgent' || nextDeadline?.severity === 'overdue' ? 'urgent' : 'default'}
          />
          <StatCard
            label="Risk Score"
            value={`${data.riskScore}/100`}
            color={data.riskScore > 60 ? 'urgent' : data.riskScore > 30 ? 'warning' : 'safe'}
          />
        </div>

        {/* Tabs — full width */}
        <Tabs defaultValue="deadlines">
          <TabsList className="mb-4 w-full grid grid-cols-4">
            <TabsTrigger value="deadlines">Deadlines</TabsTrigger>
            <TabsTrigger value="map">Compliance Map</TabsTrigger>
            <TabsTrigger value="chat">Ask RegBot</TabsTrigger>
            <TabsTrigger value="filing">File Now</TabsTrigger>
          </TabsList>

          <TabsContent value="deadlines">
            <DeadlineTimeline deadlines={data.deadlines} />
          </TabsContent>

          <TabsContent value="map">
            <ComplianceMap obligations={data.obligations} />
          </TabsContent>

          <TabsContent value="chat">
            <div className="rounded-xl border border-brand-border bg-white shadow-sm overflow-hidden">
              <ComplianceChat />
            </div>
          </TabsContent>

          <TabsContent value="filing">
            <div className="rounded-xl border border-brand-border bg-white shadow-sm overflow-hidden">
              <GuidedFiling />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Reminder Settings Slide-over */}
      {showReminders && (
        <ReminderSettings
          deadlines={data.deadlines}
          onClose={() => setShowReminders(false)}
        />
      )}
    </div>
  );
}
