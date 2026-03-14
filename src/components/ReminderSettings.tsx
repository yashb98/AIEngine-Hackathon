'use client';

import { useState, useEffect, useMemo } from 'react';
import { Bell, Clock, Save, Mail, CheckCircle2, XCircle, Loader2, Send, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { getReminderPrefs, saveReminderPrefs, getProfile } from '@/lib/storage';
import { CATEGORY_CONFIG } from '@/lib/types';
import type { ReminderPreferences, RegCategory, Deadline } from '@/lib/types';

const DEFAULT_PREFS: ReminderPreferences = {
  email: '',
  enabled: false,
  timing: { days30: false, days14: true, days7: true, days2: true },
  categories: {
    hmrc: true,
    companies_house: true,
    council: true,
    employment: true,
    food_safety: true,
    data: true,
    scottish: true,
  },
  selectedDeadlines: [],
};

interface ReminderSettingsProps {
  deadlines: Deadline[];
  onClose: () => void;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'email-sent' | 'email-error';

export function ReminderSettings({ deadlines, onClose }: ReminderSettingsProps) {
  const [prefs, setPrefs] = useState<ReminderPreferences>(DEFAULT_PREFS);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [previousEmail, setPreviousEmail] = useState<string | null>(null);

  useEffect(() => {
    const existing = getReminderPrefs();
    if (existing) {
      setPrefs({
        ...DEFAULT_PREFS,
        ...existing,
        selectedDeadlines: existing.selectedDeadlines ?? [],
      });
      if (existing.emailConfirmedAt && existing.email) {
        setPreviousEmail(existing.email);
      }
    }
  }, []);

  const groupedDeadlines = useMemo(() => {
    const groups: Record<RegCategory, Deadline[]> = {} as Record<RegCategory, Deadline[]>;
    for (const d of deadlines) {
      if (!groups[d.category]) groups[d.category] = [];
      groups[d.category].push(d);
    }
    return groups;
  }, [deadlines]);

  const toggleDeadline = (id: string) => {
    setPrefs(p => {
      const selected = new Set(p.selectedDeadlines);
      if (selected.has(id)) selected.delete(id);
      else selected.add(id);
      return { ...p, selectedDeadlines: [...selected] };
    });
  };

  const selectAllInCategory = (category: RegCategory) => {
    const ids = groupedDeadlines[category]?.map(d => d.id) ?? [];
    setPrefs(p => {
      const selected = new Set(p.selectedDeadlines);
      const allSelected = ids.every(id => selected.has(id));
      if (allSelected) {
        ids.forEach(id => selected.delete(id));
      } else {
        ids.forEach(id => selected.add(id));
      }
      return { ...p, selectedDeadlines: [...selected] };
    });
  };

  const selectAll = () => {
    const allIds = deadlines.map(d => d.id);
    setPrefs(p => {
      const allSelected = allIds.length === p.selectedDeadlines.length;
      return { ...p, selectedDeadlines: allSelected ? [] : allIds };
    });
  };

  const isFirstTimeEmail = !previousEmail && prefs.email.trim().length > 0;
  const isEmailChanged = previousEmail && prefs.email.trim() !== previousEmail;

  const handleSave = async () => {
    setSaveStatus('saving');

    const shouldSendEmail =
      prefs.enabled &&
      prefs.email.trim().length > 0 &&
      prefs.selectedDeadlines.length > 0 &&
      (isFirstTimeEmail || isEmailChanged);

    const updatedPrefs = { ...prefs };

    if (shouldSendEmail) {
      try {
        const profile = getProfile();
        const res = await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prefs,
            deadlines,
            businessName: profile?.businessName ?? 'Your Business',
          }),
        });

        if (res.ok) {
          updatedPrefs.emailConfirmedAt = new Date().toISOString();
          saveReminderPrefs(updatedPrefs);
          setPrefs(updatedPrefs);
          setPreviousEmail(updatedPrefs.email);
          setSaveStatus('email-sent');
          setTimeout(() => setSaveStatus('idle'), 4000);
          return;
        }
        const err = await res.json().catch(() => ({}));
        console.error('Email API error:', err);
        saveReminderPrefs(updatedPrefs);
        setSaveStatus('email-error');
        setTimeout(() => setSaveStatus('idle'), 4000);
        return;
      } catch (e) {
        console.error('Failed to send email:', e);
        saveReminderPrefs(updatedPrefs);
        setSaveStatus('email-error');
        setTimeout(() => setSaveStatus('idle'), 4000);
        return;
      }
    }

    saveReminderPrefs(updatedPrefs);
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const allSelected = deadlines.length > 0 && prefs.selectedDeadlines.length === deadlines.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/30" onClick={onClose}>
      <div
        className="h-full w-full max-w-md overflow-y-auto bg-white shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center gap-2 border-b bg-white px-5 py-4">
          <Bell className="h-5 w-5 text-brand-accent" />
          <h2 className="text-lg font-bold text-text-primary">Reminder Settings</h2>
          <div className="flex-1" />
          <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
        </div>

        <div className="space-y-6 p-5">
          {/* Email */}
          <div>
            <Label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold">
              <Mail className="h-4 w-4" /> Email Address
            </Label>
            <Input
              type="email"
              placeholder="you@gmail.com"
              value={prefs.email}
              onChange={e => setPrefs(p => ({ ...p, email: e.target.value }))}
            />
            {previousEmail && (
              <p className="mt-1 text-[11px] text-text-secondary">
                Confirmed: {previousEmail}
              </p>
            )}
          </div>

          {/* Master toggle */}
          <div className="flex items-center justify-between rounded-lg bg-brand-ghost p-3">
            <Label className="text-sm font-semibold">Enable Email Reminders</Label>
            <Switch
              checked={prefs.enabled}
              onCheckedChange={v => setPrefs(p => ({ ...p, enabled: v }))}
            />
          </div>

          {/* Timing */}
          <div>
            <Label className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
              <Clock className="h-4 w-4" /> Remind Me Before Deadline
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {([['days30', '30 days'], ['days14', '14 days'], ['days7', '7 days'], ['days2', '2 days']] as const).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between rounded-md border px-3 py-2">
                  <span className="text-sm">{label}</span>
                  <Switch
                    checked={prefs.timing[key]}
                    onCheckedChange={v => setPrefs(p => ({ ...p, timing: { ...p.timing, [key]: v } }))}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <Label className="mb-2 text-sm font-semibold">Categories to Monitor</Label>
            <div className="space-y-1.5">
              {(Object.entries(CATEGORY_CONFIG) as [RegCategory, typeof CATEGORY_CONFIG[RegCategory]][]).map(([key, config]) => (
                <div key={key} className="flex items-center justify-between rounded-md border px-3 py-2">
                  <span className="text-sm">
                    {config.icon} {config.label}
                  </span>
                  <Switch
                    checked={prefs.categories[key]}
                    onCheckedChange={v => setPrefs(p => ({ ...p, categories: { ...p.categories, [key]: v } }))}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Deadline Selection */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label className="text-sm font-semibold">Select Deadlines &amp; Licences</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={selectAll}
                className="h-auto px-2 py-1 text-xs text-brand-accent"
              >
                {allSelected ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
            <p className="mb-3 text-xs text-text-secondary">
              Choose which deadlines and licences you want to receive email reminders for.
            </p>

            <div className="space-y-4">
              {(Object.entries(groupedDeadlines) as [RegCategory, Deadline[]][]).map(([category, catDeadlines]) => {
                const config = CATEGORY_CONFIG[category];
                const catIds = catDeadlines.map(d => d.id);
                const allCatSelected = catIds.every(id => prefs.selectedDeadlines.includes(id));
                const someCatSelected = catIds.some(id => prefs.selectedDeadlines.includes(id));

                return (
                  <div key={category} className="rounded-lg border border-brand-border overflow-hidden">
                    <div
                      className="flex items-center gap-2 bg-surface-secondary px-3 py-2.5 cursor-pointer"
                      onClick={() => selectAllInCategory(category)}
                    >
                      <Checkbox
                        checked={allCatSelected || someCatSelected}
                        onCheckedChange={() => selectAllInCategory(category)}
                        className="h-4 w-4"
                      />
                      <span className="text-base">{config.icon}</span>
                      <span className="text-sm font-semibold text-text-primary">{config.label}</span>
                      <Badge variant="secondary" className="ml-auto text-[10px]">
                        {catIds.filter(id => prefs.selectedDeadlines.includes(id)).length}/{catIds.length}
                      </Badge>
                    </div>
                    <div className="divide-y divide-brand-border/50">
                      {catDeadlines
                        .sort((a, b) => {
                          if (!a.dueDate) return 1;
                          if (!b.dueDate) return -1;
                          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                        })
                        .map(d => {
                          const isSelected = prefs.selectedDeadlines.includes(d.id);
                          const daysUntil = d.dueDate
                            ? Math.ceil((new Date(d.dueDate).getTime() - Date.now()) / 86400000)
                            : null;
                          const dateLabel = d.dueDate
                            ? new Date(d.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                            : 'Ongoing';

                          return (
                            <label
                              key={d.id}
                              className="flex items-start gap-2.5 px-3 py-2.5 cursor-pointer hover:bg-surface-secondary/50 transition-colors"
                            >
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => toggleDeadline(d.id)}
                                className="mt-0.5 h-4 w-4 shrink-0"
                              />
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-text-primary leading-tight">{d.title}</p>
                                <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-text-secondary">
                                  <span>{dateLabel}</span>
                                  {daysUntil !== null && (
                                    <span className={
                                      daysUntil < 0
                                        ? 'font-semibold text-deadline-overdue'
                                        : daysUntil <= 7
                                        ? 'font-semibold text-deadline-urgent'
                                        : daysUntil <= 30
                                        ? 'text-deadline-warning'
                                        : 'text-deadline-safe'
                                    }>
                                      {daysUntil < 0
                                        ? `${Math.abs(daysUntil)}d overdue`
                                        : daysUntil === 0
                                        ? 'Due today'
                                        : `In ${daysUntil}d`}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </label>
                          );
                        })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Preview */}
          {prefs.selectedDeadlines.length > 0 && (
            <div className="rounded-lg bg-brand-ghost p-3">
              <p className="text-xs font-semibold text-text-primary mb-1">
                {prefs.selectedDeadlines.length} reminder{prefs.selectedDeadlines.length !== 1 ? 's' : ''} selected
              </p>
              <p className="text-[11px] text-text-secondary">
                {isFirstTimeEmail
                  ? 'Saving will send a confirmation email with your selected reminders.'
                  : isEmailChanged
                  ? 'Email changed — saving will re-send the confirmation to your new address.'
                  : 'Your reminder preferences will be updated.'}
              </p>
            </div>
          )}

          {/* Status messages */}
          {saveStatus === 'email-sent' && (
            <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-3 py-2.5">
              <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
              <p className="text-xs text-green-800">
                Confirmation email sent to <strong>{prefs.email}</strong> with your {prefs.selectedDeadlines.length} selected reminders.
              </p>
            </div>
          )}

          {saveStatus === 'email-error' && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5">
              <XCircle className="h-4 w-4 text-red-500 shrink-0" />
              <p className="text-xs text-red-700">
                Preferences saved, but the confirmation email could not be sent. Check that RESEND_API_KEY is configured.
              </p>
            </div>
          )}

          {/* Save */}
          <Button
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
            className="w-full bg-brand-accent hover:bg-blue-600"
          >
            {saveStatus === 'saving' && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
            {saveStatus === 'saved' && <Check className="mr-1.5 h-4 w-4" />}
            {saveStatus === 'email-sent' && <Send className="mr-1.5 h-4 w-4" />}
            {saveStatus === 'idle' && <Save className="mr-1.5 h-4 w-4" />}
            {saveStatus === 'saving'
              ? 'Saving & sending email...'
              : saveStatus === 'saved'
              ? 'Saved!'
              : saveStatus === 'email-sent'
              ? 'Saved & Email Sent!'
              : saveStatus === 'email-error'
              ? 'Saved (email failed)'
              : isFirstTimeEmail && prefs.enabled && prefs.selectedDeadlines.length > 0
              ? 'Save & Send Confirmation Email'
              : 'Save Preferences'}
          </Button>
        </div>
      </div>
    </div>
  );
}
