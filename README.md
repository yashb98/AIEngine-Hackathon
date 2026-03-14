# RegBot — Compliance Made Simple

> **AI-powered compliance agent for Scottish SMEs.** Never miss a deadline, never be surprised by a regulation change, and cut your admin time in half.

**[→ Try RegBot Live](https://aienginehackathon.vercel.app/)**

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

### Scottish-First

- Scottish Licensing Act 2005, LBTT, Scottish Income Tax
- Food Standards Scotland (not FSA England)
- Council-specific obligations (Edinburgh, Glasgow, etc.)
- Real penalty amounts — never vague “a fine”

---

## Tech Stack

- **Framework:** Next.js 15 (App Router) + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **AI:** Claude (Anthropic) via Vercel AI SDK
- **Storage:** localStorage (hackathon MVP; upgrade to Vercel KV for production)

---

## Getting Started

### Prerequisites

- Node.js 18+
- [Anthropic API key](https://console.anthropic.com/)

### Setup

1. **Clone and install**

   ```bash
   cd regbot
   npm install
   ```

2. **Configure environment**

   Create `.env.local` in the project root:

   ```bash
   ANTHROPIC_API_KEY=sk-ant-...
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

For a quick demo, use **Sarah's Café** — a limited company in Edinburgh serving food and alcohol. This profile triggers the full range of obligations: HMRC, Companies House, council, employment, Scottish licensing, and data protection.

---

## Deploy on Vercel

1. Push to GitHub
2. [Import the project on Vercel](https://vercel.com/new)
3. Add `ANTHROPIC_API_KEY` in Environment Variables
4. Deploy

---

## License

MIT

---

*Built for AI Engine Hackathon — Edinburgh, March 2026*
