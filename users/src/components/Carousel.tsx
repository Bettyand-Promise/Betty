'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import type { CarouselImage } from '@/lib/types';

export default function Carousel({
  images,
  businessName,
}: {
  images: CarouselImage[];
  businessName?: string;
}) {
  const [index, setIndex] = useState(0);
  const paused = useRef(false);

  useEffect(() => {
    if (images.length <= 1) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    const onVisibility = () => {
      paused.current = document.visibilityState === 'hidden';
    };
    document.addEventListener('visibilitychange', onVisibility);
    const t = setInterval(() => {
      if (!paused.current) setIndex((i) => (i + 1) % images.length);
    }, 5000);
    return () => {
      clearInterval(t);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [images.length]);

  if (!images.length) return null;

  return (
    <section className="bg-brand-bg py-20">
      <div className="mx-auto max-w-content px-5">
        <div className="mb-10 text-center">
          <span className="eyebrow justify-center">Our Work</span>
          <h2 className="mt-3 font-serif text-3xl font-semibold text-brand-ink sm:text-4xl">
            Craftsmanship You Can Trust
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-brand-muted">
            Premium aluminium roofing sheets, supplied and installed across Lagos and Nigeria.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-3xl shadow-card ring-1 ring-brand-ink/5">
          <div
            className="flex transition-transform duration-700 ease-out"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {images.map((img, i) => (
              <div key={img.id} className="relative h-[360px] min-w-full sm:h-[480px]">
                <Image
                  src={img.image_url}
                  alt={img.alt || `${businessName || 'Our'} aluminium roofing sheets`}
                  fill
                  sizes="100vw"
                  className="object-cover"
                  priority={i === 0}
                  loading={i === 0 ? 'eager' : 'lazy'}
                />
                {img.caption && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-deep/85 via-brand-deep/30 to-transparent p-6 sm:p-8">
                    <p className="max-w-lg text-lg font-semibold text-white">{img.caption}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {images.length > 1 && (
            <div className="absolute inset-x-0 bottom-5 flex justify-center gap-2.5">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  aria-label={`Go to slide ${i + 1}`}
                  onClick={() => setIndex(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === index ? 'w-8 bg-brand-gold' : 'w-2 bg-white/60 hover:bg-white'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
