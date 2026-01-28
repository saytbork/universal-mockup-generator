import React, { useMemo, useState } from 'react';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

const SUPPORT_ENABLED = String(import.meta.env.VITE_SUPPORT_AI_ENABLED || '').toLowerCase() === 'true';

const trimMessages = (messages: ChatMessage[], max = 12) =>
  messages.length > max ? messages.slice(messages.length - max) : messages;

export default function SupportAssistant() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        'Soy el asistente de Perfect Mockup. Contame qué querés hacer y te guío paso a paso.',
    },
  ]);

  const canUse = SUPPORT_ENABLED;
  const shownMessages = useMemo(() => messages, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;

    setInput('');
    setBusy(true);
    setMessages(prev => trimMessages([...prev, { role: 'user', content: text }]));

    try {
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
          : `No pude responder eso ahora mismo.${data.error ? ` (${data.error})` : ''}`;

      setMessages(prev => trimMessages([...prev, { role: 'assistant', content: reply }]));
    } catch (error) {
      setMessages(prev =>
        trimMessages([
          ...prev,
          { role: 'assistant', content: `Error de red. Probá de nuevo en unos segundos.` },
        ])
      );
    } finally {
      setBusy(false);
    }
  };

  if (!canUse) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[9999]">
      {open ? (
        <div className="w-[min(92vw,380px)] h-[min(70vh,520px)] rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <div className="text-sm font-semibold">Soporte</div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-100"
            >
              Cerrar
            </button>
          </div>

          <div className="h-[calc(100%-112px)] overflow-auto px-4 py-3 space-y-3">
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
                placeholder={busy ? 'Escribiendo…' : 'Escribí tu duda…'}
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
                Enviar
              </button>
            </div>
            <div className="mt-2 text-[11px] text-gray-500">
              No compartas contraseñas ni información sensible.
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-full bg-indigo-600 text-white px-4 py-3 shadow-lg text-sm font-semibold hover:bg-indigo-700"
        >
          ¿Necesitás ayuda?
        </button>
      )}
    </div>
  );
}

