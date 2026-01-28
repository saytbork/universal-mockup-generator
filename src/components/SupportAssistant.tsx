import React, { useEffect, useMemo, useState } from 'react';
import { answerFromKb } from '../support/kb';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

const WIDGET_ENABLED = String(import.meta.env.VITE_SUPPORT_WIDGET_ENABLED || '').toLowerCase() === 'true';
const AI_ENABLED = String(import.meta.env.VITE_SUPPORT_AI_ENABLED || '').toLowerCase() === 'true';
const SUPPORT_EMAIL = String(import.meta.env.VITE_SUPPORT_EMAIL || '').trim();

const trimMessages = (messages: ChatMessage[], max = 12) =>
  messages.length > max ? messages.slice(messages.length - max) : messages;

type SupportFlow =
  | { id: 'login'; step: 1 }
  | { id: 'credits'; step: 1 }
  | { id: 'export'; step: 1 }
  | { id: 'billing'; step: 1 }
  | { id: 'generation'; step: 1 }
  | { id: 'upload'; step: 1 }
  | null;

type UserProfile = {
  email?: string;
  plan?: string;
  remaining_credits?: number;
};

const normalize = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');

const detectFlow = (text: string): SupportFlow => {
  const t = normalize(text);
  if (!t) return null;

  if (/(sign in|login|log in|magic link|not receiving|didn't receive|did not receive|spam|cookie)/.test(t)) {
    return { id: 'login', step: 1 };
  }
  if (/(credit|credits|no credits|not enough|limit|plan|watermark)/.test(t)) {
    return { id: 'credits', step: 1 };
  }
  if (/(download|export|png|jpg|jpeg|mp4|video|blank)/.test(t)) {
    return { id: 'export', step: 1 };
  }
  if (/(billing|stripe|upgrade|cancel|invoice|receipt|price)/.test(t)) {
    return { id: 'billing', step: 1 };
  }
  if (/(generation failed|failed|error|failed to fetch|network|500)/.test(t)) {
    return { id: 'generation', step: 1 };
  }
  if (/(upload|product image|missing image|please upload)/.test(t)) {
    return { id: 'upload', step: 1 };
  }
  return null;
};

export default function SupportAssistant({ email }: { email?: string }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [input, setInput] = useState('');
  const [flow, setFlow] = useState<SupportFlow>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        'Hi — I’m the Perfect Mockup assistant. Tell me what you’re trying to do and I’ll guide you step by step.',
    },
  ]);

  const canUse = WIDGET_ENABLED;
  const shownMessages = useMemo(() => messages, [messages]);

  useEffect(() => {
    if (!open) return;
    if (profile) return;
    let mounted = true;
    const load = async () => {
      try {
        const res = await fetch('/api/user?action=me');
        if (!res.ok) return;
        const data = (await res.json().catch(() => ({}))) as any;
        if (!mounted) return;
        setProfile({
          email: typeof data.email === 'string' ? data.email : undefined,
          plan: typeof data.plan === 'string' ? data.plan : undefined,
          remaining_credits:
            typeof data.remaining_credits === 'number'
              ? data.remaining_credits
              : typeof data.credits === 'number'
                ? data.credits
                : undefined,
        });
      } catch {
        // ignore
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, [open, profile]);

  const appendAssistant = (content: string) => {
    setMessages(prev => trimMessages([...prev, { role: 'assistant', content }]));
  };

  const appendUser = (content: string) => {
    setMessages(prev => trimMessages([...prev, { role: 'user', content }]));
  };

  const contactSupport = () => {
    if (!SUPPORT_EMAIL) {
      appendAssistant('Support email is not configured yet.');
      return;
    }
    const transcript = messages
      .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n')
      .slice(0, 6000);
    const subject = encodeURIComponent('Perfect Mockup support request');
    const body = encodeURIComponent(
      [
        `Page: ${window.location.href}`,
        `Account: ${email || profile?.email || 'unknown'}`,
        `Plan: ${profile?.plan || 'unknown'}`,
        `Credits: ${typeof profile?.remaining_credits === 'number' ? profile.remaining_credits : 'unknown'}`,
        '',
        transcript ? `Transcript:\n${transcript}` : '',
      ]
        .filter(Boolean)
        .join('\n')
    );
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
  };

  const localChat = (text: string) => {
    const activeFlow = flow ?? detectFlow(text);
    if (!flow && activeFlow) setFlow(activeFlow);

    switch (activeFlow?.id) {
      case 'login': {
        if (flow?.id === 'login') {
          const t = normalize(text);
          if (t === 'a' || t.includes('not receiving') || t.includes("didn't receive") || t.includes('did not receive')) {
            appendAssistant(
              [
                'If you are NOT receiving the email:',
                '1) Double-check the email address for typos.',
                '2) Check Spam/Promotions and search for “Perfect Mockup”.',
                '3) Wait 1–2 minutes and click “Send Magic Link” again.',
                '4) If you are using a custom domain email, check if it blocks automated mail.',
                '',
                'If it still doesn’t arrive, tap “Contact support” and include the email you tried.',
              ].join('\n')
            );
            setFlow(null);
            return;
          }
          if (t === 'b' || t.includes('link') || t.includes('logged out') || t.includes('still')) {
            appendAssistant(
              [
                'If you receive the email but the link does NOT sign you in:',
                '1) Open the link in the same browser/device you will use.',
                '2) Allow cookies for this site (disable strict tracking prevention for a test).',
                '3) Disable privacy extensions/ad blockers and refresh.',
                '4) After clicking the link, go to `/dashboard`.',
                '',
                'If it keeps looping back to `/login`, tell me which browser you’re using (Chrome/Safari/etc.).',
              ].join('\n')
            );
            setFlow(null);
            return;
          }
        }
        appendAssistant(
          [
            'Quick check: which one is happening?',
            'A) You are NOT receiving the magic link email',
            'B) You receive the email, but the link does NOT sign you in',
            '',
            'Reply with A or B (or paste the exact error text).',
          ].join('\n')
        );
        return;
      }
      case 'credits': {
        if (flow?.id === 'credits') {
          setFlow(null);
        }
        const credits =
          typeof profile?.remaining_credits === 'number' ? `${profile.remaining_credits}` : 'unknown';
        const plan = profile?.plan ? String(profile.plan) : 'unknown';
        appendAssistant(
          [
            `Your current plan: ${plan}`,
            `Credits remaining: ${credits}`,
            '',
            'If you see “Not enough credits”, it can mean:',
            '- You ran out of credits, or',
            '- The action costs more than 1 credit (e.g. multiple outputs/slots).',
            '',
            'Tell me what you clicked (Generate / Edit / Download) and what the error says.',
          ].join('\n')
        );
        return;
      }
      case 'export': {
        if (flow?.id === 'export') {
          setFlow(null);
        }
        appendAssistant(
          [
            'Let’s fix the download.',
            '1) Refresh the page and try again.',
            '2) Disable ad blockers for this site.',
            '3) Try a different browser.',
            '',
            'What are you exporting: PNG/JPG or video (MP4)? And do you see an error message?',
          ].join('\n')
        );
        return;
      }
      case 'billing': {
        if (flow?.id === 'billing') {
          setFlow(null);
        }
        appendAssistant(
          [
            'Billing help:',
            '- Upgrade: use `/pricing` or the “Manage plan” modal.',
            '- Cancel: use your Stripe receipt email / Stripe portal.',
            '',
            'Are you trying to upgrade, cancel, or is the plan not showing after payment?',
          ].join('\n')
        );
        return;
      }
      case 'generation': {
        if (flow?.id === 'generation') {
          setFlow(null);
        }
        appendAssistant(
          [
            'If generation fails:',
            '1) Retry once (temporary issues happen).',
            '2) Disable VPN/ad blockers and refresh.',
            '3) Make sure you uploaded a product image.',
            '',
            'What’s the exact error text you see?',
          ].join('\n')
        );
        return;
      }
      case 'upload': {
        if (flow?.id === 'upload') {
          setFlow(null);
        }
        appendAssistant(
          [
            'Most presets require a product image.',
            'Try:',
            '1) Upload a clear front-facing product photo (PNG/JPG).',
            '2) Keep it under ~10MB.',
            '3) If the upload button does nothing, disable ad blockers and refresh.',
            '',
            'Do you see an error, or does the upload just not respond?',
          ].join('\n')
        );
        return;
      }
      default: {
        const kb = answerFromKb(text);
        if (kb) {
          appendAssistant(kb);
          return;
        }
        appendAssistant(
          [
            'I couldn’t match that to a known issue yet.',
            'Try one of these: Sign in, Credits, Upload, Generation failed, Export, Billing.',
            SUPPORT_EMAIL ? 'Or tap “Contact support” below.' : '',
          ]
            .filter(Boolean)
            .join('\n')
        );
      }
    }
  };

  const send = async (preset?: string) => {
    const text = (preset ?? input).trim();
    if (!text || busy) return;

    setInput('');
    setBusy(true);
    appendUser(text);

    try {
      if (!AI_ENABLED) {
        localChat(text);
        return;
      }

      const res = await fetch('/api/support/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          path: window.location.pathname,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as { reply?: string; error?: string };
      const reply =
        typeof data.reply === 'string' && data.reply.trim()
          ? data.reply.trim()
          : `I couldn’t answer that right now.${data.error ? ` (${data.error})` : ''}`;

      appendAssistant(reply);
    } catch (error) {
      appendAssistant('Network error. Please try again in a few seconds.');
    } finally {
      setBusy(false);
    }
  };

  if (!canUse) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[9999]">
      {open ? (
        <div className="w-[min(92vw,380px)] h-[min(75vh,560px)] rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <div className="text-sm font-semibold">Support</div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={contactSupport}
                className="rounded-full px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                title="Email support"
              >
                Contact
              </button>
              <button
                type="button"
                onClick={() => {
                  setFlow(null);
                  setMessages([
                    {
                      role: 'assistant',
                      content:
                        'Hi — I’m the Perfect Mockup assistant. Tell me what you’re trying to do and I’ll guide you step by step.',
                    },
                  ]);
                }}
                className="rounded-full px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                title="Reset chat"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-100"
              >
                Close
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto px-4 py-3 space-y-3">
            {shownMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={[
                    'max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap',
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-900',
                  ].join(' ')}
                >
                  {msg.content}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 p-3">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    void send();
                  }
                }}
                placeholder={busy ? 'Typing…' : 'Ask a question…'}
                className="flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                rows={2}
                disabled={busy}
              />
              <button
                type="button"
                onClick={() => void send()}
                disabled={busy || !input.trim()}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                Send
              </button>
            </div>
            <div className="mt-2 text-[11px] text-gray-500">
              Don’t share passwords or sensitive information.
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-full bg-indigo-600 text-white px-4 py-3 shadow-lg text-sm font-semibold hover:bg-indigo-700"
        >
          Need help?
        </button>
      )}
    </div>
  );
}
