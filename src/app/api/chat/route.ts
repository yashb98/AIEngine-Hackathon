import { openai } from '@ai-sdk/openai';
import { streamText, convertToModelMessages, type UIMessage } from 'ai';
import { getChatSystemPrompt } from '@/lib/prompts';
import { BusinessProfile } from '@/lib/types';

export async function POST(req: Request) {
  const { messages, profile } = await req.json();

  const modelMessages = await convertToModelMessages(messages as UIMessage[]);

  const result = streamText({
    model: openai('gpt-5.2'),
    system: getChatSystemPrompt(profile as BusinessProfile),
    messages: modelMessages,
    tools: {
      web_search: openai.tools.webSearch(),
    },
  });

  return result.toUIMessageStreamResponse();
}
