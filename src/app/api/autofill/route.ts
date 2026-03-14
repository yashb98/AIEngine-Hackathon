import OpenAI from 'openai';

const client = new OpenAI();

export async function POST(req: Request) {
  try {
    const { conversation, filingType, portalUrl } = await req.json();

    const completion = await client.chat.completions.create({
      model: 'gpt-5.2',
      temperature: 0,
      max_completion_tokens: 2000,
      messages: [
        {
          role: 'system',
          content: `You are a form data extraction assistant. Given a conversation between a user and a filing assistant, extract all the form field data that was collected during the conversation.

Return ONLY valid JSON in this exact format:
{
  "fields": [
    {
      "id": "field_unique_id",
      "label": "Human-readable field label",
      "value": "The value to fill in",
      "fieldType": "text|number|date|select|checkbox",
      "section": "Section name on the form",
      "helpText": "Brief help text about this field",
      "required": true
    }
  ],
  "summary": "One sentence summary of what will be filed",
  "ready": true
}

Rules:
- Extract EVERY piece of data mentioned in the conversation that would go on the ${filingType} form.
- Include fields from the business profile that were confirmed.
- If a value was discussed but not confirmed, mark it with "?" prefix.
- Group fields by logical sections (e.g., "Business Details", "Financial Data", "Contact Information").
- fieldType should match what the actual government form would use.
- Return ONLY the JSON. No markdown, no backticks.`,
        },
        {
          role: 'user',
          content: `Here is the conversation about completing a ${filingType} form. Extract all form field data:\n\n${conversation}`,
        },
      ],
    });

    const text = completion.choices[0]?.message?.content ?? '{"fields":[],"summary":"","ready":false}';
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const result = JSON.parse(cleaned);

    return Response.json({
      filingType,
      portalUrl,
      fields: result.fields ?? [],
      summary: result.summary ?? '',
      ready: result.ready ?? false,
    });
  } catch (error) {
    console.error('Autofill extraction error:', error);
    return Response.json({ fields: [], summary: 'Could not extract form data', ready: false }, { status: 500 });
  }
}
