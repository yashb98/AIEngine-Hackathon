'use client';

import { useChat } from '@ai-sdk/react';
import { useRef, useEffect, useState } from 'react';
import { Send, Loader2, Globe, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { getProfile } from '@/lib/storage';
import { cn } from '@/lib/utils';

const SUGGESTED_QUESTIONS = [
  'What are my upcoming deadlines?',
  'Explain the penalty for late VAT returns',
  'What allergen display rules apply to my business?',
  'Do I need a personal licence holder on premises?',
  'How does Scottish Income Tax differ from England?',
  "What's the Small Business Bonus Scheme?",
];

interface Source {
  type: string;
  url?: string;
  name?: string;
}

function getMessageContent(msg: { parts: Array<{ type: string; [key: string]: unknown }> }): {
  text: string;
  sources: Source[];
} {
  let text = '';
  const sources: Source[] = [];

  for (const part of msg.parts) {
    if (part.type === 'text') {
      text += (part as { type: 'text'; text: string }).text;
    }
    if (part.type === 'tool-invocation') {
      const toolPart = part as { type: 'tool-invocation'; toolInvocation: { toolName: string; result?: { sources?: Source[] } } };
      if (toolPart.toolInvocation.toolName === 'web_search' && toolPart.toolInvocation.result?.sources) {
        sources.push(...toolPart.toolInvocation.result.sources);
      }
    }
  }

  return { text, sources };
}

export function ComplianceChat() {
  const profile = getProfile();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');

  const welcomeText = `Hi ${profile?.ownerName || 'there'}! I'm RegBot, your food business compliance advisor. I know all about the regulations that apply to ${profile?.businessName || 'your business'} in Scotland. Ask me anything — food hygiene, licensing, VAT deadlines, allergen rules, you name it. I can also search the web for the latest regulatory info.`;

  const { messages, sendMessage, status } = useChat({
    id: 'regbot-chat',
    messages: [
      {
        id: 'welcome',
        role: 'assistant' as const,
        parts: [{ type: 'text' as const, text: welcomeText }],
      },
    ],
  });

  const isLoading = status === 'submitted' || status === 'streaming';

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const send = (text: string) => {
    if (!text.trim() || isLoading) return;
    setInput('');
    sendMessage({ text }, { body: { profile } });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  return (
    <div className="flex h-[500px] flex-col">
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 p-4">
        {messages.map(m => {
          const { text, sources } = getMessageContent(m);
          const isUser = (m.role as string) === 'user';

          if (!text && sources.length === 0) return null;

          return (
            <div key={m.id} className={cn('max-w-[85%]', isUser ? 'ml-auto' : 'mr-auto')}>
              {text && (
                <div
                  className={cn(
                    'rounded-xl px-4 py-3 text-sm whitespace-pre-wrap',
                    isUser
                      ? 'bg-brand-accent text-white'
                      : 'bg-brand-ghost text-text-primary'
                  )}
                >
                  {text}
                </div>
              )}
              {sources.length > 0 && (
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <Globe className="h-3 w-3 text-text-secondary" />
                  {sources
                    .filter((s): s is Source & { url: string } => s.type === 'url' && !!s.url)
                    .slice(0, 4)
                    .map((s, i) => {
                      let hostname: string;
                      try { hostname = new URL(s.url).hostname.replace('www.', ''); } catch { hostname = s.url; }
                      return (
                        <a
                          key={i}
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-0.5 rounded-md bg-white border border-brand-border px-2 py-0.5 text-[11px] text-brand-accent hover:underline"
                        >
                          {hostname} <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      );
                    })}
                </div>
              )}
            </div>
          );
        })}
        {isLoading && (messages[messages.length - 1]?.role as string) === 'user' && (
          <div className="mr-auto flex items-center gap-2 rounded-xl bg-brand-ghost px-4 py-3 text-sm text-text-secondary">
            <Loader2 className="h-4 w-4 animate-spin" />
            Searching & thinking...
          </div>
        )}
      </div>

      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 border-t border-brand-border px-4 pt-3">
          {SUGGESTED_QUESTIONS.map(q => (
            <button
              key={q}
              onClick={() => send(q)}
              className="rounded-full border border-brand-border bg-white px-3 py-1.5 text-xs text-text-secondary hover:border-brand-accent hover:text-brand-accent transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2 border-t border-brand-border p-4">
        <Textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Ask about your food business compliance..."
          className="min-h-[44px] max-h-32 resize-none"
          rows={1}
        />
        <Button
          onClick={() => send(input)}
          disabled={!input.trim() || isLoading}
          size="icon"
          className="shrink-0 bg-brand-accent hover:bg-blue-600"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
