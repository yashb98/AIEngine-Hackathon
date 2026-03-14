'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Download, Bell } from 'lucide-react';
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

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<ComplianceMapType | null>(null);
  const [loading, setLoading] = useState(true);
  const [regChanges, setRegChanges] = useState<RegulationChange[]>([]);
  const [showReminders, setShowReminders] = useState(false);

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
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-brand-accent" />
          <p className="text-text-secondary">Generating your compliance map...</p>
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
            <Button
              variant="outline"
              size="sm"
              render={<Link href="/report" prefetch={true} />}
              className="gap-1.5"
            >
              <Download className="h-4 w-4" /> Report
            </Button>
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

        {/* Tabs */}
        <Tabs defaultValue="deadlines">
          <TabsList className="mb-4">
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
