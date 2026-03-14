import OpenAI from 'openai';
import { BusinessProfile } from '@/lib/types';

const client = new OpenAI();

function getMonitorPrompt(profile: BusinessProfile): string {
  return `You are RegBot, monitoring regulatory changes for a Scottish food business.

## BUSINESS
- Type: ${profile.businessType}
- Location: ${profile.councilArea}, Scotland
- Serves alcohol: ${profile.servesAlcohol}
- VAT registered: ${profile.vatRegistered}
- Employees: ${profile.employeeCount}
- Company type: ${profile.companyType}

## TASK
Search for recent regulatory changes (last 60 days) that affect Scottish food businesses like this one. Check:
- Food Standards Scotland updates
- HMRC tax changes
- Scottish Government regulations
- Employment law changes
- Local council (${profile.councilArea}) updates
- Licensing law changes

Return ONLY valid JSON array:
[
  {
    "id": "unique-id",
    "title": "Short title of the change",
    "date": "YYYY-MM-DD",
    "summary": "1-2 sentence plain English explanation",
    "impact": "How this specifically affects this business",
    "category": "hmrc|companies_house|council|employment|food_safety|data|scottish",
    "sourceUrl": "URL to the official source",
    "severity": "high|medium|low"
  }
]

Rules:
- Only include changes RELEVANT to this specific business.
- severity: high = requires immediate action, medium = be aware, low = informational.
- If you find no recent changes, return an empty array [].
- Return ONLY the JSON array. No markdown, no backticks, no explanation.`;
}

export async function POST(req: Request) {
  try {
    const { profile } = (await req.json()) as { profile: BusinessProfile };

    const completion = await client.chat.completions.create({
      model: 'gpt-5.2',
      temperature: 0.2,
      max_completion_tokens: 2000,
      messages: [
        { role: 'system', content: getMonitorPrompt(profile) },
        { role: 'user', content: 'Search for recent regulation changes affecting this food business and return the JSON array.' },
      ],
    });

    const text = completion.choices[0]?.message?.content ?? '[]';
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const changes = JSON.parse(cleaned);

    return Response.json({ changes });
  } catch (error) {
    console.error('Monitor error:', error);
    return Response.json({ changes: [] });
  }
}
