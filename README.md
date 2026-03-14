# RegBot — Compliance Made Simple

> **AI-powered compliance agent for Scottish SMEs.** Never miss a deadline, never be surprised by a regulation change, and cut your admin time in half.

**[→ Try RegBot Live](https://aienginehackathon.vercel.app/)**

---

## Description of AI Agent

RegBot is an AI-powered compliance agent that acts as a knowledgeable, always-available business advisor for Scottish SMEs. It knows exactly which regulations apply to your specific business, keeps track of your deadlines, explains changes in plain English, and answers compliance questions on demand.

**What the agent does:**

- **Profile-based mapping** — From your business profile (type, sector, location, employees, VAT status, etc.), RegBot generates a personalised compliance map of every regulation, licence, and filing that applies to you.
- **Deadline tracking** — Builds a calendar of upcoming deadlines (VAT, Companies House, licences, PAYE) with severity indicators and penalty amounts.
- **Compliance Q&A** — Chat interface where you ask questions like "Do I need an alcohol licence for a private event?" or "What are the allergen display rules for takeaway?" and get accurate, Scotland-specific answers with sources.
- **Scottish-first** — Understands Scottish Licensing Act 2005, Food Standards Scotland, LBTT, Scottish Income Tax, and council-specific requirements — not generic UK advice.

The agent is powered by OpenAI-GPT.5.2 and uses your business profile as context for every response, so answers are tailored to your situation.

---

## The Problem

Scottish SMEs are drowning in regulatory admin. Different deadlines, different portals, different penalties:

- **370,000 SMEs** in Scotland juggling HMRC, Companies House, councils, Food Standards Scotland, GDPR, pensions, and licensing
- **1–2 days/week** spent on admin and compliance (Federation of Small Businesses)
- **£150–£1,500** automatic penalty for missed Companies House filing
- **2% surcharge** on late VAT returns (escalating to 15%)

RegBot maps every obligation to your business, tracks every deadline, and answers every question — in plain English, specific to Scotland.

---

## Features

| Experience | What It Does |
|------------|--------------|
| **Onboarding** | Smart form that builds your business profile → generates a personalised compliance map |
| **Dashboard** | Deadline tracker, compliance map, and risk score at a glance |
| **AI Chat** | Ask RegBot anything — VAT deadlines, Scottish licensing law, food hygiene, penalties — with sourced, Scotland-specific answers |
| **Email Reminders** | Checks every day at 9am and sends you an email if you have an upcoming deadline — choose which deadlines to track and when (30, 14, 7, or 2 days before) |

### Scottish-First

- Scottish Licensing Act 2005, LBTT, Scottish Income Tax
- Food Standards Scotland (not FSA England)
- Council-specific obligations (Edinburgh, Glasgow, etc.)
- Real penalty amounts — never vague “a fine”

### In Progress

- **Browser-use / Browser Agent** — We are integrating [browser-use](https://github.com/browser-use/browser-use) and browser-agent to automatically fill government forms (VAT returns, Companies House filings, licence renewals) for you. The guided filing flow and agent UI are in place, but the full auto-fill integration is not finished yet.

---

## Tech Stack

- **Framework:** Next.js 15 (App Router) + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **AI:** GPT 5.2 by OpenAI
- **Storage:** localStorage

---

## Getting Started

### Prerequisites

- Node.js 18+
- OpenAI API Key

### Setup

1. **Clone and install**

   ```bash
   cd regbot
   npm install
   ```

2. **Configure environment**

   Create `.env.local` in the project root:

   ```bash
   OPENAI_API_KEY=sk-...
   ```

3. **Run the dev server**

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
regbot/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Onboarding (landing)
│   │   ├── dashboard/page.tsx     # Main dashboard
│   │   └── api/
│   │       ├── chat/route.ts      # AI compliance Q&A
│   │       └── compliance/route.ts # Compliance map generation
│   ├── components/                # UI components
│   └── lib/                       # Types, prompts, regulations, storage
└── public/
```

---

## Demo Scenario

For a quick demo, use **Istanbul Kebap** — a limited company in Edinburgh serving food and alcohol. This profile triggers the full range of obligations: HMRC, Companies House, council, employment, Scottish licensing, and data protection.

---

## License

MIT
---

*Built for AI Engine Hackathon — Edinburgh, March 2026*
