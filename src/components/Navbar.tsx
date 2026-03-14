'use client';

import { useRouter } from 'next/navigation';
import { RotateCcw, Shield } from 'lucide-react';
import { clearAll } from '@/lib/storage';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const router = useRouter();

  const handleReset = () => {
    clearAll();
    router.push('/');
  };

  return (
    <header className="bg-brand-dark text-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Shield className="h-7 w-7 text-brand-accent" />
          <div>
            <h1 className="text-lg font-bold leading-tight">RegBot</h1>
            <p className="text-xs text-white/60">Compliance made simple</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="text-white/70 hover:bg-white/10 hover:text-white"
        >
          <RotateCcw className="mr-1.5 h-4 w-4" />
          Reset
        </Button>
      </div>
    </header>
  );
}
