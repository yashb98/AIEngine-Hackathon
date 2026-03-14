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
        saveReminderPrefs(prefs);
        setSaveStatus('email-error');
        setTimeout(() => setSaveStatus('idle'), 4000);
        return;
      } catch {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/30" onClick={onClose}>
      <div
        className="h-full w-full max-w-md overflow-y-auto bg-white shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center gap-2 border-b bg-white px-5 py-4">
          <Bell className="h-5 w-5 text-brand-accent" />
          <h2 className="text-lg font-bold text-text-primary">Daily Reminders</h2>
          <div className="flex-1" />
          <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
        </div>

        <div className="space-y-6 p-5">
          {/* Already active */}
          {previousEmail && (
            <div className="flex items-center gap-2 rounded-lg bg-deadline-safe/10 border border-deadline-safe/30 px-4 py-3">
              <CheckCircle2 className="h-5 w-5 text-deadline-safe shrink-0" />
              <div>
                <p className="text-sm font-semibold text-brand-dark">Reminders active</p>
                <p className="text-xs text-brand-light">
                  You&apos;ll receive daily compliance reminders at <strong>{previousEmail}</strong> every morning.
                </p>
              </div>
            </div>
          )}

          {/* Email input */}
          <div>
            <Label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold">
              <Mail className="h-4 w-4" /> {previousEmail ? 'Update email' : 'Enter your email'}
            </Label>
            <Input
              type="email"
              placeholder="you@gmail.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          {/* Status messages */}
          {saveStatus === 'email-sent' && (
            <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-3 py-2.5">
              <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
              <p className="text-sm text-green-800">
                You&apos;ve been added for daily reminders. You&apos;ll get an email every single day with all your deadlines.
              </p>
            </div>
          )}

          {saveStatus === 'email-error' && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5">
              <XCircle className="h-4 w-4 text-red-500 shrink-0" />
              <p className="text-xs text-red-700">
                Saved, but confirmation email failed. Check RESEND_API_KEY.
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
              ? 'Activating...'
              : saveStatus === 'saved'
              ? 'Saved!'
              : saveStatus === 'email-sent'
              ? 'Done!'
              : previousEmail
              ? 'Update Email'
              : 'Activate Daily Reminders'}
          </Button>

          <p className="text-xs text-center text-text-secondary">
            All {deadlines.length} deadlines are tracked. You&apos;ll get reminders every single day.
          </p>
        </div>
      </div>
    </div>
  );
}
