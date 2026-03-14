import { Resend } from 'resend';
import { CATEGORY_CONFIG } from '@/lib/types';
import { VERIFIED_URLS } from '@/lib/prompts';
import type { Deadline, RegCategory } from '@/lib/types';

/**
 * Daily Digest Cron Endpoint
 *
 * This endpoint is designed to be called by an external cron service
 * (e.g., Vercel Cron, GitHub Actions, or cron-job.org) every day at 8:00 AM.
 *
 * It receives the business data and sends a digest email with all compliance
 * deadlines, their status, penalties, and direct filing links.
 *
 * Example cron config (vercel.json):
 * {
 *   "crons": [{
 *     "path": "/api/cron/daily-digest",
 *     "schedule": "0 8 * * *"
 *   }]
 * }
 *
 * For local testing, call this endpoint via POST with the required body.
 */

let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
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

function getBestLink(deadline: Deadline): string | null {
  const combined = (deadline.title + ' ' + deadline.description).toLowerCase();
  if (combined.includes('vat')) return VERIFIED_URLS.vat_returns.url;
  if (combined.includes('paye') || combined.includes('rti')) return VERIFIED_URLS.paye.url;
  if (combined.includes('self assessment')) return VERIFIED_URLS.self_assessment.url;
  if (combined.includes('corporation tax')) return VERIFIED_URLS.corporation_tax.url;
  if (combined.includes('confirmation statement')) return VERIFIED_URLS.confirmation_statement.url;
  if (combined.includes('annual accounts')) return VERIFIED_URLS.annual_accounts.url;
  if (combined.includes('food hygiene')) return VERIFIED_URLS.food_hygiene_register.url;
  if (combined.includes('allergen')) return VERIFIED_URLS.allergen_labelling.url;
  if (combined.includes('haccp')) return VERIFIED_URLS.haccp.url;
  if (combined.includes('premises licence') || combined.includes('licensing')) return VERIFIED_URLS.licensing_scotland.url;
  if (combined.includes('personal licence')) return VERIFIED_URLS.personal_licence.url;
  if (combined.includes('pension') || combined.includes('auto-enrolment')) return VERIFIED_URLS.auto_enrolment.url;
  if (combined.includes('minimum wage')) return VERIFIED_URLS.national_min_wage.url;
  if (combined.includes('employer') && combined.includes('liability')) return VERIFIED_URLS.employer_liability.url;
  if (combined.includes('ico') || combined.includes('data protection')) return VERIFIED_URLS.ico_registration.url;
  if (combined.includes('scottish income tax')) return VERIFIED_URLS.scottish_income_tax.url;
  return null;
}

// Recalculate severity based on current date
function recalcSeverity(deadline: Deadline): Deadline {
  if (!deadline.dueDate) return deadline;
  const days = Math.ceil((new Date(deadline.dueDate).getTime() - Date.now()) / 86400000);
  let severity: 'overdue' | 'urgent' | 'warning' | 'safe';
  if (days < 0) severity = 'overdue';
  else if (days <= 7) severity = 'urgent';
  else if (days <= 30) severity = 'warning';
  else severity = 'safe';
  return { ...deadline, severity };
}

function buildDailyDigest(deadlines: Deadline[], businessName: string): string {
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  // Recalculate severity for all deadlines
  const recalculated = deadlines.map(recalcSeverity);
  const dated = recalculated.filter(d => d.dueDate).sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());
  const ongoing = recalculated.filter(d => !d.dueDate);

  const overdue = dated.filter(d => d.severity === 'overdue');
  const urgent = dated.filter(d => d.severity === 'urgent');

  const alertBanner = overdue.length > 0
    ? `<div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:8px;padding:16px;margin-bottom:24px">
        <p style="margin:0;font-size:14px;color:#991B1B;font-weight:600">⚠️ ${overdue.length} overdue item${overdue.length > 1 ? 's' : ''} — immediate action required</p>
        <p style="margin:4px 0 0;font-size:13px;color:#B91C1C">${overdue.map(d => d.title).join(', ')}</p>
       </div>`
    : urgent.length > 0
    ? `<div style="background:#FFF7ED;border:1px solid #FED7AA;border-radius:8px;padding:16px;margin-bottom:24px">
        <p style="margin:0;font-size:14px;color:#C2410C;font-weight:600">🔔 ${urgent.length} deadline${urgent.length > 1 ? 's' : ''} due within 7 days</p>
        <p style="margin:4px 0 0;font-size:13px;color:#EA580C">${urgent.map(d => d.title).join(', ')}</p>
       </div>`
    : `<div style="background:#ECFDF5;border:1px solid #A7F3D0;border-radius:8px;padding:16px;margin-bottom:24px">
        <p style="margin:0;font-size:14px;color:#047857;font-weight:600">✅ All clear — no urgent deadlines today</p>
       </div>`;

  const rows = dated.map(d => {
    const cat = CATEGORY_CONFIG[d.category];
    const dateStr = new Date(d.dueDate!).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    const daysUntil = Math.ceil((new Date(d.dueDate!).getTime() - Date.now()) / 86400000);
    const daysLabel = daysUntil < 0
      ? `<strong style="color:#991B1B">${Math.abs(daysUntil)}d overdue</strong>`
      : daysUntil === 0 ? '<strong style="color:#DC2626">Today</strong>'
      : daysUntil <= 7 ? `<strong style="color:#DC2626">${daysUntil}d</strong>`
      : daysUntil <= 30 ? `<span style="color:#F59E0B">${daysUntil}d</span>`
      : `<span style="color:#059669">${daysUntil}d</span>`;

    const link = getBestLink(d);
    const linkCell = link
      ? `<td style="padding:12px 16px;border-bottom:1px solid #E2E8F0;text-align:center;vertical-align:middle"><a href="${link}" style="display:inline-block;padding:5px 12px;background:#3B82F6;color:#fff;text-decoration:none;border-radius:6px;font-size:11px;font-weight:600">File &rarr;</a></td>`
      : `<td style="padding:12px 16px;border-bottom:1px solid #E2E8F0"></td>`;

    return `
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #E2E8F0">
          <strong style="color:#0F172A;font-size:13px">${d.title}</strong>
          <br/><span style="font-size:11px;color:#64748B">${cat.icon} ${cat.label}</span>
        </td>
        <td style="padding:12px 16px;border-bottom:1px solid #E2E8F0;text-align:center;white-space:nowrap;font-size:13px">
          ${dateStr}<br/>${daysLabel}
        </td>
        <td style="padding:12px 16px;border-bottom:1px solid #E2E8F0;text-align:center">${severityBadge(d.severity)}</td>
        <td style="padding:12px 16px;border-bottom:1px solid #E2E8F0;font-size:12px;color:#DC2626">${d.penalty}</td>
        ${linkCell}
      </tr>`;
  }).join('');

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;background:#F0F4F8">
  <div style="max-width:700px;margin:0 auto;padding:24px">
    <div style="background:#0F2440;padding:28px 32px;border-radius:12px 12px 0 0">
      <h1 style="margin:0;color:#fff;font-size:24px">🛡️ RegBot Daily Digest</h1>
      <p style="margin:4px 0 0;color:#94A3B8;font-size:14px">${today} • ${businessName}</p>
    </div>
    <div style="background:#fff;padding:32px;border-radius:0 0 12px 12px;border:1px solid #D1DAE6;border-top:none">
      ${alertBanner}

      <h3 style="margin:0 0 12px;font-size:16px;color:#0F172A">📅 All Deadlines (${dated.length})</h3>
      ${dated.length > 0 ? `
      <table style="width:100%;border-collapse:collapse;border:1px solid #E2E8F0;border-radius:8px;overflow:hidden">
        <thead><tr style="background:#F8FAFC">
          <th style="padding:10px 16px;text-align:left;font-size:11px;font-weight:600;color:#64748B;border-bottom:1px solid #E2E8F0">Deadline</th>
          <th style="padding:10px 16px;text-align:center;font-size:11px;font-weight:600;color:#64748B;border-bottom:1px solid #E2E8F0">Due</th>
          <th style="padding:10px 16px;text-align:center;font-size:11px;font-weight:600;color:#64748B;border-bottom:1px solid #E2E8F0">Status</th>
          <th style="padding:10px 16px;text-align:left;font-size:11px;font-weight:600;color:#64748B;border-bottom:1px solid #E2E8F0">Penalty</th>
          <th style="padding:10px 16px;text-align:center;font-size:11px;font-weight:600;color:#64748B;border-bottom:1px solid #E2E8F0">Link</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>` : '<p style="color:#059669;font-size:14px">✅ No dated deadlines.</p>'}

      ${ongoing.length > 0 ? `
      <h3 style="margin:28px 0 12px;font-size:16px;color:#0F172A">🔄 Ongoing Obligations (${ongoing.length})</h3>
      <ul style="margin:0;padding:0 0 0 20px;font-size:13px;color:#0F172A;line-height:1.8">
        ${ongoing.map(d => {
          const link = getBestLink(d);
          return `<li><strong>${d.title}</strong> — ${d.action}${link ? ` <a href="${link}" style="color:#3B82F6">[Link]</a>` : ''}</li>`;
        }).join('')}
      </ul>` : ''}

      <hr style="margin:28px 0;border:none;border-top:1px solid #E2E8F0"/>
      <p style="margin:0;font-size:11px;color:#94A3B8;line-height:1.5">
        Automated daily compliance digest from RegBot • Sent at 8:00 AM daily<br/>
        For specific legal advice, consult an accountant or solicitor.
      </p>
    </div>
  </div>
</body>
</html>`;
}

export async function POST(req: Request) {
  try {
    const { email, deadlines, businessName } = (await req.json()) as {
      email: string;
      deadlines: Deadline[];
      businessName: string;
    };

    if (!email || !deadlines?.length) {
      return Response.json({ error: 'Missing email or deadlines' }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY) {
      return Response.json({ error: 'Email service not configured' }, { status: 500 });
    }

    const html = buildDailyDigest(deadlines, businessName);
    const { data, error } = await getResend().emails.send({
      from: 'RegBot <onboarding@resend.dev>',
      to: [email],
      subject: `☀️ RegBot Morning Digest — ${businessName}`,
      html,
    });

    if (error) {
      console.error('Cron email error:', error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ success: true, emailId: data?.id });
  } catch (error) {
    console.error('Cron endpoint error:', error);
    return Response.json({ error: 'Failed to send daily digest' }, { status: 500 });
  }
}

// Also support GET for Vercel Cron (which sends GET requests)
export async function GET(req: Request) {
  // Verify cron secret if configured
  const authHeader = req.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return Response.json({
    message: 'Daily digest cron endpoint. Send POST with { email, deadlines, businessName } to trigger.',
    info: 'Configure Vercel Cron or external scheduler to call this at 8:00 AM daily.',
  });
}
