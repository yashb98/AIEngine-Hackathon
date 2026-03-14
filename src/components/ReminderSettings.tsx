'use client';

import { useState, useEffect } from 'react';
import { Bell, Mail, CheckCircle2, XCircle, Loader2, Send, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getReminderPrefs, saveReminderPrefs, getProfile } from '@/lib/storage';
import type { ReminderPreferences, Deadline } from '@/lib/types';

const DEFAULT_PREFS: ReminderPreferences = {
  email: '',
  enabled: true,
  timing: { days30: true, days14: true, days7: true, days2: true },
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
  const [email, setEmail] = useState('');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [previousEmail, setPreviousEmail] = useState<string | null>(null);

  useEffect(() => {
    const existing = getReminderPrefs();
    if (existing) {
      setEmail(existing.email || '');
      if (existing.emailConfirmedAt && existing.email) {
        setPreviousEmail(existing.email);
      }
    }
  }, []);

  const handleSave = async () => {
    if (!email.trim()) return;
    setSaveStatus('saving');

    // Auto-select ALL deadlines — no user selection needed
    const allDeadlineIds = deadlines.map(d => d.id);
    const prefs: ReminderPreferences = {
      ...DEFAULT_PREFS,
      email: email.trim(),
      enabled: true,
      selectedDeadlines: allDeadlineIds,
    };

    const isNewOrChanged = !previousEmail || email.trim() !== previousEmail;

    if (isNewOrChanged) {
      try {
        const profile = getProfile();
        const res = await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.trim(),
            deadlines,
            businessName: profile?.businessName ?? 'Your Business',
          }),
        });

        if (res.ok) {
          prefs.emailConfirmedAt = new Date().toISOString();
          saveReminderPrefs(prefs);
          setPreviousEmail(email.trim());
          setSaveStatus('email-sent');
          setTimeout(() => setSaveStatus('idle'), 4000);
          return;
        }
        console.error('Email API error:', await res.json().catch(() => ({})));
        saveReminderPrefs(prefs);
        setSaveStatus('email-error');
        setTimeout(() => setSaveStatus('idle'), 4000);
        return;
      } catch (e) {
        console.error('Failed to send email:', e);
        saveReminderPrefs(prefs);
        setSaveStatus('email-error');
        setTimeout(() => setSaveStatus('idle'), 4000);
        return;
      }
    }

    saveReminderPrefs(prefs);
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const urgentDeadlines = deadlines
    .filter(d => d.dueDate)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 5);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/30" onClick={onClose}>
      <div
        className="h-full w-full max-w-md overflow-y-auto bg-white shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center gap-2 border-b bg-white px-5 py-4">
          <Bell className="h-5 w-5 text-brand-accent" />
          <h2 className="text-lg font-bold text-text-primary">Daily Compliance Digest</h2>
          <div className="flex-1" />
          <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
        </div>

        <div className="space-y-6 p-5">
          {/* Explanation */}
          <div className="rounded-xl bg-brand-ghost p-4">
            <h3 className="text-sm font-semibold text-brand-dark mb-2">How it works</h3>
            <ul className="space-y-2 text-sm text-brand-light">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-brand-accent">•</span>
                Every morning at <strong className="text-brand-dark">8:00 AM</strong>, our AI checks all your compliance deadlines
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-brand-accent">•</span>
                You receive an email with <strong className="text-brand-dark">every licence & filing</strong> that needs attention
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-brand-accent">•</span>
                Each deadline includes its <strong className="text-brand-dark">due date, penalty, and direct link</strong> to file
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-brand-accent">•</span>
                No setup, no selection — <strong className="text-brand-dark">everything is covered automatically</strong>
              </li>
            </ul>
          </div>

          {/* Email input */}
          <div>
            <Label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold">
              <Mail className="h-4 w-4" /> Your Email Address
            </Label>
            <Input
              type="email"
              placeholder="you@gmail.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            {previousEmail && (
              <p className="mt-1.5 flex items-center gap-1 text-[11px] text-deadline-safe">
                <CheckCircle2 className="h-3 w-3" />
                Active: {previousEmail} — receiving daily digests
              </p>
            )}
          </div>

          {/* Preview of upcoming deadlines */}
          {urgentDeadlines.length > 0 && (
            <div>
              <Label className="mb-2 text-sm font-semibold">Next deadlines you&apos;ll be notified about</Label>
              <div className="space-y-2">
                {urgentDeadlines.map(d => {
                  const daysUntil = d.dueDate
                    ? Math.ceil((new Date(d.dueDate).getTime() - Date.now()) / 86400000)
                    : null;
                  const dateLabel = d.dueDate
                    ? new Date(d.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                    : 'Ongoing';

                  return (
                    <div key={d.id} className="flex items-center justify-between rounded-lg border border-brand-border/60 px-3 py-2.5">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">{d.title}</p>
                        <p className="text-xs text-text-secondary">{dateLabel}</p>
                      </div>
                      {daysUntil !== null && (
                        <span className={`shrink-0 ml-2 rounded-full px-2 py-0.5 text-xs font-semibold ${
                          daysUntil < 0
                            ? 'bg-deadline-overdue/10 text-deadline-overdue'
                            : daysUntil <= 7
                            ? 'bg-deadline-urgent/10 text-deadline-urgent'
                            : daysUntil <= 30
                            ? 'bg-deadline-warning/10 text-deadline-warning'
                            : 'bg-deadline-safe/10 text-deadline-safe'
                        }`}>
                          {daysUntil < 0 ? `${Math.abs(daysUntil)}d overdue` : daysUntil === 0 ? 'Today' : `${daysUntil}d`}
                        </span>
                      )}
                    </div>
                  );
                })}
                {deadlines.length > 5 && (
                  <p className="text-xs text-text-secondary text-center">
                    + {deadlines.length - 5} more deadlines tracked automatically
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Status messages */}
          {saveStatus === 'email-sent' && (
            <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-3 py-2.5">
              <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
              <p className="text-xs text-green-800">
                Digest activated! Confirmation sent to <strong>{email}</strong>. You&apos;ll receive daily updates at 8:00 AM.
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

          {/* Save button */}
          <Button
            onClick={handleSave}
            disabled={saveStatus === 'saving' || !email.trim()}
            className="w-full bg-brand-accent hover:bg-blue-600"
          >
            {saveStatus === 'saving' && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
            {saveStatus === 'saved' && <CheckCircle2 className="mr-1.5 h-4 w-4" />}
            {saveStatus === 'email-sent' && <Send className="mr-1.5 h-4 w-4" />}
            {saveStatus === 'idle' && <Save className="mr-1.5 h-4 w-4" />}
            {saveStatus === 'saving'
              ? 'Activating daily digest...'
              : saveStatus === 'saved'
              ? 'Saved!'
              : saveStatus === 'email-sent'
              ? 'Digest Activated!'
              : !previousEmail
              ? 'Activate Daily Digest'
              : email.trim() !== previousEmail
              ? 'Update Email & Reactivate'
              : 'Save'}
          </Button>

          <p className="text-[11px] text-center text-text-secondary">
            All {deadlines.length} compliance deadlines are monitored automatically. No selection needed.
          </p>
        </div>
      </div>
    </div>
  );
}
