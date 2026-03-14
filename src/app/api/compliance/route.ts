import OpenAI from 'openai';
import { getComplianceSystemPrompt } from '@/lib/prompts';
import { BusinessProfile } from '@/lib/types';

const openai = new OpenAI();

export async function POST(req: Request) {
  try {
    const { profile } = (await req.json()) as { profile: BusinessProfile };

    const completion = await openai.chat.completions.create({
      model: 'gpt-5.2',
      temperature: 0.2,
      max_completion_tokens: 16000,
      messages: [
        { role: 'system', content: getComplianceSystemPrompt(profile) },
        { role: 'user', content: 'Generate the complete compliance map for this food business.' },
      ],
    });

    const text = completion.choices[0]?.message?.content ?? '';

    if (completion.choices[0]?.finish_reason === 'length') {
      console.warn('Compliance response was truncated — finish_reason: length');
    }

    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let complianceMap;
    try {
      complianceMap = JSON.parse(cleaned);
    } catch {
      const lastBrace = cleaned.lastIndexOf('}');
      if (lastBrace > 0) {
        const truncated = cleaned.substring(0, lastBrace + 1);
        complianceMap = JSON.parse(truncated);
      } else {
        throw new Error('Could not parse compliance map JSON');
      }
    }

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
