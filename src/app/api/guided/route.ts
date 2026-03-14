import { openai } from '@ai-sdk/openai';
import { streamText, convertToModelMessages, type UIMessage } from 'ai';
import { getGuidedFilingPrompt } from '@/lib/prompts';
import { BusinessProfile } from '@/lib/types';

export async function POST(req: Request) {
  const { messages, profile, filingType } = await req.json();

  const modelMessages = await convertToModelMessages(messages as UIMessage[]);

  const result = streamText({
    model: openai('gpt-5.2'),
    system: getGuidedFilingPrompt(profile as BusinessProfile, filingType as string),
    messages: modelMessages,
  });

  return result.toUIMessageStreamResponse();
}
