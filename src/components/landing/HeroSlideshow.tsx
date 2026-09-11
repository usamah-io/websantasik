'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera } from 'lucide-react';

export interface GalleryPhoto {
  id: string;
  title: string;
  imageUrl: string;
  caption?: string;
}

interface HeroSlideshowProps {
  photos?: GalleryPhoto[];
}

export function HeroSlideshow({ photos = [] }: HeroSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const fallbackPhotos: GalleryPhoto[] = Array.from({ length: 20 }, (_, i) => ({
    id: `foto-${i + 1}`,
    title: `Dokumentasi Kegiatan #${i + 1}`,
    imageUrl: `/images/foto${i + 1}.jpg`,
  }));

  const items = photos.length > 0 ? photos : fallbackPhotos;

  useEffect(() => {
    if (items.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [items.length]);

  const currentPhoto = items[currentIndex];

  return (
    <div className="relative w-full max-w-sm md:max-w-md mx-auto">
      {/* Outer Minimalist Neo-Brutalist Frame */}
      <div className="relative rounded-3xl bg-amber-400 border-4 border-black p-3 md:p-4 shadow-[8px_8px_0px_0px_#000] overflow-hidden">
        {/* Sleek Top Header Bar */}
        <div className="flex items-center justify-between pb-3 px-1 border-b-3 border-black mb-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 border border-black" />
            <span className="w-3 h-3 rounded-full bg-yellow-400 border border-black" />
            <span className="w-3 h-3 rounded-full bg-emerald-500 border border-black" />
            <div className="ml-2 flex items-center gap-1.5 bg-white px-2.5 py-0.5 rounded-lg border-2 border-black text-xs font-black text-slate-950">
              <Camera className="w-3.5 h-3.5 text-slate-950" />
              GALERI DOKUMENTASI
            </div>
          </div>
          <span className="text-[11px] font-black bg-white px-2.5 py-0.5 rounded-lg border-2 border-black text-slate-950 shadow-[2px_2px_0px_0px_#000]">
            {currentIndex + 1} / {items.length}
          </span>
        </div>

        {/* Completely Clean Vertical / Portrait Image Display Area */}
        <div className="relative aspect-[3/4] w-full rounded-2xl border-3 border-black bg-slate-950 overflow-hidden shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPhoto.id || currentIndex}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0"
            >
              <img
                src={currentPhoto.imageUrl}
                alt={currentPhoto.title || 'Dokumentasi San Chapter Tasikmalaya'}
                className="w-full h-full object-cover object-center"
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Minimalist Dot Strip Navigation */}
        <div className="flex gap-1.5 mt-3 overflow-x-auto pb-1 scrollbar-none justify-center">
          {items.slice(0, 10).map((item, idx) => (
            <button
              key={item.id || idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full border border-black transition-all ${
                idx === currentIndex
                  ? 'w-6 bg-black'
                  : 'w-2 bg-white hover:bg-slate-300'
              }`}
              aria-label={`Ke foto ${idx + 1}`}
            />
          ))}
          {items.length > 10 && (
            <span className="text-[10px] font-black text-slate-950 self-center pl-1">
              +{items.length - 10}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
