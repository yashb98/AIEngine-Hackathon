'use client';

import { OnboardingForm } from '@/components/OnboardingForm';

export default function OnboardingPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-brand-ghost">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-brand-dark tracking-tight">
            Set Up Your Business Profile
          </h1>
          <p className="mt-2 text-brand-light">
            Tell us about your business and we&apos;ll map your compliance obligations.
          </p>
        </div>
        <OnboardingForm />
      </div>
    </div>
  );
}
