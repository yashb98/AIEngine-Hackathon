import { Resend } from 'resend';
import { CATEGORY_CONFIG } from '@/lib/types';
import { VERIFIED_URLS } from '@/lib/prompts';
import type { Deadline, RegCategory } from '@/lib/types';

let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

interface SendEmailRequest {
  email: string;
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

function getBestLink(deadline: Deadline): string | null {
  const titleLower = deadline.title.toLowerCase();
  const descLower = deadline.description.toLowerCase();
  const combined = titleLower + ' ' + descLower;

  // Match deadline to the closest verified URL
  if (combined.includes('vat')) return VERIFIED_URLS.vat_returns.url;
  if (combined.includes('paye') || combined.includes('rti') || combined.includes('payroll')) return VERIFIED_URLS.paye.url;
  if (combined.includes('self assessment')) return VERIFIED_URLS.self_assessment.url;
  if (combined.includes('corporation tax')) return VERIFIED_URLS.corporation_tax.url;
  if (combined.includes('confirmation statement')) return VERIFIED_URLS.confirmation_statement.url;
  if (combined.includes('annual accounts') || combined.includes('accounts filing')) return VERIFIED_URLS.annual_accounts.url;
  if (combined.includes('food hygiene')) return VERIFIED_URLS.food_hygiene_register.url;
  if (combined.includes('allergen')) return VERIFIED_URLS.allergen_labelling.url;
  if (combined.includes('haccp')) return VERIFIED_URLS.haccp.url;
  if (combined.includes('premises licence') || combined.includes('alcohol') || combined.includes('licensing')) return VERIFIED_URLS.licensing_scotland.url;
  if (combined.includes('personal licence')) return VERIFIED_URLS.personal_licence.url;
  if (combined.includes('pension') || combined.includes('auto-enrolment') || combined.includes('auto enrolment')) return VERIFIED_URLS.auto_enrolment.url;
  if (combined.includes('minimum wage') || combined.includes('living wage')) return VERIFIED_URLS.national_min_wage.url;
  if (combined.includes('employer') && combined.includes('liability')) return VERIFIED_URLS.employer_liability.url;
  if (combined.includes('ico') || combined.includes('data protection')) return VERIFIED_URLS.ico_registration.url;
  if (combined.includes('scottish income tax')) return VERIFIED_URLS.scottish_income_tax.url;
  if (combined.includes('small business bonus')) return VERIFIED_URLS.small_business_bonus.url;
  if (combined.includes('deposit return')) return VERIFIED_URLS.deposit_return.url;
  if (combined.includes('health') && combined.includes('safety')) return VERIFIED_URLS.health_safety.url;
  return null;
}

function buildDigestEmail(deadlines: Deadline[], businessName: string): string {
  const sorted = [...deadlines]
    .filter(d => d.dueDate)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());

  const ongoing = deadlines.filter(d => !d.dueDate);
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const deadlineRows = sorted
    .map(d => {
      const cat = CATEGORY_CONFIG[d.category];
      const dateStr = new Date(d.dueDate!).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
      const daysUntil = Math.ceil((new Date(d.dueDate!).getTime() - Date.now()) / 86400000);
      const daysLabel = daysUntil < 0
        ? `<strong style="color:#991B1B">${Math.abs(daysUntil)} days overdue</strong>`
        : daysUntil === 0
        ? '<strong style="color:#DC2626">Due today</strong>'
        : daysUntil <= 7
        ? `<strong style="color:#DC2626">${daysUntil} days left</strong>`
        : daysUntil <= 30
        ? `<span style="color:#F59E0B">${daysUntil} days left</span>`
        : `<span style="color:#059669">${daysUntil} days left</span>`;

      const link = getBestLink(d);
      const linkHtml = link
        ? `<a href="${link}" style="display:inline-block;margin-top:8px;padding:6px 14px;background:#3B82F6;color:#fff;text-decoration:none;border-radius:6px;font-size:12px;font-weight:600">File / View &rarr;</a>`
        : '';

      return `
        <tr>
          <td style="padding:16px;border-bottom:1px solid #E2E8F0;vertical-align:top">
            <strong style="color:#0F172A;font-size:14px">${d.title}</strong>
            <br/><span style="font-size:12px;color:#64748B">${cat.icon} ${cat.label}</span>
            <br/><span style="font-size:12px;color:#64748B">${d.description}</span>
            ${linkHtml}
          </td>
          <td style="padding:16px;border-bottom:1px solid #E2E8F0;white-space:nowrap;text-align:center;vertical-align:top">
            <span style="font-size:13px">${dateStr}</span>
            <br/>${daysLabel}
          </td>
          <td style="padding:16px;border-bottom:1px solid #E2E8F0;text-align:center;vertical-align:top">
            ${severityBadge(d.severity)}
          </td>
          <td style="padding:16px;border-bottom:1px solid #E2E8F0;font-size:13px;color:#DC2626;vertical-align:top">
            ${d.penalty}
          </td>
        </tr>`;
    })
    .join('');

  const ongoingRows = ongoing
    .map(d => {
      const cat = CATEGORY_CONFIG[d.category];
      const link = getBestLink(d);
      const linkHtml = link
        ? `<a href="${link}" style="color:#3B82F6;text-decoration:underline;font-size:12px">View guidance</a>`
        : '';
      return `
        <tr>
          <td style="padding:12px 16px;border-bottom:1px solid #E2E8F0">
            <strong style="color:#0F172A;font-size:13px">${d.title}</strong>
            <span style="font-size:12px;color:#64748B"> — ${cat.icon} ${cat.label}</span>
            ${linkHtml ? `<br/>${linkHtml}` : ''}
          </td>
          <td style="padding:12px 16px;border-bottom:1px solid #E2E8F0;font-size:12px;color:#64748B">
            ${d.action}
          </td>
        </tr>`;
    })
    .join('');

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;background:#F0F4F8">
  <div style="max-width:680px;margin:0 auto;padding:24px">
    <!-- Header -->
    <div style="background:#0F2440;padding:28px 32px;border-radius:12px 12px 0 0">
      <h1 style="margin:0;color:#fff;font-size:24px">🛡️ RegBot Daily Digest</h1>
      <p style="margin:4px 0 0;color:#94A3B8;font-size:14px">${today}</p>
    </div>

    <!-- Body -->
    <div style="background:#fff;padding:32px;border-radius:0 0 12px 12px;border:1px solid #D1DAE6;border-top:none">
      <h2 style="margin:0 0 8px;color:#0F172A;font-size:20px">
        Good morning, ${businessName}
      </h2>
      <p style="margin:0 0 24px;color:#64748B;font-size:14px;line-height:1.5">
        Here's your daily compliance overview. We've checked all your licences and filings — here's what needs your attention.
      </p>

      <!-- Upcoming deadlines -->
      <h3 style="margin:0 0 12px;font-size:16px;color:#0F172A">
        📅 Upcoming Deadlines (${sorted.length})
      </h3>

      ${sorted.length > 0 ? `
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
      <p style="color:#059669;font-size:14px;background:#ECFDF5;padding:16px;border-radius:8px">✅ No upcoming deadlines — you're all clear!</p>`}

      ${ongoing.length > 0 ? `
      <h3 style="margin:28px 0 12px;font-size:16px;color:#0F172A">
        🔄 Ongoing Obligations (${ongoing.length})
      </h3>
      <table style="width:100%;border-collapse:collapse;font-size:14px;color:#0F172A;border:1px solid #E2E8F0;border-radius:8px;overflow:hidden">
        <thead>
          <tr style="background:#F8FAFC">
            <th style="padding:10px 16px;text-align:left;font-size:12px;font-weight:600;color:#64748B;border-bottom:1px solid #E2E8F0">Obligation</th>
            <th style="padding:10px 16px;text-align:left;font-size:12px;font-weight:600;color:#64748B;border-bottom:1px solid #E2E8F0">Action Required</th>
          </tr>
        </thead>
        <tbody>
          ${ongoingRows}
        </tbody>
      </table>` : ''}

      <hr style="margin:28px 0;border:none;border-top:1px solid #E2E8F0"/>

      <p style="margin:0;font-size:12px;color:#94A3B8;line-height:1.5">
        This is your automated daily compliance digest from RegBot, sent every morning at 8:00 AM.
        You can update your email from your dashboard.
        <br/>For specific legal advice, consult an accountant or solicitor.
      </p>
    </div>
  </div>
</body>
</html>`;
}

export async function POST(req: Request) {
  try {
    const { email, deadlines, businessName } = (await req.json()) as SendEmailRequest;

    if (!email) {
      return Response.json({ error: 'No email address provided' }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY) {
      return Response.json({ error: 'Email service not configured' }, { status: 500 });
    }

    const html = buildDigestEmail(deadlines, businessName);

    const { data, error } = await getResend().emails.send({
      from: 'RegBot <onboarding@resend.dev>',
      to: [email],
      subject: `RegBot Daily Digest — ${businessName}`,
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
