'use client';

import { CATEGORY_CONFIG } from '@/lib/types';
import { VERIFIED_URLS } from '@/lib/prompts';
import type { ComplianceMap } from '@/lib/types';

const verifiedUrlSet = new Set(Object.values(VERIFIED_URLS).map(v => v.url));

interface ReportViewProps {
  data: ComplianceMap;
}

const severityLabel: Record<string, string> = {
  overdue: 'OVERDUE',
  urgent: 'URGENT',
  warning: 'UPCOMING',
  safe: 'ON TRACK',
};

export function ReportView({ data }: ReportViewProps) {
  const grouped = data.obligations.reduce((acc, ob) => {
    (acc[ob.category] ??= []).push(ob);
    return acc;
  }, {} as Record<string, typeof data.obligations>);

  return (
    <div className="report-container mx-auto max-w-4xl bg-white px-10 py-8">
      {/* Header */}
      <div className="mb-8 border-b-2 border-brand pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-brand">RegBot</h1>
            <p className="text-sm text-text-secondary">Compliance Report</p>
          </div>
          <div className="text-right text-sm text-text-secondary">
            <p className="font-semibold text-text-primary">{data.profile.businessName}</p>
            <p>{data.profile.councilArea.replace('_', ' ')}, Scotland</p>
            <p>Generated: {new Date(data.generatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>
      </div>

      {/* Summary */}
      <section className="mb-6">
        <h2 className="mb-2 text-lg font-bold text-text-primary">Executive Summary</h2>
        <p className="text-sm text-text-secondary">{data.summary}</p>
        <div className="mt-3 flex gap-6 text-sm">
          <div>
            <span className="font-semibold text-text-primary">{data.obligations.length}</span>{' '}
            <span className="text-text-secondary">obligations</span>
          </div>
          <div>
            <span className="font-semibold text-text-primary">{data.deadlines.length}</span>{' '}
            <span className="text-text-secondary">deadlines tracked</span>
          </div>
          <div>
            <span className="font-semibold text-text-primary">{data.riskScore}/100</span>{' '}
            <span className="text-text-secondary">risk score</span>
          </div>
        </div>
      </section>

      {/* Deadlines */}
      <section className="mb-6 break-inside-avoid">
        <h2 className="mb-3 text-lg font-bold text-text-primary">Upcoming Deadlines</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs font-semibold uppercase text-text-secondary">
              <th className="pb-2 pr-3">Due Date</th>
              <th className="pb-2 pr-3">Status</th>
              <th className="pb-2 pr-3">Deadline</th>
              <th className="pb-2">Action Required</th>
            </tr>
          </thead>
          <tbody>
            {data.deadlines
              .filter(d => d.dueDate)
              .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
              .map(d => (
                <tr key={d.id} className="border-b border-gray-100">
                  <td className="py-2 pr-3 text-xs whitespace-nowrap">{new Date(d.dueDate!).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td className="py-2 pr-3">
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${d.severity === 'overdue' || d.severity === 'urgent' ? 'bg-red-100 text-red-700' : d.severity === 'warning' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                      {severityLabel[d.severity]}
                    </span>
                  </td>
                  <td className="py-2 pr-3 font-medium text-text-primary">{d.title}</td>
                  <td className="py-2 text-text-secondary">{d.action}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </section>

      {/* Obligations by Category */}
      <section>
        <h2 className="mb-3 text-lg font-bold text-text-primary">Obligations by Category</h2>
        {Object.entries(grouped).map(([cat, obligations]) => {
          const config = CATEGORY_CONFIG[cat as keyof typeof CATEGORY_CONFIG];
          return (
            <div key={cat} className="mb-5 break-inside-avoid">
              <h3 className="mb-2 text-sm font-bold text-text-primary">
                {config?.icon} {config?.label ?? cat}
              </h3>
              {obligations.map(ob => (
                <div key={ob.id} className="mb-2 rounded-md border border-gray-200 p-3">
                  <p className="text-sm font-semibold text-text-primary">{ob.title}</p>
                  <p className="mt-0.5 text-xs text-text-secondary">{ob.description}</p>
                  <div className="mt-1 flex flex-wrap gap-4 text-xs text-text-secondary">
                    <span>Frequency: {ob.frequency}</span>
                    <span>Penalty: {ob.penalty}</span>
                    {ob.sourceUrl && (
                      <a
                        href={ob.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-accent hover:underline inline-flex items-center gap-0.5"
                      >
                        {ob.source}
                        {verifiedUrlSet.has(ob.sourceUrl) ? ' ✓' : ' ⚠'}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </section>

      {/* Footer */}
      <div className="mt-10 border-t pt-4 text-center text-xs text-text-secondary">
        <p>This report is for informational purposes only and does not constitute legal advice.</p>
        <p className="mt-1">Generated by RegBot — AI Compliance Advisor for Scottish Food Businesses</p>
      </div>
    </div>
  );
}
