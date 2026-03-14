The Problem: Death by Admin
Scottish SMEs (especially micro-businesses with 1–10 employees) are drowning in regulatory and administrative tasks. The owner is typically the CEO, accountant, HR department, and compliance officer all in one. Here's what that actually looks like in practice:
The regulatory landscape is fragmented and confusing. A single Scottish café owner has to deal with HMRC (VAT returns, PAYE), Companies House (annual confirmation statements, filing accounts), their local council (food hygiene certificates, premises licence, alcohol licence renewals), Health & Safety Executive requirements, GDPR compliance, and Scottish-specific regulations like the Deposit Return Scheme or allergen display laws. Each of these has different deadlines, different portals, different forms, and different penalties for getting it wrong.
The cost of non-compliance is brutal for small businesses. Miss a Companies House filing deadline? Automatic £150 penalty that escalates to £1,500. Late VAT return? Default surcharge starting at 2% of VAT owed. Let a food hygiene certificate lapse? You could be shut down. These aren't abstract risks — they're cash drains that disproportionately hit small businesses who can't afford a dedicated compliance person.
Time is the real killer. The Federation of Small Businesses estimates that small business owners spend roughly 1–2 days per week on admin and compliance. That's 20–40% of their working time not spent on growing the business, serving customers, or doing the thing they actually started the business to do. Multiply that across Scotland's ~370,000 SMEs and you're looking at an enormous amount of productive economic capacity being burned on form-filling.
Information is scattered and hard to find. Regulatory guidance is spread across gov.uk, revenue.scot, mygov.scot, local council websites, sector-specific bodies (Food Standards Scotland, SEPA, etc.). It's written in dense legal language. Changes are announced quietly. A small business owner doesn't have time to monitor 15 different government websites for updates that might affect them.

The Solution: RegBot
An AI-powered compliance agent that acts like a knowledgeable, always-available business advisor — one that knows exactly which regulations apply to your specific business, keeps track of your deadlines, explains changes in plain English, and helps you actually complete the paperwork.
Core value proposition: "Never miss a deadline, never be surprised by a regulation change, and cut your admin time in half."
Here's how it works, feature by feature:
Feature 1: Business Profile & Regulation Mapping
When a business onboards, RegBot asks a structured set of questions — business type, sector (hospitality/retail/trades/professional services), location (which council area), number of employees, VAT registered or not, limited company or sole trader, whether they serve food/alcohol, handle personal data, etc.
From this profile, RegBot automatically generates a personalised compliance map — every regulation, licence, filing, and certificate that applies to that specific business. No more guessing whether something applies to you.
Feature 2: Deadline Tracker & Smart Reminders
Based on the compliance map, RegBot builds a calendar of all upcoming deadlines — VAT quarters, Companies House confirmation statement due dates, licence renewal dates, annual accounts filing, PAYE reporting deadlines, etc. It sends reminders with escalating urgency (30 days, 14 days, 7 days, 2 days) and tells you exactly what you need to do and what the penalty is if you don't.
Feature 3: Regulation Change Monitor
RegBot monitors government sources (gov.uk, revenue.scot, local council feeds, sector bodies) and when a change is relevant to the business's profile, it sends a plain-English summary: "Starting April 2026, the National Living Wage increases to £12.50/hr. You have 3 employees on minimum wage — here's the impact on your monthly payroll and what you need to update."
Feature 4: Guided Form Completion
For common filings (VAT return, Companies House confirmation statement, council licence renewals), RegBot walks the owner through the process step by step in a conversational interface. It pre-fills what it can from the business profile, explains each field in plain language, and flags common mistakes before submission.
Feature 5: Compliance Q&A
A chat interface where the owner can ask questions like "Do I need an alcohol licence for a private event?", "What are the allergen display rules for takeaway food in Scotland?", or "Can I claim mileage as a business expense?" — and get accurate, sourced answers specific to their situation.

Hackathon Build Plan
You're not building all five features in a hackathon. You're building a compelling demo that shows the vision. Here's what I'd prioritise:
What to Build (MVP Scope)
Core: Business Profile → Compliance Map → Deadline Dashboard with Chat Q&A
The demo flow:

User enters basic business info (a simple form or conversational onboarding)
RegBot generates a personalised compliance map with deadlines
User sees a dashboard of upcoming obligations
User can chat with RegBot to ask compliance questions, and it answers grounded in actual regulatory knowledge

Technical Architecture
┌─────────────────────────────────────┐
│         Frontend (React)            │
│  ┌───────────┐  ┌────────────────┐  │
│  │ Onboarding│  │   Dashboard    │  │
│  │   Form    │  │  (deadlines,   │  │
│  │           │  │   compliance   │  │
│  └─────┬─────┘  │   map, chat)   │  │
│        │        └───────┬────────┘  │
└────────┼────────────────┼───────────┘
         │                │
         ▼                ▼
┌─────────────────────────────────────┐
│      Claude API (Sonnet 4)          │
│                                     │
│  System prompt contains:            │
│  - Business profile (from form)     │
│  - Regulatory knowledge base        │
│  - Deadline calculation logic       │
│  - Scottish/UK regulation specifics │
│                                     │
│  Tools available:                   │
│  - web_search (for latest regs)     │
│  - structured JSON output           │
│    (for dashboard data)             │
└─────────────────────────────────────┘
Build Phases (assuming ~24hr hackathon)
Phase 1 (Hours 1–3): Foundation

Set up a React app (you can use the artifact/file creation approach)
Build the onboarding form: business type dropdown (café, pub, retail shop, tradesperson, etc.), Scottish council area, company structure, VAT status, number of employees, food/alcohol served
Store this as a business profile object

Phase 2 (Hours 3–8): The Brain

Craft a detailed system prompt for Claude that contains structured knowledge about key Scottish/UK regulations — the big ones: Companies House deadlines, HMRC VAT/PAYE, food hygiene (Food Standards Scotland), alcohol licensing (Scottish Licensing Act), GDPR basics, employer obligations (auto-enrolment pensions, National Living Wage), council-specific requirements
Build the API call that takes the business profile + a user question and returns either a compliance map (structured JSON) or a conversational answer
Implement web search as a tool so the agent can look up the latest regulatory info when needed

Phase 3 (Hours 8–14): Dashboard & Chat

Build the dashboard view: a timeline/calendar of upcoming deadlines, each with a severity indicator (red/amber/green), what's needed, and the penalty for non-compliance
Build the chat interface for Q&A
Wire everything together — form submission triggers compliance map generation, which populates the dashboard, and the chat has full context of the business profile

Phase 4 (Hours 14–18): Polish & Demo Prep

Create 2–3 compelling demo scenarios (e.g., "Sarah runs a café in Edinburgh's Old Town" — show her compliance map, show a regulation change alert, show her asking about allergen display rules)
UI polish, error handling
Prepare the pitch: problem → market size → demo → impact

What Makes This Win a Hackathon
Specificity to Scotland. This isn't a generic compliance tool — it knows about Scottish licensing law (which is different from England), Food Standards Scotland (not the FSA), revenue.scot for Scottish-specific taxes (LBTT, Scottish Income Tax bands), and council-specific requirements. That local knowledge is what makes it genuinely useful and aligns perfectly with the hackathon brief.
Quantifiable impact. You can say: "There are 370,000 SMEs in Scotland. If RegBot saves each one just 2 hours per week on compliance admin, that's 740,000 hours per week of productive capacity returned to the Scottish economy."
Deployable today. Unlike some hackathon projects that are pure concept, this is a chat agent backed by Claude with web search — it can actually answer real compliance questions right now. The knowledge base gets better as you feed it more regulatory source material, and the web search tool means it can always check for the latest info.