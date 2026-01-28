import React from 'react';

type Testimonial = {
  quote: string;
  roleLine: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      '“We stopped booking lifestyle shoots for supplements. PerfectMockup now covers most of what we need for PDPs and ads.”',
    roleLine: 'Founder, DTC Supplement Brand',
  },
  {
    quote:
      '“As a designer, this replaced mockups, stock images, and endless revisions. Huge time saver.”',
    roleLine: 'UI Designer, Ecommerce Agency',
  },
  {
    quote:
      '“We use it to generate UGC-style visuals for ads and product pages without waiting on creators.”',
    roleLine: 'Growth Marketer, Ecommerce',
  },
];

const getInitials = (roleLine: string) => {
  const parts = roleLine.split(',')[0]?.trim().split(/\s+/).filter(Boolean) ?? [];
  const letters = parts
    .slice(0, 2)
    .map(word => word[0]?.toUpperCase())
    .filter(Boolean)
    .join('');
  return letters || 'PM';
};

export default function TestimonialsSection() {
  return (
    <section className="bg-white dark:bg-black border-b border-gray-100 dark:border-white/5">
      <div className="max-w-6xl mx-auto px-6 py-16 space-y-10">
        <div className="text-center space-y-3">
          <h3 className="text-2xl sm:text-3xl text-gray-900 dark:text-white font-semibold text-balance">
            Trusted by early ecommerce teams
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Early feedback from designers, founders, and growth teams using PerfectMockup.
          </p>
        </div>

        <div className="grid gap-4 md:gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure
              key={t.roleLine}
              className="rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-6 text-left"
            >
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 flex-none rounded-full border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 text-gray-700 dark:text-white/70 flex items-center justify-center text-xs font-semibold tracking-wide">
                  {getInitials(t.roleLine)}
                </div>
                <div className="min-w-0">
                  <blockquote className="text-sm leading-relaxed text-gray-900 dark:text-white">
                    {t.quote}
                  </blockquote>
                  <figcaption className="mt-4 text-xs text-gray-600 dark:text-gray-400">
                    {t.roleLine}
                  </figcaption>
                </div>
              </div>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

