'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { SiteSettings } from '@/lib/types';

const NAV = [
  { label: 'Home', href: '/' },
  { label: 'Articles', href: '/articles' },
  { label: 'About Us', href: '/about' },
];

export default function Header({ settings }: { settings: SiteSettings }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // rAF-throttle the scroll handler so it never blocks the main thread (INP).
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        setScrolled(window.scrollY > 24);
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

  const solid = scrolled || open;
  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  // Two-tone wordmark fallback (used when no logo is set): first word in the
  // brand colour, the remainder in gold. Driven by the DB business name.
  const [firstWord, ...restWords] = settings.business_name.trim().split(/\s+/);
  const rest = restWords.join(' ');

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        solid ? 'border-b border-brand-ink/10 bg-brand-bg/90 backdrop-blur-md shadow-soft' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-content items-center justify-between px-5 py-4">
        <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          {settings.logo_url ? (
            <div className="relative h-10 w-40">
              <Image
                src={settings.logo_url}
                alt={settings.business_name}
                fill
                sizes="160px"
                priority
                className="object-contain object-left"
              />
            </div>
          ) : (
            <span
              className={`font-serif text-xl font-semibold leading-none tracking-tight transition-colors ${
                solid ? 'text-brand-primary' : 'text-white'
              }`}
            >
              {firstWord}
              {rest && <span className="text-brand-gold"> {rest}</span>}
            </span>
          )}
        </Link>

        <nav className="hidden items-center gap-9 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative text-sm font-semibold transition-colors ${
                solid ? 'text-brand-ink hover:text-brand-primary' : 'text-white/90 hover:text-white'
              }`}
            >
              {item.label}
              <span
                className={`absolute -bottom-1.5 left-0 h-0.5 bg-brand-gold transition-all duration-300 ${
                  isActive(item.href) ? 'w-full' : 'w-0 group-hover:w-full'
                }`}
              />
            </Link>
          ))}
          <Link href="/about" className="btn-gold px-6 py-2.5">
            Get a Quote
          </Link>
        </nav>

        <button
          aria-label="Toggle menu"
          aria-expanded={open}
          className="md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          <div className={`space-y-1.5 ${solid ? 'text-brand-ink' : 'text-white'}`}>
            <span className={`block h-0.5 w-6 bg-current transition-transform ${open ? 'translate-y-2 rotate-45' : ''}`} />
            <span className={`block h-0.5 w-6 bg-current transition-opacity ${open ? 'opacity-0' : ''}`} />
            <span className={`block h-0.5 w-6 bg-current transition-transform ${open ? '-translate-y-2 -rotate-45' : ''}`} />
          </div>
        </button>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-brand-ink/10 bg-brand-bg px-5 py-3 md:hidden">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                isActive(item.href)
                  ? 'bg-brand-primary/10 text-brand-primary'
                  : 'text-brand-ink hover:bg-brand-ink/5'
              }`}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Link href="/about" className="btn-gold mt-2 w-full" onClick={() => setOpen(false)}>
            Get a Quote
          </Link>
        </nav>
      )}
    </header>
  );
}
