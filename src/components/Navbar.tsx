'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { RotateCcw, Shield, ArrowRight } from 'lucide-react';
import { clearAll } from '@/lib/storage';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const isLanding = pathname === '/';

  const handleReset = () => {
    clearAll();
    router.push('/');
  };

  return (
    <header
      className={
        isLanding
          ? 'fixed top-0 right-0 left-0 z-50 border-b border-white/10 bg-white/80 backdrop-blur-md'
          : 'bg-brand-dark text-white'
      }
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" prefetch={true} className="flex items-center gap-3">
          <Shield className={`h-7 w-7 ${isLanding ? 'text-brand-accent' : 'text-brand-accent'}`} />
          <div>
            <h1 className={`text-lg font-bold leading-tight ${isLanding ? 'text-brand-dark' : 'text-white'}`}>
              RegBot
            </h1>
            <p className={`text-xs ${isLanding ? 'text-brand-light' : 'text-white/60'}`}>
              Compliance made simple
            </p>
          </div>
        </Link>

        {isLanding ? (
          <Link
            href="/onboarding"
            prefetch={true}
            className="inline-flex items-center gap-1.5 rounded-full bg-brand-accent px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-accent/90"
          >
            Get Started
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-white/70 hover:bg-white/10 hover:text-white"
          >
            <RotateCcw className="mr-1.5 h-4 w-4" />
            Reset
          </Button>
        )}
      </div>
    </header>
  );
}
