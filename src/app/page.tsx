'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Brain,
  Clock,
  MessageCircle,
  FileText,
  Bell,
  Shield,
  ChevronRight,
  Cpu,
  BarChart3,
  Zap,
  Rss,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="bg-white text-brand-dark">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 sm:pt-28 sm:pb-32">
        {/* Subtle blue gradient glow */}
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="h-[500px] w-[800px] rounded-full bg-brand-accent/15 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-brand-border/60 bg-brand-ghost/60 px-4 py-1.5 text-sm font-medium text-brand-light">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-deadline-safe opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-deadline-safe" />
            </span>
            AI-Powered Compliance for Scottish SMEs
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]">
            Never miss a deadline.
            <br />
            <span className="text-brand-accent">Never miss a regulation.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg sm:text-xl text-brand-light leading-relaxed">
            RegBot uses AI to map every compliance obligation for your Scottish food business —
            so you can focus on running it.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/onboarding"
              prefetch={true}
              className="inline-flex items-center gap-2 rounded-full bg-brand-accent px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-brand-accent/25 transition hover:bg-brand-accent/90"
            >
              Get Started — It&apos;s Free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 rounded-full border border-brand-border px-8 py-3.5 text-base font-semibold text-brand-dark transition hover:bg-brand-ghost/60"
            >
              See How It Works
              <ChevronRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-brand-ghost/40 border-y border-brand-border/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: '370,000', label: 'Scottish SMEs' },
              { value: '1–2 days', label: 'Per week lost to admin' },
              { value: '£22,000/yr', label: 'Average cost of late payments' },
              { value: '25%', label: 'Productivity gain from digital tools' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl sm:text-4xl font-bold text-brand-dark">{stat.value}</p>
                <p className="mt-1 text-sm text-brand-light">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              Everything you need to stay compliant
            </h2>
            <p className="mt-4 text-lg text-brand-light max-w-2xl mx-auto">
              Six powerful tools, one simple dashboard — powered by AI.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Brain, title: 'AI-Powered Compliance Agent', desc: 'Analyses your business profile and maps every obligation — HMRC, Companies House, council, and more.' },
              { icon: Clock, title: 'Deadline Tracking', desc: 'Never miss a filing date. Get reminders for VAT returns, annual accounts, licence renewals, and beyond.' },
              { icon: MessageCircle, title: 'Ask RegBot Anything', desc: 'Chat with an AI compliance assistant that knows Scottish regulations inside-out.' },
              { icon: FileText, title: 'Filing Assistant', desc: 'Step-by-step guided filing with pre-filled forms and direct links to government portals.' },
              { icon: Bell, title: 'Regulation Alerts', desc: 'Live monitoring of regulatory changes from HMRC, FSS, and Scottish Government RSS feeds.' },
              { icon: Shield, title: 'Compliance Checklist', desc: 'A clear, categorised checklist of every obligation with status tracking and risk scores.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-2xl border border-brand-border/60 bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="mb-4 inline-flex rounded-xl bg-brand-accent/10 p-3">
                  <Icon className="h-6 w-6 text-brand-accent" />
                </div>
                <h3 className="text-lg font-semibold text-brand-dark">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-light">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-brand-ghost/40 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              How it works
            </h2>
            <p className="mt-4 text-lg text-brand-light">Three steps. Five minutes. Full compliance map.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              { step: '01', title: 'Tell us about your business', desc: 'Answer a few questions about your business type, location, and operations.' },
              { step: '02', title: 'AI maps your obligations', desc: 'Our AI agent analyses your profile against Scottish and UK regulations in seconds.' },
              { step: '03', title: 'Track, file, and ask', desc: 'Monitor deadlines, file with guided assistance, and chat with RegBot anytime.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="relative text-center">
                <span className="text-8xl sm:text-9xl font-black text-brand-accent/10 leading-none select-none">
                  {step}
                </span>
                <h3 className="mt-4 text-xl font-semibold text-brand-dark">{title}</h3>
                <p className="mt-2 text-sm text-brand-light leading-relaxed max-w-xs mx-auto">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Under the Hood */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              Under the hood
            </h2>
            <p className="mt-4 text-lg text-brand-light">Built with cutting-edge AI infrastructure.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Cpu, title: 'GPT-4o Agents', desc: 'Multi-step reasoning for complex compliance analysis.' },
              { icon: BarChart3, title: 'Langfuse', desc: 'Full LLM observability — trace every decision.' },
              { icon: Zap, title: 'Model Router', desc: 'Dynamically picks speed vs accuracy per query.' },
              { icon: Rss, title: 'Real-time Data', desc: 'Live RSS feeds from HMRC, FSS, and gov.uk.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-2xl border border-brand-border/60 bg-white p-6 shadow-sm"
              >
                <div className="mb-4 inline-flex rounded-xl bg-brand-dark/5 p-3">
                  <Icon className="h-6 w-6 text-brand-dark" />
                </div>
                <h3 className="text-base font-semibold text-brand-dark">{title}</h3>
                <p className="mt-1 text-sm text-brand-light">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section className="bg-brand-ghost/40 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              Compliance is broken for small businesses
            </h2>
            <p className="mt-4 text-lg text-brand-light max-w-2xl mx-auto">
              Miss a deadline? The penalties are real — and they add up fast.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Late VAT Return', penalty: '2% surcharge (rising to 4%)', body: 'HMRC charges escalating penalties for every late VAT return period.' },
              { title: 'Companies House Late Filing', penalty: '£150 – £1,500', body: 'Automatic penalties for late annual accounts — doubles if late two years running.' },
              { title: 'Food Hygiene Failure', penalty: 'Closure notice', body: 'Local councils can shut your premises immediately for serious food safety breaches.' },
              { title: 'Employer\'s Liability Gap', penalty: '£2,500/day', body: 'Operating without valid ELI insurance can cost £2,500 for every day uninsured.' },
              { title: 'ICO Data Breach', penalty: '£4,350+', body: 'Failure to register or report data breaches can trigger significant ICO fines.' },
              { title: 'PAYE Late Filing', penalty: '£100 – £400/month', body: 'Monthly penalties for late PAYE submissions, increasing with number of employees.' },
            ].map(({ title, penalty, body }) => (
              <div
                key={title}
                className="rounded-2xl border border-deadline-urgent/20 bg-deadline-urgent/5 p-6"
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-deadline-urgent" />
                  <div>
                    <h3 className="font-semibold text-brand-dark">{title}</h3>
                    <p className="mt-1 text-sm font-bold text-deadline-urgent">{penalty}</p>
                    <p className="mt-2 text-sm text-brand-light leading-relaxed">{body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coverage */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              What we cover
            </h2>
            <p className="mt-4 text-lg text-brand-light">Comprehensive coverage across every regulatory body.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { emoji: '🏛️', title: 'HMRC', items: ['VAT Returns', 'PAYE', 'Self Assessment', 'Corporation Tax', 'CIS'] },
              { emoji: '🏢', title: 'Companies House', items: ['Confirmation Statement', 'Annual Accounts', 'Director Updates'] },
              { emoji: '🏪', title: 'Local Council', items: ['Food Registration', 'Premises Licence', 'Outdoor Seating'] },
              { emoji: '👥', title: 'Employment', items: ['Auto-Enrolment Pensions', 'National Minimum Wage', "Employer's Liability Insurance"] },
              { emoji: '🔒', title: 'Data Protection', items: ['ICO Registration', 'GDPR Compliance', 'Breach Notification'] },
              { emoji: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', title: 'Scotland Specific', items: ['Licensing (Scotland) Act', 'Scottish Income Tax', 'Food Standards Scotland'] },
            ].map(({ emoji, title, items }) => (
              <div
                key={title}
                className="rounded-2xl border border-brand-border/60 bg-white p-6 shadow-sm"
              >
                <div className="mb-3 text-3xl">{emoji}</div>
                <h3 className="text-lg font-semibold text-brand-dark">{title}</h3>
                <ul className="mt-3 space-y-2">
                  {items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-brand-light">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-deadline-safe" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-brand-dark py-20 sm:py-28">
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="h-[400px] w-[600px] rounded-full bg-brand-accent/20 blur-[120px]" />
        </div>
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
            Ready to take control of your compliance?
          </h2>
          <p className="mt-4 text-lg text-white/70">
            Join thousands of Scottish businesses staying on top of regulations with AI.
          </p>
          <Link
            href="/onboarding"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand-accent px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-brand-accent/25 transition hover:bg-brand-accent/90"
          >
            Get Started Now
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-brand-border/40 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-brand-light">
            <Shield className="h-4 w-4 text-brand-accent" />
            <span className="font-semibold text-brand-dark">RegBot</span>
            <span>— Compliance made simple</span>
          </div>
          <p className="text-sm text-brand-light">
            AI Engine Hackathon — Edinburgh, March 2026
          </p>
        </div>
      </footer>
    </div>
  );
}
