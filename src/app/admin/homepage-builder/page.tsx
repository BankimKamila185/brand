'use client';

import React, { useState } from 'react';
import { FileCode, Plus, Play, Smartphone, Image as ImageIcon, Eye } from 'lucide-react';

interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  buttonText: string;
  imageAlt: string;
}

export default function HomepageBuilderPage() {
  const [slides, setSlides] = useState<HeroSlide[]>([
    { id: 's-1', title: 'RETRO FUTURA DROP', subtitle: 'Cyberpunk graphics meets 90s aesthetic comfort clothing.', buttonText: 'Explore Capsule', imageAlt: 'Main drop banner' },
    { id: 's-2', title: 'KOALA MASCOT SERIES', subtitle: 'Limited character print designs featuring our mascot.', buttonText: 'Shop Mascot', imageAlt: 'Mascot banner' }
  ]);

  const [activeSlide, setActiveSlide] = useState(0);

  const handleUpdateSlideField = (id: string, field: keyof HeroSlide, value: string) => {
    setSlides(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  return (
    <div className="space-y-[32px]">
      {/* Header */}
      <div>
        <h1 className="text-[42px] font-bold tracking-tight uppercase leading-none text-white">Homepage</h1>
        <p className="text-xs text-[#71717A] mt-2">Modify storefront banners, Hero carousels, and grid sections.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Editor controls */}
        <div className="space-y-6">
          <div className="admin-glass p-8 space-y-6">
            <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-widest block border-b border-white/5 pb-2">Hero Carousel Slides</span>

            <div className="flex gap-2">
              {slides.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => setActiveSlide(idx)}
                  className={`px-4 py-2 border rounded-full text-xs font-bold transition-all shadow-sm ${
                    activeSlide === idx
                      ? 'bg-white text-black border-white'
                      : 'border-white/5 bg-[#181818] text-[#A1A1AA] hover:text-white'
                  }`}
                >
                  Slide {idx + 1}
                </button>
              ))}
            </div>

            {/* Slide Edit Form */}
            <div className="space-y-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-[#71717A] font-bold uppercase">Hero Bold Title</label>
                <input
                  type="text"
                  value={slides[activeSlide]?.title}
                  onChange={(e) => handleUpdateSlideField(slides[activeSlide].id, 'title', e.target.value)}
                  className="bg-[#090909] border border-white/5 focus:border-white/20 rounded-xl px-4 py-2.5 outline-none text-white font-semibold"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-[#71717A] font-bold uppercase">Subtitle Text</label>
                <textarea
                  rows={3}
                  value={slides[activeSlide]?.subtitle}
                  onChange={(e) => handleUpdateSlideField(slides[activeSlide].id, 'subtitle', e.target.value)}
                  className="bg-[#090909] border border-white/5 focus:border-white/20 rounded-xl px-4 py-2.5 outline-none text-white resize-none leading-relaxed"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-[#71717A] font-bold uppercase">Call To Action</label>
                <input
                  type="text"
                  value={slides[activeSlide]?.buttonText}
                  onChange={(e) => handleUpdateSlideField(slides[activeSlide].id, 'buttonText', e.target.value)}
                  className="bg-[#090909] border border-white/5 focus:border-white/20 rounded-xl px-4 py-2.5 outline-none text-white font-semibold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Live Simulator Phone mockup */}
        <div className="flex items-center justify-center p-8 bg-[#121212] border border-white/5 rounded-2xl relative min-h-[500px]">
          <div className="absolute top-4 left-4 flex items-center gap-1.5 text-[#71717A] font-bold text-[10px]">
            <Smartphone size={12} />
            <span>MOBILE PREVIEW</span>
          </div>

          {/* Smartphone structure */}
          <div className="w-[300px] h-[550px] border-4 border-white bg-black rounded-[32px] overflow-hidden flex flex-col relative shadow-2xl">
            {/* Camera notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-white rounded-b-xl z-20" />

            {/* Sim storefront banner view */}
            <div className="flex-1 bg-black flex flex-col justify-end p-6 text-center space-y-4 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <ImageIcon size={48} className="text-white/5" />
              </div>
              <div className="relative z-10 space-y-4 bg-black/80 backdrop-blur-md p-5 rounded-2xl border border-white/10 shadow-lg">
                <h4 className="font-black text-white tracking-wider text-base uppercase leading-snug">{slides[activeSlide]?.title}</h4>
                <p className="text-[10px] text-[#A1A1AA] leading-relaxed font-semibold">{slides[activeSlide]?.subtitle}</p>
                <button className="px-5 py-2 bg-white text-black hover:bg-zinc-200 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all">
                  {slides[activeSlide]?.buttonText}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
