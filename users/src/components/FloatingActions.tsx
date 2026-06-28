'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowUp, X } from 'lucide-react';

const WhatsAppGlyph = ({ size = 22 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
    <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 018.413 3.488 11.82 11.82 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-1.215zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.074-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
  </svg>
);

/**
 * WhatsApp chat widget (expandable popup) + back-to-top. The phone number and
 * business name come from the admin (site_settings.whatsapp / business_name).
 */
export default function FloatingActions({
  whatsapp,
  businessName,
  greeting,
}: {
  whatsapp: string;
  businessName: string;
  greeting?: string;
}) {
  const [open, setOpen] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [message, setMessage] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const digits = (whatsapp || '').replace(/\D/g, '');
  const greetingText =
    greeting?.trim() ||
    `Welcome to ${businessName}. How can we help you with your roofing today?`;
  const showBadge = !open && !dismissed;

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        setShowTop(window.scrollY > 600);
        raf = 0;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  function startChat() {
    const text =
      message.trim() ||
      `Hello ${businessName}, I'd like a quote on aluminium roofing sheets.`;
    window.open(`https://wa.me/${digits}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  }

  return (
    <div ref={ref} className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      <button
        aria-label="Back to top"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`flex h-10 w-10 items-center justify-center rounded-[999px] bg-brand-ink text-white shadow-card transition-all duration-300 hover:bg-brand-primary ${
          showTop ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'
        }`}
      >
        <ArrowUp size={18} />
      </button>

      {digits && (
        <>
          {/* Popup card */}
          <div
            className={`w-[20rem] max-w-[calc(100vw-2.5rem)] overflow-hidden border border-black/5 bg-white shadow-card transition-all duration-200 ${
              open ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'
            }`}
            role="dialog"
            aria-label="WhatsApp chat"
          >
            <div className="flex items-center gap-3 bg-[#075E54] px-4 py-3 text-white">
              <div className="flex h-10 w-10 items-center justify-center bg-white/15">
                <WhatsAppGlyph size={22} />
              </div>
              <div className="flex-1 leading-tight">
                <p className="text-sm font-semibold">{businessName}</p>
                <p className="text-[11px] text-white/80">Typically replies within minutes</p>
              </div>
              <button aria-label="Close" onClick={() => setOpen(false)} className="text-white/80 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="bg-[#ECE5DD] px-4 py-5">
              <div className="relative max-w-[85%] bg-white px-3.5 py-2.5 text-sm text-brand-ink shadow-sm">
                <p className="font-semibold">Hi there 👋</p>
                <p className="mt-0.5 text-brand-muted">{greetingText}</p>
              </div>
            </div>

            <div className="space-y-2 p-3">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && startChat()}
                placeholder="Type a message…"
                className="w-full border border-black/10 px-3 py-2.5 text-sm outline-none focus:border-[#25D366]"
              />
              <button
                onClick={startChat}
                className="flex w-full items-center justify-center gap-2 bg-[#25D366] py-2.5 text-sm font-semibold text-white transition-transform hover:brightness-105"
              >
                <WhatsAppGlyph size={18} /> Start Chat on WhatsApp
              </button>
            </div>
          </div>

          {/* Launcher bubble */}
          <div className="relative">
            {showBadge && (
              <>
                {/* Pulse ring (disabled for reduced motion) */}
                <span className="absolute inset-0 -z-10 animate-ping rounded-[999px] bg-[#25D366] opacity-40 motion-reduce:hidden" />
                {/* Unread badge */}
                <span className="absolute -right-0.5 -top-0.5 z-10 flex h-4 w-4 items-center justify-center rounded-[999px] bg-brand-primary text-[10px] font-bold text-white shadow">
                  1
                </span>
              </>
            )}
            <button
              onClick={() => {
                setOpen((v) => !v);
                setDismissed(true);
              }}
              aria-label={open ? 'Close WhatsApp chat' : 'Chat on WhatsApp'}
              aria-expanded={open}
              className="relative flex h-12 w-12 items-center justify-center rounded-[999px] bg-[#25D366] text-white shadow-card transition-transform hover:-translate-y-0.5"
            >
              {open ? <X size={22} /> : <WhatsAppGlyph size={24} />}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
