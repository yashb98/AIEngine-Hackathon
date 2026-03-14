import { BusinessProfile, ComplianceMap, ReminderPreferences } from './types';

const KEYS = {
  profile: 'regbot:profile',
  compliance: 'regbot:compliance',
  reminders: 'regbot:reminders',
} as const;

export function saveProfile(profile: BusinessProfile): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(KEYS.profile, JSON.stringify(profile));
  }
}

export function getProfile(): BusinessProfile | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(KEYS.profile);
  return data ? JSON.parse(data) : null;
}

export function saveComplianceMap(map: ComplianceMap): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(KEYS.compliance, JSON.stringify(map));
  }
}

export function getComplianceMap(): ComplianceMap | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(KEYS.compliance);
  return data ? JSON.parse(data) : null;
}

export function saveReminderPrefs(prefs: ReminderPreferences): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(KEYS.reminders, JSON.stringify(prefs));
  }
}

export function getReminderPrefs(): ReminderPreferences | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(KEYS.reminders);
  return data ? JSON.parse(data) : null;
}

export function hadPreviousEmail(): boolean {
  const prefs = getReminderPrefs();
  return !!(prefs?.email && prefs.emailConfirmedAt);
}

export function clearAll(): void {
  if (typeof window !== 'undefined') {
    Object.values(KEYS).forEach(k => localStorage.removeItem(k));
  }
}
