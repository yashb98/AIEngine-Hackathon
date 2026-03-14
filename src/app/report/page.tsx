'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getComplianceMap } from '@/lib/storage';
import { ReportView } from '@/components/ReportView';
import type { ComplianceMap } from '@/lib/types';

export default function ReportPage() {
  const router = useRouter();
  const [data, setData] = useState<ComplianceMap | null>(null);

  useEffect(() => {
    const map = getComplianceMap();
    if (!map) {
      router.push('/dashboard');
      return;
    }
    setData(map);
  }, [router]);

  if (!data) return null;

  return (
    <div>
      <div className="print:hidden sticky top-0 z-10 flex items-center gap-3 bg-white border-b px-6 py-3">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Back
        </Button>
        <div className="flex-1" />
        <Button size="sm" onClick={() => window.print()} className="bg-brand-accent hover:bg-blue-600">
          <Printer className="mr-1 h-4 w-4" /> Print / Save PDF
        </Button>
      </div>
      <ReportView data={data} />
    </div>
  );
}
