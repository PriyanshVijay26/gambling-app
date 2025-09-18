import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const slidesDefault = [
  {
    title: 'Promo codes, updates, exclusive giveaways',
    cta: 'Join Discord',
    href: '#',
    color: 'from-indigo-500 to-indigo-700'
  },
  {
    title: 'Daily race is live — win big!',
    cta: 'View Leaderboard',
    href: '/dashboard',
    color: 'from-purple-500 to-purple-700'
  },
  {
    title: 'Invite friends, earn rewards',
    cta: 'Get Invite Link',
    href: '/dashboard',
    color: 'from-emerald-500 to-emerald-700'
  }
];

export default function PromoCarousel({ slides = slidesDefault, interval = 5000 }) {
  const [index, setIndex] = useState(0);
  const count = slides.length;
  const safeSlides = useMemo(() => slides && slides.length ? slides : slidesDefault, [slides]);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % count), interval);
    return () => clearInterval(id);
  }, [count, interval]);

  const prev = () => setIndex((i) => (i - 1 + count) % count);
  const next = () => setIndex((i) => (i + 1) % count);

  return (
    <div className="relative bg-gradient-to-br rounded-2xl p-6 overflow-hidden border border-slate-700 min-h-[140px]">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.4 }}
          className={`bg-gradient-to-br ${safeSlides[index].color} rounded-xl p-6 text-white`}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="text-lg md:text-xl font-semibold">
              {safeSlides[index].title}
            </div>
            <a href={safeSlides[index].href} className="btn-secondary whitespace-nowrap">
              {safeSlides[index].cta}
            </a>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 bg-slate-900/60 hover:bg-slate-900/80 border border-slate-700 w-8 h-8 rounded-full flex items-center justify-center">
        <ChevronLeft className="w-4 h-4 text-white" />
      </button>
      <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 bg-slate-900/60 hover:bg-slate-900/80 border border-slate-700 w-8 h-8 rounded-full flex items-center justify-center">
        <ChevronRight className="w-4 h-4 text-white" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-2 left-0 right-0 flex items-center justify-center gap-2">
        {safeSlides.map((_, i) => (
          <button key={i} onClick={() => setIndex(i)} className={`w-2 h-2 rounded-full ${i === index ? 'bg-white' : 'bg-white/40'}`} />
        ))}
      </div>
    </div>
  );
}
