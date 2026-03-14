import { Resend } from 'resend';
import { CATEGORY_CONFIG } from '@/lib/types';
import type { Deadline, ReminderPreferences, RegCategory } from '@/lib/types';

let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

interface SendEmailRequest {
  prefs: ReminderPreferences;
  deadlines: Deadline[];
  businessName: string;
}

function severityBadge(severity: string): string {
  const colors: Record<string, string> = {
    overdue: '#991B1B',
    urgent: '#DC2626',
    warning: '#F59E0B',
    safe: '#059669',
  };
  const labels: Record<string, string> = {
    overdue: 'OVERDUE',
    urgent: 'URGENT',
    warning: 'UPCOMING',
    safe: 'ON TRACK',
  };
  return `<span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;color:#fff;background:${colors[severity] || '#6B7280'}">${labels[severity] || severity.toUpperCase()}</span>`;
}

function buildConfirmationEmail(
  prefs: ReminderPreferences,
  deadlines: Deadline[],
  businessName: string
): string {
  const selected = deadlines.filter(d => prefs.selectedDeadlines.includes(d.id));

  const timingLabels: string[] = [];
  if (prefs.timing.days30) timingLabels.push('30 days');
  if (prefs.timing.days14) timingLabels.push('14 days');
  if (prefs.timing.days7) timingLabels.push('7 days');
  if (prefs.timing.days2) timingLabels.push('2 days');

  const enabledCategories = (Object.entries(prefs.categories) as [RegCategory, boolean][])
    .filter(([, v]) => v)
    .map(([k]) => CATEGORY_CONFIG[k].label);

  const deadlineRows = selected
    .sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    })
    .map(d => {
      const cat = CATEGORY_CONFIG[d.category];
      const dateStr = d.dueDate
        ? new Date(d.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
        : 'Ongoing';
      return `
        <tr>
          <td style="padding:12px 16px;border-bottom:1px solid #E2E8F0">
            <strong style="color:#0F172A">${d.title}</strong>
            <br/><span style="font-size:13px;color:#64748B">${cat.icon} ${cat.label}</span>
          </td>
          <td style="padding:12px 16px;border-bottom:1px solid #E2E8F0;white-space:nowrap;text-align:center">
            ${dateStr}
          </td>
          <td style="padding:12px 16px;border-bottom:1px solid #E2E8F0;text-align:center">
            ${severityBadge(d.severity)}
          </td>
          <td style="padding:12px 16px;border-bottom:1px solid #E2E8F0;font-size:13px;color:#DC2626">
            ${d.penalty}
          </td>
        </tr>`;
    })
    .join('');

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;background:#F0F4F8">
  <div style="max-width:640px;margin:0 auto;padding:24px">
    <!-- Header -->
    <div style="background:#0F2440;padding:28px 32px;border-radius:12px 12px 0 0">
      <h1 style="margin:0;color:#fff;font-size:24px">RegBot</h1>
      <p style="margin:4px 0 0;color:#94A3B8;font-size:14px">Compliance made simple</p>
    </div>

    <!-- Body -->
    <div style="background:#fff;padding:32px;border-radius:0 0 12px 12px;border:1px solid #D1DAE6;border-top:none">
      <h2 style="margin:0 0 8px;color:#0F172A;font-size:20px">
        Reminders activated for ${businessName}
      </h2>
      <p style="margin:0 0 24px;color:#64748B;font-size:14px;line-height:1.5">
        You've set up compliance reminders. We'll email you at <strong>${prefs.email}</strong> before each selected deadline so you never miss a filing.
      </p>

      <!-- Reminder timing -->
      <div style="background:#F0F4F8;border-radius:8px;padding:16px;margin-bottom:24px">
        <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#0F172A">Reminder timing</p>
        <p style="margin:0;font-size:13px;color:#64748B">
          You'll be reminded <strong>${timingLabels.join(', ')}</strong> before each deadline.
        </p>
      </div>

      <!-- Categories -->
      <div style="background:#F0F4F8;border-radius:8px;padding:16px;margin-bottom:24px">
        <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#0F172A">Monitored categories</p>
        <p style="margin:0;font-size:13px;color:#64748B">
          ${enabledCategories.join(' &bull; ')}
        </p>
      </div>

      <!-- Selected deadlines -->
      <h3 style="margin:0 0 12px;font-size:16px;color:#0F172A">
        Selected deadlines &amp; licences (${selected.length})
      </h3>

      ${selected.length > 0 ? `
      <table style="width:100%;border-collapse:collapse;font-size:14px;color:#0F172A;border:1px solid #E2E8F0;border-radius:8px;overflow:hidden">
        <thead>
          <tr style="background:#F8FAFC">
            <th style="padding:10px 16px;text-align:left;font-size:12px;font-weight:600;color:#64748B;border-bottom:1px solid #E2E8F0">Deadline</th>
            <th style="padding:10px 16px;text-align:center;font-size:12px;font-weight:600;color:#64748B;border-bottom:1px solid #E2E8F0">Due Date</th>
            <th style="padding:10px 16px;text-align:center;font-size:12px;font-weight:600;color:#64748B;border-bottom:1px solid #E2E8F0">Status</th>
            <th style="padding:10px 16px;text-align:left;font-size:12px;font-weight:600;color:#64748B;border-bottom:1px solid #E2E8F0">Penalty</th>
          </tr>
        </thead>
        <tbody>
          ${deadlineRows}
        </tbody>
      </table>` : `
      <p style="color:#64748B;font-size:14px">No specific deadlines selected — you'll receive category-based reminders.</p>`}

      <hr style="margin:28px 0;border:none;border-top:1px solid #E2E8F0"/>

      <p style="margin:0;font-size:12px;color:#94A3B8;line-height:1.5">
        This is an automated email from RegBot. You can update your reminder preferences anytime from your dashboard.
        <br/>For specific legal advice, consult an accountant or solicitor.
      </p>
    </div>
  </div>
</body>
</html>`;
}

export async function POST(req: Request) {
  try {
    const { prefs, deadlines, businessName } = (await req.json()) as SendEmailRequest;

    if (!prefs.email) {
      return Response.json({ error: 'No email address provided' }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY) {
      return Response.json({ error: 'Email service not configured' }, { status: 500 });
    }

    const html = buildConfirmationEmail(prefs, deadlines, businessName);

    const { data, error } = await getResend().emails.send({
      from: 'RegBot <onboarding@resend.dev>',
      to: [prefs.email],
      subject: `RegBot — Reminders activated for ${businessName}`,
      html,
    });

    if (error) {
      console.error('Resend error:', error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ success: true, emailId: data?.id });
  } catch (error) {
    console.error('Send email error:', error);
    return Response.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
