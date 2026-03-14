# CLAUDE.md — RegBot: AI Compliance Agent for Scottish SMEs

> This file is the single source of truth for building RegBot.
> It works with **Claude Code**, **Cursor**, and **any AI coding assistant**.
> Read this ENTIRE file before writing any code. Follow it exactly.

---

## TABLE OF CONTENTS

1. [What We Are Building](#what-we-are-building)
2. [The Problem (With Data)](#the-problem)
3. [Tech Stack](#tech-stack)
4. [Design System](#design-system)
5. [File Structure](#file-structure)
6. [Architecture](#architecture)
7. [Regulatory Knowledge Base](#regulatory-knowledge-base)
8. [Team Assignments](#team-assignments)
9. [Phase 1 — Foundation](#phase-1--foundation-hours-0-3)
10. [Phase 2 — The Brain](#phase-2--the-brain-hours-3-6)
11. [Phase 3 — Dashboard & Chat](#phase-3--dashboard--chat-hours-6-10)
12. [Phase 4 — Polish & Demo](#phase-4--polish--demo-hours-10-14)
13. [Testing Checklist](#testing-checklist)
14. [Demo Script](#demo-script)
15. [Critical Rules](#critical-rules)

---

## WHAT WE ARE BUILDING

**RegBot** is a Next.js web app deployed on Vercel that acts as an AI-powered compliance agent for Scottish SMEs. It answers one question every small business owner asks: **"What do I need to do, and when do I need to do it?"**

### Two Core Experiences

| Experience | Route | What It Does |
|-----------|-------|-------------|
| **Onboarding** | `/` | Smart form that builds a business profile → generates personalised compliance map |
| **Dashboard** | `/dashboard` | Deadline tracker + compliance map + AI chat for regulation Q&A |

### Core Value Proposition
> "Never miss a deadline, never be surprised by a regulation change, and cut your admin time in half."

---

## THE PROBLEM

Scottish SMEs are drowning in regulatory admin. The data is brutal:

| Stat | Source |
|------|--------|
| **370,000 SMEs** in Scotland | Scottish Government, 2025 |
| **5.7M SMEs** across the UK, 99.9% of all businesses | UK Gov Business Population Estimates, 2025 |
| **1-2 days/week** spent on admin and compliance | Federation of Small Businesses |
| **£22,000/year** average cost of late payments per SME | Coface UK Payment Survey, 2025 |
| **90%** of UK businesses face payment delays | Coface, 2025 |
| **£150-£1,500** automatic penalty for missed Companies House filing | Companies House |
| **2% surcharge** on late VAT returns (escalating) | HMRC |
| **25% productivity gain** from digital tools adoption | UK Gov Small Business Plan, 2025 |
| **£232B** potential economic boost from SME digital adoption | Sage / UK Gov |
| **1% SME growth** = **£320B** to UK economy by 2030 | ONS / UK Gov |

### The Pitch in 30 Seconds
"A café owner in Edinburgh juggles HMRC, Companies House, their local council, Food Standards Scotland, GDPR, pensions auto-enrolment, and the Scottish Licensing Act. Different deadlines. Different portals. Different penalties. Miss one? Automatic fine. RegBot maps every obligation, tracks every deadline, and answers every question — in plain English, specific to their business, specific to Scotland."

---

## TECH STACK

```
FRAMEWORK       Next.js 15 (App Router) + TypeScript
STYLING         Tailwind CSS + shadcn/ui
LLM             Claude API (@anthropic-ai/sdk) — claude-sonnet-4-20250514
STREAMING       Vercel AI SDK (ai package) — useChat() hook
DATABASE        localStorage for hackathon (upgrade to Vercel KV post-demo)
PDF             None needed for MVP
DEPLOY          Vercel (push to GitHub → auto-deploy)
```

### Why These Choices
- **Claude Sonnet** (not Haiku): Regulatory Q&A needs accuracy and reasoning. Haiku is too light for compliance advice. Sonnet is the sweet spot — fast enough to stream, smart enough to be correct.
- **localStorage**: For a hackathon, we don't need a real database. Business profile + compliance map stored in browser. Demo works perfectly.
- **Vercel AI SDK**: `useChat()` gives us streaming chat UI in 5 lines. No custom streaming code.
- **shadcn/ui**: Production-grade components. Ship fast, look professional.

### Environment Variables (.env.local)

```bash
ANTHROPIC_API_KEY=sk-ant-...
```

That's it. One key. Keep it simple.

### Dependencies (package.json)

```json
{
  "dependencies": {
    "next": "^15.2.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@anthropic-ai/sdk": "^0.39.0",
    "ai": "^4.1.0",
    "@ai-sdk/anthropic": "^1.2.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.6.0",
    "lucide-react": "^0.469.0",
    "date-fns": "^4.1.0"
  },
  "devDependencies": {
    "typescript": "^5.7.0",
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "tailwindcss": "^3.4.17",
    "postcss": "^8.4.49",
    "autoprefixer": "^10.4.20"
  }
}
```

---

## DESIGN SYSTEM

### Color Tokens (tailwind.config.ts)

```typescript
colors: {
  brand: {
    DEFAULT: '#1E3A5F',    // Deep navy (trust, authority, government-feel)
    light: '#2B5A8F',      // Lighter navy for hover
    dark: '#0F2440',       // Sidebar / headers
    ghost: '#F0F4F8',      // Light blue-grey background
    border: '#D1DAE6',     // Borders
    accent: '#3B82F6',     // Blue accent for CTAs
  },
  surface: {
    DEFAULT: '#FFFFFF',
    secondary: '#F8FAFC',
  },
  text: {
    DEFAULT: '#0F172A',    // Near-black
    secondary: '#64748B',  // Slate grey
  },
  // Deadline severity colors
  deadline: {
    urgent: '#DC2626',     // Red — due in 0-7 days
    warning: '#F59E0B',    // Amber — due in 8-30 days
    safe: '#059669',       // Green — due in 30+ days
    overdue: '#991B1B',    // Dark red — past due
  },
}
```

### Why Navy, Not Purple
This is a **compliance and regulatory** tool — it needs to feel trustworthy, authoritative, and government-adjacent. Navy conveys that. Purple (BizCrew's palette) was right for a creative operations tool but wrong for "we'll keep you out of trouble with HMRC."

### UI Rules
- **Header/Nav**: `bg-brand-dark text-white` — solid, authoritative
- **Cards**: `bg-white border border-brand-border rounded-xl shadow-sm` — clean surfaces
- **Deadline badges**: color-coded by severity (red/amber/green) using `deadline.*` tokens
- **Buttons primary**: `bg-brand-accent hover:bg-blue-600 text-white rounded-lg font-semibold`
- **Buttons secondary**: `border border-brand-border text-brand bg-white rounded-lg`
- **Chat bubbles** — user: `bg-brand-accent text-white rounded-xl`, assistant: `bg-brand-ghost text-text rounded-xl`
- **Form inputs**: `border-brand-border rounded-lg focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent`
- **Stats/metrics**: `text-brand font-bold text-2xl`
- **Compliance map items**: Cards with left border color indicating category (blue=HMRC, green=Companies House, amber=Council, purple=Sector-specific)
- **NO gradient backgrounds. NO decorative illustrations. Clean, serious, trustworthy.**
- **Font**: Inter (already default in Next.js)

---

## FILE STRUCTURE

```
regbot/
├── CLAUDE.md                            # THIS FILE — read first
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
├── .env.local                           # ANTHROPIC_API_KEY only (gitignored)
│
├── src/
│   ├── app/
│   │   ├── layout.tsx                   # Root layout, Inter font, nav bar
│   │   ├── page.tsx                     # Onboarding form (landing page)
│   │   ├── globals.css                  # Tailwind imports + minimal overrides
│   │   │
│   │   ├── dashboard/
│   │   │   └── page.tsx                 # Main dashboard (deadlines + map + chat)
│   │   │
│   │   └── api/
│   │       ├── chat/
│   │       │   └── route.ts             # POST — streaming compliance Q&A
│   │       │
│   │       └── compliance/
│   │           └── route.ts             # POST — generate compliance map + deadlines
│   │
│   ├── components/
│   │   ├── ui/                          # shadcn/ui components
│   │   ├── OnboardingForm.tsx           # Multi-step business profile form
│   │   ├── ComplianceMap.tsx            # Categorised list of all obligations
│   │   ├── DeadlineTimeline.tsx         # Upcoming deadlines with severity
│   │   ├── DeadlineCard.tsx             # Individual deadline card
│   │   ├── ComplianceChat.tsx           # AI chat interface for Q&A
│   │   ├── StatusBadge.tsx              # Red/Amber/Green severity badge
│   │   ├── StatCard.tsx                 # Metric display card
│   │   └── Navbar.tsx                   # Top navigation bar
│   │
│   ├── lib/
│   │   ├── types.ts                     # All TypeScript types
│   │   ├── prompts.ts                   # System prompts for Claude
│   │   ├── regulations.ts              # Scottish/UK regulatory knowledge base
│   │   ├── deadlines.ts                 # Deadline calculation logic
│   │   ├── storage.ts                   # localStorage helpers
│   │   └── constants.ts                 # Business types, council areas, etc.
│   │
│   └── hooks/
│       └── useBusinessProfile.ts        # Custom hook for profile state
│
└── public/
    └── favicon.ico
```

---

## ARCHITECTURE

```
┌──────────────────────────────────────────────────┐
│  BROWSER                                         │
│                                                  │
│  / (Onboarding)           /dashboard             │
│  ┌──────────────┐        ┌─────────────────────┐ │
│  │ OnboardingForm│──────▶│ DeadlineTimeline     │ │
│  │ (multi-step)  │ save  │ ComplianceMap        │ │
│  │               │ to    │ ComplianceChat       │ │
│  └──────────────┘ local  └──────┬──────────────┘ │
│                  Storage        │                 │
└─────────────────────────────────┼─────────────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              │                   │                    │
              ▼                   ▼                    │
   POST /api/compliance    POST /api/chat              │
   ┌──────────────────┐   ┌──────────────────┐        │
   │ Takes profile     │   │ Takes profile +   │        │
   │ Returns JSON:     │   │ user question     │        │
   │ - obligations[]   │   │ Returns streamed   │        │
   │ - deadlines[]     │   │ compliance answer  │        │
   │ - risk_score      │   │ with sources       │        │
   └────────┬─────────┘   └────────┬──────────┘        │
            │                      │                    │
            ▼                      ▼                    │
   ┌─────────────────────────────────────────────┐     │
   │  Claude Sonnet via @ai-sdk/anthropic        │     │
   │                                              │     │
   │  System prompt contains:                     │     │
   │  - Business profile (from localStorage)      │     │
   │  - Full regulatory knowledge base            │     │
   │  - Scottish-specific rules                   │     │
   │  - Deadline calculation logic                │     │
   │  - Response format instructions              │     │
   └─────────────────────────────────────────────┘     │
              │                                         │
              ▼                                         │
   ┌─────────────────────────────────────────────┐     │
   │  localStorage                                │     │
   │                                              │     │
   │  regbot:profile     → business info JSON     │◀────┘
   │  regbot:compliance  → obligations + deadlines│
   │  regbot:chatHistory → past Q&A messages      │
   └─────────────────────────────────────────────┘
```

---

## REGULATORY KNOWLEDGE BASE

This is the domain knowledge that makes RegBot specific and valuable. It lives in `lib/regulations.ts` and is injected into every Claude system prompt.

### Categories of Obligations

```typescript
export type RegCategory =
  | 'hmrc'           // HMRC — VAT, PAYE, Self Assessment, Corporation Tax
  | 'companies_house' // Companies House — annual filings, confirmation statements
  | 'council'        // Local council — licences, premises, food hygiene
  | 'employment'     // Employer obligations — pensions, NMW, right to work
  | 'sector'         // Sector-specific — food, alcohol, trades, health
  | 'data'           // GDPR, data protection, ICO registration
  | 'scottish';      // Scotland-specific — LBTT, Scottish Income Tax, Licensing Act

export type DeadlineSeverity = 'overdue' | 'urgent' | 'warning' | 'safe';
```

### Key Scottish/UK Regulations to Encode

#### HMRC
- **VAT Returns**: Quarterly (deadlines: 7 May, 7 Aug, 7 Nov, 7 Feb — 1 month + 7 days after quarter end). Online filing: 7 days extra. Penalty: 2% surcharge escalating to 15%.
- **PAYE/RTI**: Monthly on or before each payday. Late filing: £100-£400/month penalty.
- **Self Assessment**: 31 Jan (online) / 31 Oct (paper). Late: £100 immediate, £10/day after 3 months.
- **Corporation Tax**: Payment 9 months + 1 day after accounting period end. Return due 12 months after. Late: £100 penalty, then £200 after 3 months.
- **CIS (Construction Industry Scheme)**: Monthly returns by 19th of each month if employing subcontractors.

#### Companies House
- **Confirmation Statement**: Due annually, within 14 days of anniversary. Late: £150 penalty → £375 → £750 → £1,500.
- **Annual Accounts**: Due 9 months after financial year end (private co). Late: £150 → £375 → £750 → £1,500.
- **Change of Details**: Directors, address, etc. — must file within 14 days. No penalty but failure is an offence.

#### Scottish-Specific
- **Scottish Licensing Act 2005**: Premises licence annual fee (due on anniversary). Personal licence renewal every 10 years. Mandatory training refresher every 5 years.
- **LBTT (Land & Buildings Transaction Tax)**: Scottish replacement for Stamp Duty. Different rates and bands.
- **Scottish Income Tax**: Different bands from rUK (Starter 19%, Basic 20%, Intermediate 21%, Higher 42%, Advanced 45%, Top 48% — 2025-26).
- **Food Standards Scotland**: Food hygiene inspections, FHRS (Food Hygiene Rating Scheme), allergen display requirements, Natasha's Law compliance.
- **Deposit Return Scheme**: Scotland's DRS for single-use drinks containers.
- **Non-Domestic Rates**: Rates relief schemes specific to Scotland (Small Business Bonus Scheme — 100% relief if rateable value ≤£12,000).

#### Council-Specific (Edinburgh Example for Demo)
- **City of Edinburgh Council**: Premises licence, late hours catering licence, street trader licence, HMO licence, building warrants.
- **Food hygiene registration**: Free but mandatory — must register 28 days before opening.
- **Outdoor seating licence**: Required for tables/chairs on public pavement.
- **Alcohol licence**: Premises licence (£200-£900 depending on rateable value). Occasional licence for events.

#### Employment
- **Auto-enrolment Pensions**: Must enrol eligible workers within 3 months of start. Re-enrolment every 3 years. Minimum contribution: 3% employer, 5% employee.
- **National Minimum/Living Wage**: From April 2025 — £12.21/hr (21+), £10.00 (18-20), £7.55 (under 18). Penalties: up to 200% of arrears.
- **Right to Work Checks**: Must check before employment starts. £20,000 civil penalty per illegal worker.
- **Employer's Liability Insurance**: Must hold minimum £5M. £2,500/day penalty for non-compliance.
- **Health & Safety**: Risk assessments mandatory if 5+ employees. Written policy if 5+ employees.

#### Data Protection
- **ICO Registration**: Annual fee £40 (micro) / £60 (small) / £2,900 (large). Must register if processing personal data. Criminal offence if not registered.
- **GDPR**: Privacy notice, data processing records, breach notification (72 hours to ICO).

### Deadline Calculation Logic (lib/deadlines.ts)

```typescript
export function calculateDeadlines(profile: BusinessProfile): Deadline[] {
  const deadlines: Deadline[] = [];
  const today = new Date();

  // VAT deadlines (if VAT registered)
  if (profile.vatRegistered) {
    const vatQuarters = getNextVATQuarters(today, 4);
    vatQuarters.forEach(q => {
      deadlines.push({
        id: `vat-${q.period}`,
        title: `VAT Return — ${q.period}`,
        category: 'hmrc',
        dueDate: q.dueDate,
        description: 'Submit VAT return and payment to HMRC',
        penalty: '2% surcharge on VAT owed, escalating to 15%',
        action: 'File via HMRC online services',
        severity: getSeverity(q.dueDate, today),
      });
    });
  }

  // Companies House (if limited company)
  if (profile.companyType === 'limited') {
    // Confirmation statement
    deadlines.push({
      id: 'ch-confirmation',
      title: 'Companies House Confirmation Statement',
      category: 'companies_house',
      dueDate: getNextAnniversary(profile.incorporationDate || today),
      description: 'Annual confirmation that company details are up to date',
      penalty: '£150 initial penalty, escalating to £1,500',
      action: 'File via Companies House WebFiling',
      severity: getSeverity(getNextAnniversary(profile.incorporationDate || today), today),
    });
  }

  // Self Assessment (if sole trader)
  if (profile.companyType === 'sole_trader') {
    deadlines.push({
      id: 'sa-online',
      title: 'Self Assessment Tax Return',
      category: 'hmrc',
      dueDate: new Date(today.getFullYear() + (today.getMonth() >= 1 ? 1 : 0), 0, 31),
      description: 'Annual self assessment for sole traders',
      penalty: '£100 immediate fine, then £10/day after 3 months',
      action: 'File via HMRC Self Assessment online',
      severity: getSeverity(new Date(today.getFullYear() + 1, 0, 31), today),
    });
  }

  // PAYE (if has employees)
  if (profile.employeeCount > 0) {
    deadlines.push({
      id: 'paye-monthly',
      title: 'PAYE RTI Submission',
      category: 'hmrc',
      dueDate: getNextPayday(),
      description: 'Report payroll to HMRC on or before each payday',
      penalty: '£100-£400/month late filing penalty',
      action: 'Submit via payroll software or HMRC Basic PAYE Tools',
      severity: getSeverity(getNextPayday(), today),
    });
  }

  // Auto-enrolment (if has employees)
  if (profile.employeeCount > 0) {
    deadlines.push({
      id: 'pension-reenrolment',
      title: 'Pensions Auto Re-enrolment',
      category: 'employment',
      dueDate: getNext3YearAnniversary(profile.pensionStagingDate || today),
      description: 'Re-assess and re-enrol eligible staff every 3 years',
      penalty: 'TPR enforcement: £50-£10,000/day',
      action: 'Complete re-declaration of compliance with The Pensions Regulator',
      severity: getSeverity(getNext3YearAnniversary(profile.pensionStagingDate || today), today),
    });
  }

  // Food hygiene (if serves food)
  if (profile.servesFood) {
    deadlines.push({
      id: 'food-hygiene',
      title: 'Food Hygiene Rating — Maintain Compliance',
      category: 'sector',
      dueDate: null, // Ongoing — inspection can happen any time
      description: 'Maintain food hygiene standards (Food Standards Scotland)',
      penalty: 'Closure notice, prosecution, or food hygiene improvement notice',
      action: 'Ensure Safer Food Better Business records up to date. Allergen info displayed (Natasha\'s Law).',
      severity: 'warning',
    });
  }

  // Alcohol licence (if serves alcohol — Scottish Licensing Act 2005)
  if (profile.servesAlcohol) {
    deadlines.push({
      id: 'alcohol-annual-fee',
      title: 'Premises Licence Annual Fee',
      category: 'scottish',
      dueDate: getNextAnniversary(profile.licenceGrantDate || today),
      description: 'Annual fee to Edinburgh Licensing Board (Scottish Licensing Act 2005)',
      penalty: 'Licence suspension or revocation',
      action: 'Pay annual fee to City of Edinburgh Council Licensing',
      severity: getSeverity(getNextAnniversary(profile.licenceGrantDate || today), today),
    });
  }

  // ICO Registration (if processing personal data — basically everyone)
  deadlines.push({
    id: 'ico-registration',
    title: 'ICO Data Protection Fee',
    category: 'data',
    dueDate: getNextAnniversary(profile.icoRegistrationDate || today),
    description: 'Annual data protection fee to Information Commissioner',
    penalty: 'Criminal offence — up to £4,350 fine',
    action: `Pay £${profile.employeeCount <= 10 ? 40 : profile.employeeCount <= 250 ? 60 : 2900} via ICO website`,
    severity: getSeverity(getNextAnniversary(profile.icoRegistrationDate || today), today),
  });

  // Employer's Liability Insurance (if has employees)
  if (profile.employeeCount > 0) {
    deadlines.push({
      id: 'eli-renewal',
      title: "Employer's Liability Insurance Renewal",
      category: 'employment',
      dueDate: getNextAnniversary(profile.eliRenewalDate || today),
      description: 'Minimum £5M cover required by law',
      penalty: '£2,500 per day without valid insurance',
      action: 'Renew with insurer, display certificate at premises',
      severity: getSeverity(getNextAnniversary(profile.eliRenewalDate || today), today),
    });
  }

  return deadlines.sort((a, b) => {
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return a.dueDate.getTime() - b.dueDate.getTime();
  });
}

function getSeverity(dueDate: Date, today: Date): DeadlineSeverity {
  const daysUntil = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (daysUntil < 0) return 'overdue';
  if (daysUntil <= 7) return 'urgent';
  if (daysUntil <= 30) return 'warning';
  return 'safe';
}
```

---

## TEAM ASSIGNMENTS

### 3 Team Members — Parallel Workstreams

| Person | Role | Focus | Files They Own |
|--------|------|-------|----------------|
| **Person A (Yash)** | Lead / Backend + AI | API routes, system prompts, Claude integration, regulatory knowledge base | `api/chat/route.ts`, `api/compliance/route.ts`, `lib/prompts.ts`, `lib/regulations.ts`, `lib/deadlines.ts`, `lib/types.ts` |
| **Person B** | Frontend — Onboarding + Dashboard | Onboarding form, dashboard layout, deadline timeline, compliance map display | `page.tsx`, `dashboard/page.tsx`, `OnboardingForm.tsx`, `DeadlineTimeline.tsx`, `ComplianceMap.tsx`, `DeadlineCard.tsx`, `StatCard.tsx` |
| **Person C** | Frontend — Chat + Polish + Deploy | Chat interface, nav bar, status badges, Vercel deploy, demo prep, testing | `ComplianceChat.tsx`, `Navbar.tsx`, `StatusBadge.tsx`, `layout.tsx`, `globals.css`, Vercel setup, testing |

### How to Work in Parallel
1. **All three**: Start with Phase 1 together (scaffold + setup). One person runs `create-next-app`, others set up their files.
2. **Split**: Person A builds API routes + prompts. Person B builds onboarding form + dashboard UI (with mock data first). Person C builds chat UI + nav (with mock responses first).
3. **Wire up**: Once API routes are ready (Person A), Person B + C connect their UIs to real endpoints.
4. **Polish**: Everyone polishes their own components. Person C handles deploy + testing.

### Git Branch Strategy
```
main              ← deploy branch (Vercel watches this)
├── feat/onboarding    (Person B)
├── feat/api           (Person A)
├── feat/chat          (Person C)
```
Merge to `main` frequently. Don't let branches drift. Small PRs, fast merges.

---

## PHASE 1 — FOUNDATION (Hours 0-3)

### All Team Members Together

#### Step 1.1: Scaffold (Person A runs, others watch)
```bash
npx create-next-app@latest regbot --typescript --tailwind --app --src-dir --use-npm
cd regbot
npm i @anthropic-ai/sdk ai @ai-sdk/anthropic lucide-react date-fns
npx shadcn@latest init
npx shadcn@latest add button card input select textarea badge tabs label radio-group checkbox progress separator
```

#### Step 1.2: Tailwind Config (Person C)
Create `tailwind.config.ts` with the color tokens from the Design System section above.

#### Step 1.3: Types (Person A)
Create `src/lib/types.ts`:

```typescript
// ============ BUSINESS PROFILE ============
export interface BusinessProfile {
  // Identity
  businessName: string;
  ownerName: string;
  businessType: BusinessType;
  companyType: CompanyType;

  // Location
  councilArea: CouncilArea;
  postcode: string;

  // Tax & Finance
  vatRegistered: boolean;
  vatNumber?: string;
  vatQuarterEnd?: 'march' | 'june' | 'september' | 'december';
  turnoverBand: TurnoverBand;

  // Employees
  employeeCount: number;
  usesSubcontractors: boolean; // triggers CIS

  // Sector-specific
  servesFood: boolean;
  servesAlcohol: boolean;
  handlesPersonalData: boolean;

  // Key dates (optional — for more accurate deadlines)
  incorporationDate?: string;     // ISO date
  licenceGrantDate?: string;      // alcohol licence
  icoRegistrationDate?: string;
  pensionStagingDate?: string;
  eliRenewalDate?: string;
  financialYearEnd?: string;

  // Completed flag
  onboardingComplete: boolean;
}

export type BusinessType =
  | 'cafe_restaurant'
  | 'pub_bar'
  | 'takeaway'
  | 'retail_shop'
  | 'hair_beauty'
  | 'tradesperson_plumber'
  | 'tradesperson_electrician'
  | 'tradesperson_builder'
  | 'tradesperson_other'
  | 'professional_services'
  | 'accommodation'
  | 'other';

export type CompanyType = 'sole_trader' | 'limited' | 'partnership' | 'llp';

export type CouncilArea =
  | 'edinburgh'
  | 'glasgow'
  | 'aberdeen'
  | 'dundee'
  | 'fife'
  | 'highland'
  | 'stirling'
  | 'perth_kinross'
  | 'other';

export type TurnoverBand =
  | 'under_85k'    // Below VAT threshold
  | '85k_250k'
  | '250k_1m'
  | 'over_1m';

// ============ COMPLIANCE ============
export type RegCategory =
  | 'hmrc'
  | 'companies_house'
  | 'council'
  | 'employment'
  | 'sector'
  | 'data'
  | 'scottish';

export type DeadlineSeverity = 'overdue' | 'urgent' | 'warning' | 'safe';

export interface Obligation {
  id: string;
  title: string;
  category: RegCategory;
  description: string;
  appliesWhen: string;      // e.g., "VAT registered", "Serves alcohol"
  frequency: string;        // e.g., "Quarterly", "Annual", "Ongoing"
  penalty: string;
  source: string;           // e.g., "HMRC", "Companies House"
  sourceUrl?: string;
}

export interface Deadline {
  id: string;
  title: string;
  category: RegCategory;
  dueDate: string | null;   // ISO date string, null = ongoing
  description: string;
  penalty: string;
  action: string;
  severity: DeadlineSeverity;
}

export interface ComplianceMap {
  profile: BusinessProfile;
  obligations: Obligation[];
  deadlines: Deadline[];
  riskScore: number;         // 0-100
  generatedAt: string;       // ISO datetime
  summary: string;           // Plain English overview
}

// ============ CATEGORY DISPLAY ============
export const CATEGORY_CONFIG: Record<RegCategory, { label: string; color: string; icon: string }> = {
  hmrc: { label: 'HMRC', color: 'blue', icon: '🏛️' },
  companies_house: { label: 'Companies House', color: 'green', icon: '📋' },
  council: { label: 'Local Council', color: 'amber', icon: '🏢' },
  employment: { label: 'Employment', color: 'purple', icon: '👥' },
  sector: { label: 'Sector Specific', color: 'orange', icon: '🔧' },
  data: { label: 'Data Protection', color: 'cyan', icon: '🔒' },
  scottish: { label: 'Scotland Specific', color: 'teal', icon: '🏴' },
};
```

#### Step 1.4: Constants (Person B)
Create `src/lib/constants.ts`:

```typescript
export const BUSINESS_TYPES = [
  { value: 'cafe_restaurant', label: 'Café / Restaurant', icon: '☕' },
  { value: 'pub_bar', label: 'Pub / Bar', icon: '🍺' },
  { value: 'takeaway', label: 'Takeaway / Food Van', icon: '🥡' },
  { value: 'retail_shop', label: 'Retail Shop', icon: '🛍️' },
  { value: 'hair_beauty', label: 'Hair / Beauty Salon', icon: '💈' },
  { value: 'tradesperson_plumber', label: 'Plumber', icon: '🔧' },
  { value: 'tradesperson_electrician', label: 'Electrician', icon: '⚡' },
  { value: 'tradesperson_builder', label: 'Builder / General', icon: '🏗️' },
  { value: 'tradesperson_other', label: 'Other Trade', icon: '🛠️' },
  { value: 'professional_services', label: 'Professional Services', icon: '💼' },
  { value: 'accommodation', label: 'B&B / Accommodation', icon: '🏠' },
  { value: 'other', label: 'Other', icon: '📦' },
] as const;

export const COUNCIL_AREAS = [
  { value: 'edinburgh', label: 'City of Edinburgh' },
  { value: 'glasgow', label: 'Glasgow City' },
  { value: 'aberdeen', label: 'Aberdeen City' },
  { value: 'dundee', label: 'Dundee City' },
  { value: 'fife', label: 'Fife' },
  { value: 'highland', label: 'Highland' },
  { value: 'stirling', label: 'Stirling' },
  { value: 'perth_kinross', label: 'Perth & Kinross' },
  { value: 'other', label: 'Other Council Area' },
] as const;

export const COMPANY_TYPES = [
  { value: 'sole_trader', label: 'Sole Trader' },
  { value: 'limited', label: 'Limited Company (Ltd)' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'llp', label: 'Limited Liability Partnership (LLP)' },
] as const;

export const TURNOVER_BANDS = [
  { value: 'under_85k', label: 'Under £85,000 (below VAT threshold)' },
  { value: '85k_250k', label: '£85,000 - £250,000' },
  { value: '250k_1m', label: '£250,000 - £1,000,000' },
  { value: 'over_1m', label: 'Over £1,000,000' },
] as const;
```

#### Step 1.5: localStorage Helpers (Person C)
Create `src/lib/storage.ts`:

```typescript
import { BusinessProfile, ComplianceMap } from './types';

const KEYS = {
  profile: 'regbot:profile',
  compliance: 'regbot:compliance',
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

export function clearAll(): void {
  if (typeof window !== 'undefined') {
    Object.values(KEYS).forEach(k => localStorage.removeItem(k));
  }
}
```

#### Step 1.6: Push to GitHub + Connect Vercel (Person C)
```bash
git init
git add .
git commit -m "scaffold: Next.js + shadcn + types + constants"
# Create repo on GitHub, push, connect to Vercel
# Add ANTHROPIC_API_KEY in Vercel Environment Variables
```

**✅ CHECKPOINT: App runs on localhost. All types compile. Vercel deploys empty app.**

---

## PHASE 2 — THE BRAIN (Hours 3-6)

### Person A: API Routes + System Prompts

#### Step 2.1: System Prompts (lib/prompts.ts)

```typescript
import { BusinessProfile } from './types';

export function getComplianceSystemPrompt(profile: BusinessProfile): string {
  return `You are RegBot, an expert AI compliance advisor for Scottish small businesses. You have deep knowledge of UK and Scottish regulations including HMRC, Companies House, Scottish Licensing Act 2005, Food Standards Scotland, employment law, GDPR, and local council requirements.

## BUSINESS PROFILE
- Business: ${profile.businessName}
- Owner: ${profile.ownerName}
- Type: ${profile.businessType}
- Company structure: ${profile.companyType}
- Council area: ${profile.councilArea}
- Postcode: ${profile.postcode}
- VAT registered: ${profile.vatRegistered}${profile.vatNumber ? ` (${profile.vatNumber})` : ''}
- Turnover band: ${profile.turnoverBand}
- Employees: ${profile.employeeCount}
- Uses subcontractors: ${profile.usesSubcontractors}
- Serves food: ${profile.servesFood}
- Serves alcohol: ${profile.servesAlcohol}
- Handles personal data: ${profile.handlesPersonalData}
- Financial year end: ${profile.financialYearEnd || 'Not specified'}
- Incorporation date: ${profile.incorporationDate || 'Not specified'}

## YOUR TASK
Generate a complete compliance map for this business. Return ONLY valid JSON in this exact format:

{
  "obligations": [
    {
      "id": "unique-id",
      "title": "Obligation title",
      "category": "hmrc|companies_house|council|employment|sector|data|scottish",
      "description": "What this obligation requires",
      "appliesWhen": "Why this applies to this business",
      "frequency": "Quarterly|Annual|Monthly|Ongoing|One-off",
      "penalty": "What happens if you miss it",
      "source": "Regulatory body name",
      "sourceUrl": "URL to official guidance"
    }
  ],
  "deadlines": [
    {
      "id": "unique-id",
      "title": "Deadline title",
      "category": "hmrc|companies_house|council|employment|sector|data|scottish",
      "dueDate": "2026-MM-DD or null for ongoing",
      "description": "What needs to be done",
      "penalty": "Consequence of missing",
      "action": "Specific step to take",
      "severity": "overdue|urgent|warning|safe"
    }
  ],
  "riskScore": 0-100,
  "summary": "2-3 sentence plain English overview of this business's compliance position"
}

## RULES
- Today's date is ${new Date().toISOString().split('T')[0]}.
- Calculate real deadlines based on today's date and the business profile dates.
- severity: overdue = past due, urgent = 0-7 days, warning = 8-30 days, safe = 30+ days.
- Include ALL obligations that apply to this specific business. Don't miss any.
- For Scottish businesses, always include Scotland-specific obligations (Scottish Income Tax, licensing, etc.).
- Be specific about penalty amounts — don't say "a fine", say "£150 escalating to £1,500".
- sourceUrl should be real gov.uk, revenue.scot, or council URLs where possible.
- riskScore: 0 = no upcoming deadlines, 100 = multiple overdue obligations. Weight overdue and urgent items heavily.
- Return ONLY the JSON object. No markdown, no explanation, no backticks.`;
}

export function getChatSystemPrompt(profile: BusinessProfile): string {
  return `You are RegBot, a knowledgeable and friendly compliance advisor for Scottish small businesses. You help ${profile.ownerName} at ${profile.businessName} navigate regulations.

## BUSINESS CONTEXT
- Business: ${profile.businessName} (${profile.businessType})
- Structure: ${profile.companyType}
- Location: ${profile.councilArea}, Scotland
- Employees: ${profile.employeeCount}
- VAT registered: ${profile.vatRegistered}
- Serves food: ${profile.servesFood}
- Serves alcohol: ${profile.servesAlcohol}

## HOW TO RESPOND
1. Always answer specific to THIS business and THIS location (Scotland, ${profile.councilArea}).
2. Cite the specific regulation or law (e.g., "Under the Scottish Licensing Act 2005, Section 33...").
3. Include actual penalty amounts, not vague warnings.
4. If something differs between Scotland and England/Wales, ALWAYS flag this: "Note: This is different in Scotland..."
5. Provide the specific action to take and where to do it (e.g., "File via HMRC online at gov.uk/vat-returns").
6. If you're not 100% certain, say so and suggest where to verify (e.g., "I'd recommend confirming with City of Edinburgh Council Licensing on 0131 XXX XXXX").
7. Keep answers concise but complete. Use bullet points for lists.
8. Tone: Professional but approachable. Like a knowledgeable friend who happens to know every regulation. Scottish-friendly.

## WHAT YOU KNOW
- UK tax law (HMRC): VAT, PAYE, Self Assessment, Corporation Tax, CIS
- Companies House: Filing requirements, deadlines, penalties
- Scottish Licensing Act 2005: Premises licences, personal licences, occasional licences
- Food Standards Scotland: Food hygiene, allergens, Natasha's Law
- Employment law: National Minimum Wage, auto-enrolment pensions, right to work, employer's liability
- GDPR / ICO: Data protection registration, privacy notices, breach reporting
- Scottish-specific: LBTT, Scottish Income Tax bands, Non-Domestic Rates, Small Business Bonus Scheme
- Local council: Edinburgh licensing, food hygiene registration, premises licences
- Construction (if applicable): CIS scheme, CSCS cards, building warrants

## IMPORTANT
- NEVER give formal legal advice. You are an information tool, not a lawyer.
- Always end advice about complex matters with: "For specific legal advice, consult an accountant or solicitor."
- If asked about something outside your knowledge, say so honestly.`;
}
```

#### Step 2.2: Compliance API Route (api/compliance/route.ts)

```typescript
import Anthropic from '@anthropic-ai/sdk';
import { getComplianceSystemPrompt } from '@/lib/prompts';
import { BusinessProfile } from '@/lib/types';

const anthropic = new Anthropic();

export async function POST(req: Request) {
  try {
    const { profile } = (await req.json()) as { profile: BusinessProfile };

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      system: getComplianceSystemPrompt(profile),
      messages: [
        {
          role: 'user',
          content: 'Generate the complete compliance map for this business.',
        },
      ],
    });

    const text = message.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('');

    // Parse the JSON response
    const complianceMap = JSON.parse(text);

    return Response.json({
      ...complianceMap,
      profile,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Compliance generation error:', error);
    return Response.json(
      { error: 'Failed to generate compliance map' },
      { status: 500 }
    );
  }
}
```

#### Step 2.3: Chat API Route (api/chat/route.ts)

```typescript
import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import { getChatSystemPrompt } from '@/lib/prompts';
import { BusinessProfile } from '@/lib/types';

export async function POST(req: Request) {
  const { messages, profile } = await req.json();

  const result = streamText({
    model: anthropic('claude-sonnet-4-20250514'),
    system: getChatSystemPrompt(profile as BusinessProfile),
    messages,
  });

  return result.toDataStreamResponse();
}
```

**✅ CHECKPOINT: POST to /api/compliance with a test profile returns valid JSON compliance map. POST to /api/chat streams a response.**

### Person B: Onboarding Form (Parallel with Person A)

#### Step 2.4: OnboardingForm.tsx

Build a multi-step form with these steps:

**Step 1 — "About Your Business"**
- Business name (text input)
- Your name (text input)
- Business type (select from BUSINESS_TYPES)
- Company structure (radio group from COMPANY_TYPES)

**Step 2 — "Location & Size"**
- Council area (select from COUNCIL_AREAS)
- Postcode (text input)
- Number of employees (number input)
- Use subcontractors? (yes/no toggle — show only if tradesperson)
- Annual turnover band (select from TURNOVER_BANDS)

**Step 3 — "What You Do"**
- VAT registered? (yes/no toggle — auto-suggest yes if turnover > £85k)
- Serve food? (yes/no toggle)
- Serve alcohol? (yes/no toggle — show only if food/hospitality type)
- Handle personal data? (yes/no toggle — default yes, explain why)

**Step 4 — "Key Dates (Optional)"**
- Financial year end (date picker)
- Company incorporation date (date picker — show only if limited)
- Alcohol licence grant date (date picker — show only if serves alcohol)
- Brief explanation: "These help us calculate your exact deadlines. You can skip and add them later."

**On Submit:**
1. Save profile to localStorage
2. POST to `/api/compliance` with profile
3. Save returned compliance map to localStorage
4. Redirect to `/dashboard`

**UI Notes:**
- Progress bar at top showing steps 1-4
- Back/Next buttons
- Form validation on each step before proceeding
- "Generating your compliance map..." loading state with spinner on final submit
- Use shadcn/ui Select, RadioGroup, Input, Label, Button, Progress, Checkbox components

**✅ CHECKPOINT: Can fill form, submit, see compliance map JSON in console, redirects to /dashboard.**

### Person C: Layout + Navbar (Parallel)

#### Step 2.5: layout.tsx + Navbar.tsx + globals.css

- `Navbar.tsx`: Navy header with "RegBot" logo text, tagline "Compliance made simple", and a "Reset" button (clears localStorage, returns to onboarding)
- `layout.tsx`: Wraps all pages with Navbar, checks if profile exists on client — if not on `/` or `/dashboard`, redirect appropriately
- `globals.css`: Tailwind imports + any custom overrides

**✅ CHECKPOINT: Nav bar displays on all pages. Brand colors applied.**

---

## PHASE 3 — DASHBOARD & CHAT (Hours 6-10)

### Person B: Dashboard Page + Components

#### Step 3.1: dashboard/page.tsx

Layout:
```
┌─────────────────────────────────────────────────┐
│  Navbar                                          │
├────────┬────────┬────────┬──────────────────────┤
│ StatCard│StatCard│StatCard│    StatCard           │
│  Total  │Urgent │ Next   │   Risk Score          │
│ Oblig.  │ Items │Deadline│   (0-100)             │
├─────────┴────────┴────────┴─────────────────────┤
│                                                  │
│  Tabs: [Deadlines] [Compliance Map] [Ask RegBot] │
│                                                  │
│  ┌─────────────────────────────────────────────┐ │
│  │  Tab content area                           │ │
│  │                                             │ │
│  │  Deadlines: sorted timeline of cards        │ │
│  │  Map: categorised obligations               │ │
│  │  Chat: AI Q&A interface                     │ │
│  └─────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

- If no profile in localStorage, redirect to `/`
- Load compliance map from localStorage on mount
- If no compliance map, show "Generating..." and call `/api/compliance`

#### Step 3.2: StatCard.tsx
- Simple card: label (small grey), value (large bold), optional color indicator
- Used for: "12 Obligations", "3 Urgent", "Next: VAT Return (14 days)", "Risk Score: 67"

#### Step 3.3: DeadlineTimeline.tsx + DeadlineCard.tsx
- List of DeadlineCards sorted by dueDate (earliest first)
- Each card shows: severity badge (colored dot + label), title, due date (relative: "in 14 days"), category icon, penalty, action button text
- Overdue items at top with red border-left
- Filter buttons: All | Urgent | This Month | This Quarter

#### Step 3.4: ComplianceMap.tsx
- Grouped by category (HMRC, Companies House, Council, etc.)
- Each category is a collapsible section with count badge
- Each obligation shows: title, frequency, penalty, source link
- Color-coded left border per category

**✅ CHECKPOINT: Dashboard loads with real data from Claude. Deadlines display. Compliance map displays. Stats are correct.**

### Person C: Chat Interface

#### Step 3.5: ComplianceChat.tsx

Uses Vercel AI SDK's `useChat` hook:

```typescript
'use client';
import { useChat } from 'ai/react';
import { getProfile } from '@/lib/storage';

export function ComplianceChat() {
  const profile = getProfile();

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    body: { profile },
    initialMessages: [
      {
        id: 'welcome',
        role: 'assistant',
        content: `Hi ${profile?.ownerName || 'there'}! I'm RegBot, your compliance advisor. I know all about the regulations that apply to ${profile?.businessName || 'your business'}. Ask me anything — deadlines, penalties, Scottish licensing law, VAT, you name it. What would you like to know?`,
      },
    ],
  });

  // Build chat UI with messages, input field, send button
  // User bubbles: bg-brand-accent text-white
  // Assistant bubbles: bg-brand-ghost text-text
  // Show typing indicator when isLoading
  // Suggested questions as clickable chips above input:
  //   "What are my VAT deadlines?"
  //   "Do I need a food hygiene certificate?"
  //   "What's the penalty for late Companies House filing?"
  //   "Tell me about Scottish alcohol licensing"
}
```

**Suggested question chips** (show when chat is empty or after first response):
- "What are my upcoming deadlines?"
- "Explain the penalty for late VAT returns"
- "Do I need an alcohol licence for a private event?"
- "What allergen display rules apply to my business?"
- "How does Scottish Income Tax differ from England?"
- "What's the Small Business Bonus Scheme?"

**✅ CHECKPOINT: Can chat with RegBot. Responses stream. Answers are specific to the business profile. Suggested questions work.**

---

## PHASE 4 — POLISH & DEMO (Hours 10-14)

### All Team Members

#### Step 4.1: Demo Scenario — "Sarah's Café" (Person A prepares)

Pre-fill this profile for the demo:

```json
{
  "businessName": "The Brewed Awakening",
  "ownerName": "Sarah",
  "businessType": "cafe_restaurant",
  "companyType": "limited",
  "councilArea": "edinburgh",
  "postcode": "EH1 2QL",
  "vatRegistered": true,
  "vatQuarterEnd": "march",
  "turnoverBand": "85k_250k",
  "employeeCount": 4,
  "usesSubcontractors": false,
  "servesFood": true,
  "servesAlcohol": true,
  "handlesPersonalData": true,
  "incorporationDate": "2022-06-15",
  "licenceGrantDate": "2022-08-01",
  "financialYearEnd": "2026-03-31",
  "onboardingComplete": true
}
```

This profile triggers the maximum number of obligations — perfect for demo impact:
- HMRC: VAT quarterly + PAYE monthly + Corporation Tax
- Companies House: Confirmation statement + annual accounts
- Council: Food hygiene + alcohol licence + premises licence
- Employment: Auto-enrolment + NMW + Employer's Liability
- Scottish: Scottish Licensing Act, Scottish Income Tax
- Data: ICO registration, GDPR compliance

#### Step 4.2: UI Polish (Person B)

- Smooth transitions between onboarding steps (fade or slide)
- Loading skeleton on dashboard while compliance map generates
- Empty states for each tab
- Mobile responsive (at minimum: stacked layout on small screens)
- Favicon + page titles (`<title>RegBot — Compliance Made Simple</title>`)

#### Step 4.3: Error Handling (Person C)

- API errors: Show toast/banner "Something went wrong. Try again." with retry button
- Empty profile: Redirect to onboarding
- Invalid JSON from Claude: Fallback to a hardcoded compliance map for the demo scenario
- Rate limits: If Anthropic API rate limited, show friendly message

#### Step 4.4: Hardcoded Fallback (Person A)

Create `lib/fallback.ts` with a pre-generated compliance map for "Sarah's Café" that can be used if the API fails during demo. This is insurance — you do NOT want an API error during your presentation.

```typescript
export const FALLBACK_COMPLIANCE_MAP: ComplianceMap = {
  // Pre-generated compliance map for the demo scenario
  // Copy the JSON output from a successful /api/compliance call
};
```

#### Step 4.5: Final Deploy + Test (Person C)

```bash
git add .
git commit -m "polish: ready for demo"
git push origin main
# Vercel auto-deploys
# Test the live URL end-to-end
```

---

## TESTING CHECKLIST

### Before Demo — All Must Pass

#### Onboarding Flow
- [ ] Can select each business type from dropdown
- [ ] Can select each council area
- [ ] Company type radio buttons work
- [ ] VAT toggle shows/hides VAT number field
- [ ] "Serves alcohol" only shows for food/hospitality types
- [ ] Employee count accepts 0+
- [ ] Turnover band select works
- [ ] Progress bar advances with each step
- [ ] Back button works on each step
- [ ] Form validates required fields before advancing
- [ ] Final submit shows loading state
- [ ] Profile saves to localStorage correctly (check DevTools → Application → Local Storage)
- [ ] Redirects to /dashboard after submit
- [ ] API call to /api/compliance returns valid JSON

#### Dashboard
- [ ] Stats display correct numbers (total obligations, urgent count, next deadline)
- [ ] Risk score displays and makes sense (higher if more urgent/overdue items)
- [ ] Deadlines tab shows items sorted by date
- [ ] Overdue items show red styling
- [ ] Urgent items show amber/red styling
- [ ] Safe items show green styling
- [ ] Compliance map groups by category
- [ ] Each category shows correct icon and count
- [ ] Category sections expand/collapse

#### Chat
- [ ] Welcome message appears with business name
- [ ] Can type a question and get a streamed response
- [ ] Response is specific to the business profile (mentions business name, location, type)
- [ ] Suggested question chips work (click → sends question)
- [ ] Multiple back-and-forth messages work
- [ ] Response mentions Scottish-specific regulations when relevant
- [ ] Chat scrolls to bottom on new messages
- [ ] Loading indicator shows while streaming

#### Scottish Specificity
- [ ] Compliance map includes Scottish Income Tax note
- [ ] Alcohol licence references Scottish Licensing Act 2005 (not English/Welsh law)
- [ ] Food obligations reference Food Standards Scotland (not FSA England)
- [ ] Council obligations reference the specific council area selected
- [ ] Chat responses correctly distinguish Scottish vs English rules

#### Error & Edge Cases
- [ ] Visiting /dashboard without a profile redirects to /
- [ ] "Reset" button in navbar clears data and returns to onboarding
- [ ] App works on mobile viewport (stacked layout, no horizontal overflow)
- [ ] Fallback compliance map loads if API fails
- [ ] Page doesn't crash if localStorage is empty

#### Deployment
- [ ] Vercel deployment succeeds
- [ ] Live URL loads onboarding page
- [ ] Full flow works on live URL (onboarding → dashboard → chat)
- [ ] ANTHROPIC_API_KEY is set in Vercel environment variables
- [ ] No API keys exposed in client-side code

---

## DEMO SCRIPT (3-5 Minutes)

### "The Problem" (40 seconds)
"Meet Sarah. She runs a café in Edinburgh's Old Town. She's a brilliant chef, a great host, and she's drowning in paperwork.

Right now, she has to juggle HMRC for VAT returns and PAYE. Companies House for her annual filings. City of Edinburgh Council for her food hygiene and alcohol licence. Food Standards Scotland for allergen compliance. The Pensions Regulator for auto-enrolment. And GDPR for her customer data.

Each one has different deadlines. Different portals. Different penalties. Miss one? Automatic £150 fine from Companies House. Late VAT? 2% surcharge on everything you owe. Let the food hygiene slip? Closure notice.

370,000 Scottish SMEs face this. They spend 1-2 days a week on admin instead of running their business. That's 740,000 hours a week of lost productivity."

### "RegBot" (15 seconds)
"RegBot is an AI compliance agent that maps every regulation to YOUR specific business, tracks every deadline, and answers every question — in plain English, specific to Scotland."

### Live Demo (3 minutes)

**1. Onboarding (45 seconds)**
- Fill in: "The Brewed Awakening", "Sarah", Café/Restaurant, Limited Company
- Edinburgh, EH1 2QL, 4 employees, £85k-£250k turnover
- VAT registered, serves food, serves alcohol
- Click "Generate My Compliance Map"
- Show loading state → redirect to dashboard

**2. Dashboard — Stats (15 seconds)**
- "Instantly: 14 obligations, 3 urgent, next deadline in 11 days. Risk score: 67."

**3. Deadlines Tab (30 seconds)**
- Point at the urgent items: "VAT return due in 11 days — £2,400 in VAT owed, 2% surcharge if she misses it"
- Point at the amber items: "Alcohol licence annual fee — 28 days, licence suspended if missed"
- "Every deadline has a severity, a penalty amount, and exactly what to do about it."

**4. Compliance Map Tab (20 seconds)**
- Expand HMRC: "4 obligations — VAT, PAYE, Corporation Tax, CIS"
- Expand Scottish: "Scottish Income Tax, Scottish Licensing Act"
- "RegBot knows the difference between Scottish and English licensing law. That matters — they're completely different Acts."

**5. Chat — The Killer Feature (45 seconds)**
- Type: "Do I need to display allergen information for takeaway orders?"
- Watch it stream a specific answer citing Natasha's Law and Food Standards Scotland
- Type: "What happens if I miss my Companies House filing?"
- Stream: Specific penalties, escalation, what to do
- "She's getting accurate, sourced compliance advice at 11pm on a Sunday. No accountant needed."

### Close (20 seconds)
"370,000 Scottish SMEs. 1-2 days a week on admin. The government says 1% more SME growth equals £320 billion by 2030. They published a Small Business Plan this year calling for digital adoption tools and a Business Growth Service.

We built one. In 14 hours. RegBot: never miss a deadline, never be surprised by a regulation change, cut your admin time in half.

And the best part? Change the profile from 'café in Edinburgh' to 'plumber in Glasgow' — every obligation, every deadline, every answer changes automatically. One tool. Every Scottish SME."

---

## CRITICAL RULES

1. **Claude Sonnet for everything.** This needs reasoning quality. Haiku is not enough for regulatory accuracy.
2. **Scottish-first.** Every answer should consider Scottish law first, then note UK-wide rules. NEVER give England-only advice.
3. **Specific penalties, always.** Never say "a fine." Say "£150 escalating to £1,500."
4. **Real sources.** Link to gov.uk, revenue.scot, or council websites. Not generic advice.
5. **localStorage for hackathon.** Don't waste time on a database.
6. **Fallback data is mandatory.** If the API fails during demo, the fallback kicks in. Non-negotiable.
7. **shadcn/ui for all components.** No custom component library.
8. **Tailwind only.** No CSS modules.
9. **Deploy after Phase 2.** Everything after that is enhancement on a live app.
10. **Test the demo flow 3 times before presenting.** On the LIVE Vercel URL, not localhost.

---

## QUICK REFERENCE — KEY COMMANDS

```bash
# Setup
npx create-next-app@latest regbot --typescript --tailwind --app --src-dir --use-npm
cd regbot
npm i @anthropic-ai/sdk ai @ai-sdk/anthropic lucide-react date-fns
npx shadcn@latest init
npx shadcn@latest add button card input select textarea badge tabs label radio-group checkbox progress separator

# Dev
npm run dev

# Deploy
git add . && git commit -m "update" && git push origin main
# Vercel auto-deploys from main

# Test API locally
curl -X POST http://localhost:3000/api/compliance \
  -H "Content-Type: application/json" \
  -d '{"profile":{"businessName":"Test Café","ownerName":"Sarah","businessType":"cafe_restaurant","companyType":"limited","councilArea":"edinburgh","postcode":"EH1 2QL","vatRegistered":true,"turnoverBand":"85k_250k","employeeCount":4,"usesSubcontractors":false,"servesFood":true,"servesAlcohol":true,"handlesPersonalData":true,"onboardingComplete":true}}'
```

---

## TIMELINE SUMMARY

| Hour | Person A (Lead/Backend) | Person B (Frontend) | Person C (Chat/Deploy) |
|------|------------------------|--------------------|-----------------------|
| 0-1 | Scaffold together | Scaffold together | Scaffold together |
| 1-2 | types.ts, prompts.ts | constants.ts, OnboardingForm start | storage.ts, layout.tsx, Navbar.tsx |
| 2-3 | regulations.ts, deadlines.ts | OnboardingForm complete | globals.css, StatusBadge.tsx |
| 3-4 | api/compliance/route.ts | OnboardingForm → API wiring | api/chat/route.ts (with Person A) |
| 4-5 | Test API, fix prompts | dashboard/page.tsx layout | ComplianceChat.tsx |
| 5-6 | Refine compliance output | StatCard.tsx, DeadlineTimeline | Chat suggested questions |
| 6-7 | **DEPLOY TO VERCEL** | DeadlineCard.tsx, filters | **DEPLOY TO VERCEL** |
| 7-8 | Fallback data | ComplianceMap.tsx | Error handling |
| 8-9 | Prompt refinement | Mobile responsive | End-to-end testing |
| 9-10 | Demo scenario setup | UI polish, animations | Testing checklist |
| 10-12 | Demo script practice | Demo script practice | Demo script practice |

---

*AI Engine Hackathon — Edinburgh, 14 March 2026*
*RegBot: Compliance made simple for Scottish SMEs*
*By Yash + Team*
