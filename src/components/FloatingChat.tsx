'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Globe, ExternalLink, Shield } from 'lucide-react';
import { useChat } from '@ai-sdk/react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { getProfile } from '@/lib/storage';
import { cn } from '@/lib/utils';

const QUICK_QUESTIONS = [
  'What food hygiene rules apply to me?',
  'When is my next VAT deadline?',
  'Do I need allergen labels?',
  'What licences do I need in Scotland?',
  'How do I register with the ICO?',
  'What are HACCP requirements?',
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

export function FloatingChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const profile = getProfile();

  const welcomeText = profile
    ? `Hi ${profile.ownerName}! Need quick compliance help for ${profile.businessName}? Ask me anything about food regulations, deadlines, or licences.`
    : `Hi! I'm RegBot, your Scottish food business compliance assistant. Ask me anything about food hygiene, licensing, VAT, or regulations.`;

  const { messages, sendMessage, status } = useChat({
    id: 'floating-chat',
    messages: [
      {
        id: 'welcome-float',
        role: 'assistant' as const,
        parts: [{ type: 'text' as const, text: welcomeText }],
      },
    ],
  });

  const isLoading = status === 'submitted' || status === 'streaming';

  useEffect(() => {
    if (open) {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, open]);

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
    <>
      {/* Chat window */}
      {open && (
        <div className="fixed bottom-20 right-4 z-50 w-[380px] max-w-[calc(100vw-2rem)] rounded-2xl border border-brand-border bg-white shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-200">
          {/* Header */}
          <div className="flex items-center gap-2 bg-brand-dark px-4 py-3">
            <Shield className="h-5 w-5 text-brand-accent" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">RegBot Assistant</p>
              <p className="text-[11px] text-white/60">Food compliance help</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-lg p-1 text-white/60 hover:bg-white/10 hover:text-white transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="h-[350px] overflow-y-auto space-y-3 p-3">
            {messages.map(m => {
              const { text, sources } = getMessageContent(m);
              const isUser = (m.role as string) === 'user';
              if (!text && sources.length === 0) return null;

              return (
                <div key={m.id} className={cn('max-w-[85%]', isUser ? 'ml-auto' : 'mr-auto')}>
                  {text && (
                    <div
                      className={cn(
                        'rounded-xl px-3 py-2 text-[13px] leading-relaxed whitespace-pre-wrap',
                        isUser
                          ? 'bg-brand-accent text-white'
                          : 'bg-brand-ghost text-text-primary'
                      )}
                    >
                      {text}
                    </div>
                  )}
                  {sources.length > 0 && (
                    <div className="mt-1 flex flex-wrap items-center gap-1">
                      <Globe className="h-2.5 w-2.5 text-text-secondary" />
                      {sources
                        .filter((s): s is Source & { url: string } => s.type === 'url' && !!s.url)
                        .slice(0, 3)
                        .map((s, i) => {
                          let hostname: string;
                          try { hostname = new URL(s.url).hostname.replace('www.', ''); } catch { hostname = s.url; }
                          return (
                            <a
                              key={i}
                              href={s.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-0.5 rounded bg-white border border-brand-border px-1.5 py-0.5 text-[10px] text-brand-accent hover:underline"
                            >
                              {hostname} <ExternalLink className="h-2 w-2" />
                            </a>
                          );
                        })}
                    </div>
                  )}
                </div>
              );
            })}
            {isLoading && (messages[messages.length - 1]?.role as string) === 'user' && (
              <div className="mr-auto flex items-center gap-2 rounded-xl bg-brand-ghost px-3 py-2 text-[13px] text-text-secondary">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Thinking...
              </div>
            )}
          </div>

          {/* Quick questions (only on first message) */}
          {messages.length <= 1 && (
            <div className="flex flex-wrap gap-1.5 border-t border-brand-border px-3 pt-2 pb-1">
              {QUICK_QUESTIONS.map(q => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="rounded-full border border-brand-border bg-white px-2.5 py-1 text-[11px] text-text-secondary hover:border-brand-accent hover:text-brand-accent transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="flex items-end gap-2 border-t border-brand-border p-3">
            <Textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask about compliance..."
              className="min-h-[38px] max-h-24 resize-none text-[13px]"
              rows={1}
            />
            <Button
              onClick={() => send(input)}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="shrink-0 h-[38px] w-[38px] bg-brand-accent hover:bg-blue-600"
            >
              <Send className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* FAB button */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'fixed bottom-4 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-200',
          open
            ? 'bg-brand-dark text-white rotate-0'
            : 'bg-brand-accent text-white hover:bg-brand-accent/90 hover:scale-105'
        )}
      >
        {open ? (
          <X className="h-6 w-6" />
        ) : (
          <div className="relative">
            <MessageCircle className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-deadline-safe opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-deadline-safe" />
            </span>
          </div>
        )}
      </button>
    </>
  );
}
