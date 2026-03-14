'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useRef, useEffect, useState, useMemo } from 'react';
import {
  Send, Loader2, FileText, ChevronDown, ClipboardList,
  ExternalLink, CheckCircle2, Circle, BookOpen, Bot,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { getProfile } from '@/lib/storage';
import { cn } from '@/lib/utils';
import { FormPreview } from './FormPreview';
import { BrowserAgentView } from './BrowserAgentView';
import type { FormField } from '@/lib/types';

const FILING_TYPES = [
  {
    id: 'vat_return',
    label: 'VAT Return',
    icon: '🏛️',
    portalUrl: 'https://www.gov.uk/vat-returns',
    estimatedTime: '15-30 min',
    docsNeeded: ['VAT number', 'Sales figures for the quarter', 'Purchase invoices', 'Previous VAT return reference'],
    steps: ['Confirm VAT period', 'Enter total sales (Box 6)', 'Enter total purchases (Box 7)', 'Calculate VAT due/reclaim', 'Review summary', 'Submit on HMRC portal'],
  },
  {
    id: 'confirmation_statement',
    label: 'Companies House Confirmation',
    icon: '📋',
    portalUrl: 'https://www.gov.uk/file-your-confirmation-statement-with-companies-house',
    estimatedTime: '10-15 min',
    docsNeeded: ['Company number', 'Current director details', 'Registered office address', 'SIC code', 'Share capital info'],
    steps: ['Verify company details', 'Check directors are current', 'Confirm registered office', 'Review SIC codes', 'Confirm statement of capital', 'File online'],
  },
  {
    id: 'food_hygiene',
    label: 'Food Hygiene Registration',
    icon: '🍽️',
    portalUrl: 'https://www.foodstandards.gov.scot/business-and-industry/safety-and-regulation/food-hygiene',
    estimatedTime: '10-20 min',
    docsNeeded: ['Business name & address', 'Type of food handled', 'Food safety management docs (HACCP)', 'Owner/operator details'],
    steps: ['Enter business details', 'Describe food activities', 'Confirm food handling types', 'Provide owner details', 'Review & submit to council'],
  },
  {
    id: 'alcohol_licence',
    label: 'Alcohol Licence Renewal',
    icon: '🍺',
    portalUrl: 'https://www.mygov.scot/alcohol-licence',
    estimatedTime: '20-40 min',
    docsNeeded: ['Current premises licence number', 'Personal licence holder details', 'Operating hours', 'Certificate for Personal Licence Holders', 'Floor plan (if changed)'],
    steps: ['Confirm licence details', 'Verify personal licence holder', 'Check operating hours', 'Note any premises changes', 'Prepare fee payment', 'Submit to licensing board'],
  },
  {
    id: 'ico_registration',
    label: 'ICO Data Protection',
    icon: '🔒',
    portalUrl: 'https://ico.org.uk/for-organisations/guide-to-data-protection/guide-to-the-general-data-protection-regulation-gdpr/',
    estimatedTime: '10-15 min',
    docsNeeded: ['Organisation details', 'Data controller name', 'Types of personal data you process', 'Purposes for data processing'],
    steps: ['Enter organisation details', 'Specify data controller', 'Describe data processing activities', 'Select processing purposes', 'Calculate fee tier', 'Register & pay'],
  },
];

type ViewMode = 'picker' | 'chat' | 'preview' | 'agent';

export function GuidedFiling() {
  const profile = getProfile();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');
  const [filingType, setFilingType] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('picker');
  const [showDocs, setShowDocs] = useState(true);
  const [checkedDocs, setCheckedDocs] = useState<Set<string>>(new Set());
  const [currentStep, setCurrentStep] = useState(0);

  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [formSummary, setFormSummary] = useState('');
  const [extracting, setExtracting] = useState(false);

  const transport = useMemo(
    () => new DefaultChatTransport({ api: '/api/guided' }),
    []
  );

  const { messages, sendMessage, status, setMessages } = useChat({
    id: 'guided-filing',
    transport,
  });

  const isLoading = status === 'submitted' || status === 'streaming';
  const selectedFiling = FILING_TYPES.find(f => f.id === filingType);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const assistantMsgs = messages.filter(m => (m.role as string) === 'assistant');
    setCurrentStep(Math.min(assistantMsgs.length, (selectedFiling?.steps.length ?? 1) - 1));
  }, [messages, selectedFiling]);

  const toggleDoc = (doc: string) => {
    setCheckedDocs(prev => {
      const next = new Set(prev);
      if (next.has(doc)) next.delete(doc); else next.add(doc);
      return next;
    });
  };

  const startFiling = (typeId: string) => {
    setFilingType(typeId);
    setViewMode('chat');
    setShowDocs(true);
    setCheckedDocs(new Set());
    setCurrentStep(0);
    setMessages([]);
    sendMessage(
      { text: `I'd like help completing my ${FILING_TYPES.find(f => f.id === typeId)?.label}. Please guide me step by step.` },
      { body: { profile, filingType: typeId } }
    );
  };

  const send = (text: string) => {
    if (!text.trim() || isLoading) return;
    setInput('');
    sendMessage({ text }, { body: { profile, filingType } });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  const getMessageText = (msg: typeof messages[number]) =>
    msg.parts
      .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
      .map(p => p.text)
      .join('');

  const extractFormData = async () => {
    if (!selectedFiling) return;
    setExtracting(true);

    const conversation = messages
      .map(m => `${(m.role as string).toUpperCase()}: ${getMessageText(m)}`)
      .join('\n\n');

    try {
      const res = await fetch('/api/autofill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation,
          filingType: selectedFiling.label,
          portalUrl: selectedFiling.portalUrl,
        }),
      });

      if (!res.ok) throw new Error('Failed to extract');
      const data = await res.json();
      setFormFields(data.fields);
      setFormSummary(data.summary);
      setViewMode('preview');
    } catch {
      setFormSummary('Could not extract form data. Try providing more details in the chat.');
    } finally {
      setExtracting(false);
    }
  };

  const updateField = (id: string, value: string) => {
    setFormFields(prev => prev.map(f => f.id === id ? { ...f, value } : f));
  };

  const reset = () => {
    setFilingType(null);
    setViewMode('picker');
    setShowDocs(true);
    setCheckedDocs(new Set());
    setCurrentStep(0);
    setMessages([]);
    setFormFields([]);
    setFormSummary('');
  };

  if (viewMode === 'picker') {
    return (
      <div className="flex h-[600px] flex-col">
        <div className="flex flex-1 flex-col items-center justify-center p-6">
          <FileText className="mb-3 h-10 w-10 text-brand-accent" />
          <h3 className="mb-1 text-lg font-bold text-text-primary">Guided Form Completion</h3>
          <p className="mb-1 text-center text-sm text-text-secondary max-w-sm">
            RegBot walks you through filings step by step, then a Browser Agent can auto-fill the portal for you.
          </p>
          <div className="mb-5 flex items-center gap-1.5 text-xs text-brand-accent">
            <Bot className="h-3.5 w-3.5" />
            <span>Powered by AI Browser Agent</span>
          </div>
          <div className="w-full max-w-md space-y-2">
            {FILING_TYPES.map(f => (
              <button
                key={f.id}
                onClick={() => startFiling(f.id)}
                className="flex w-full items-center gap-3 rounded-lg border border-brand-border bg-white px-4 py-3 text-left transition-colors hover:border-brand-accent hover:bg-brand-ghost group"
              >
                <span className="text-xl">{f.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary">{f.label}</p>
                  <p className="text-[11px] text-text-secondary">
                    ~{f.estimatedTime} &middot; {f.steps.length} steps &middot; {f.docsNeeded.length} docs needed
                  </p>
                </div>
                <ChevronDown className="h-4 w-4 -rotate-90 text-text-secondary group-hover:text-brand-accent transition-colors" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === 'preview') {
    return (
      <div className="h-[600px]">
        <FormPreview
          fields={formFields}
          summary={formSummary}
          onFieldUpdate={updateField}
          onConfirm={() => setViewMode('agent')}
          onBack={() => setViewMode('chat')}
        />
      </div>
    );
  }

  if (viewMode === 'agent' && selectedFiling) {
    return (
      <div className="h-[600px]">
        <BrowserAgentView
          fields={formFields}
          portalUrl={selectedFiling.portalUrl}
          filingType={selectedFiling.label}
          onComplete={reset}
          onBack={() => setViewMode('preview')}
        />
      </div>
    );
  }

  return (
    <div className="flex h-[600px] flex-col">
      {/* Header with progress */}
      <div className="border-b border-brand-border">
        <div className="flex items-center gap-2 px-4 py-2">
          <FileText className="h-4 w-4 text-brand-accent" />
          <span className="text-sm font-semibold text-text-primary">
            {selectedFiling?.label}
          </span>
          <Badge variant="secondary" className="text-[10px]">
            Step {currentStep + 1}/{selectedFiling?.steps.length}
          </Badge>
          <div className="flex-1" />
          {selectedFiling?.portalUrl && (
            <a
              href={selectedFiling.portalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-brand-accent hover:underline inline-flex items-center gap-0.5"
            >
              Portal <ExternalLink className="h-2.5 w-2.5" />
            </a>
          )}
          <Button variant="ghost" size="sm" onClick={reset} className="text-xs ml-2">
            ← Back
          </Button>
        </div>

        {selectedFiling && (
          <div className="flex gap-0.5 px-4 pb-2">
            {selectedFiling.steps.map((step, i) => (
              <div
                key={i}
                className={cn(
                  'h-1.5 flex-1 rounded-full transition-colors',
                  i <= currentStep ? 'bg-brand-accent' : 'bg-gray-200'
                )}
                title={step}
              />
            ))}
          </div>
        )}
      </div>

      {/* Document checklist */}
      {selectedFiling && showDocs && (
        <div className="border-b border-brand-border bg-brand-ghost/50 px-4 py-2">
          <button
            onClick={() => setShowDocs(!showDocs)}
            className="flex w-full items-center gap-1.5 text-xs font-semibold text-text-primary"
          >
            <ClipboardList className="h-3.5 w-3.5" />
            Documents Checklist ({checkedDocs.size}/{selectedFiling.docsNeeded.length})
            <ChevronDown className="ml-auto h-3 w-3" />
          </button>
          <div className="mt-1.5 space-y-1">
            {selectedFiling.docsNeeded.map(doc => (
              <label key={doc} className="flex items-center gap-2 cursor-pointer text-xs text-text-secondary hover:text-text-primary">
                <button onClick={() => toggleDoc(doc)} className="shrink-0">
                  {checkedDocs.has(doc)
                    ? <CheckCircle2 className="h-3.5 w-3.5 text-deadline-safe" />
                    : <Circle className="h-3.5 w-3.5 text-gray-300" />
                  }
                </button>
                <span className={checkedDocs.has(doc) ? 'line-through text-text-secondary' : ''}>{doc}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {selectedFiling && !showDocs && (
        <button
          onClick={() => setShowDocs(true)}
          className="flex items-center gap-1.5 border-b border-brand-border px-4 py-1.5 text-[11px] text-text-secondary hover:text-text-primary"
        >
          <BookOpen className="h-3 w-3" />
          Show document checklist ({checkedDocs.size}/{selectedFiling.docsNeeded.length} ready)
        </button>
      )}

      {/* Chat area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 p-4">
        {messages.map(m => (
          <div
            key={m.id}
            className={cn(
              'max-w-[85%] rounded-xl px-4 py-3 text-sm whitespace-pre-wrap',
              (m.role as string) === 'user'
                ? 'ml-auto bg-brand-accent text-white'
                : 'mr-auto bg-brand-ghost text-text-primary'
            )}
          >
            {getMessageText(m)}
          </div>
        ))}
        {isLoading && (messages.length === 0 || (messages[messages.length - 1]?.role as string) === 'user') && (
          <div className="mr-auto flex items-center gap-2 rounded-xl bg-brand-ghost px-4 py-3 text-sm text-text-secondary">
            <Loader2 className="h-4 w-4 animate-spin" />
            Preparing guidance...
          </div>
        )}
      </div>

      {/* Input + Auto-fill button */}
      <div className="border-t border-brand-border">
        {messages.length >= 4 && !isLoading && (
          <div className="flex items-center gap-2 bg-brand-ghost/50 px-4 py-2">
            <Bot className="h-4 w-4 text-brand-accent shrink-0" />
            <span className="text-xs text-text-secondary flex-1">
              Ready to auto-fill the form? The Browser Agent will fill it for you to review.
            </span>
            <Button
              size="sm"
              onClick={extractFormData}
              disabled={extracting}
              className="bg-brand-accent hover:bg-blue-600 text-xs gap-1.5 shrink-0"
            >
              {extracting ? (
                <><Loader2 className="h-3 w-3 animate-spin" /> Extracting...</>
              ) : (
                <><Bot className="h-3 w-3" /> Auto-Fill Portal</>
              )}
            </Button>
          </div>
        )}
        <div className="flex items-end gap-2 p-4">
          <Textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Type your answer..."
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
    </div>
  );
}
