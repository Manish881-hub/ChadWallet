"use client";

import React, { useState, useEffect } from 'react';

const MOBILE_IMAGES = [
  '/appstore/portfolio.png',
  '/appstore/search.png',
  '/appstore/discover.png',
  '/appstore/token.png',
];

export default function DeviceShowcaseSection() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % MOBILE_IMAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative pt-4 pb-8 sm:py-24 md:py-32 px-4 sm:px-6 overflow-visible z-20">
      <div className="max-w-6xl mx-auto">
        <div className="relative flex items-center justify-center">

          {/* Main Desktop Window */}
          <div className="relative w-full max-w-4xl group">
            {/* Ambient Glow behind the window */}
            <div className="absolute -inset-4 bg-gradient-to-r from-[#5c67d6]/30 via-[#2E3192]/40 to-[#5c67d6]/30 rounded-[3rem] blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
            
            {/* Window Hardware Frame */}
            <div className="relative rounded-[2rem] border border-white/10 overflow-hidden bg-[#050816] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] transform transition-transform duration-700 hover:-translate-y-2">
              
              {/* MacOS Top Bar */}
              <div className="flex items-center gap-2 px-6 py-4 border-b border-white/10 bg-white/5 backdrop-blur-md relative z-20">
                <span className="w-3 h-3 rounded-full bg-[#ff5f56] shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]" />
                <span className="w-3 h-3 rounded-full bg-[#ffbd2e] shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]" />
                <span className="w-3 h-3 rounded-full bg-[#27c93f] shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]" />
              </div>
              
              {/* Video Container */}
              <div className="relative aspect-[16/9] bg-black overflow-hidden">
                <video 
                  src="/video/chadwallet.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Screen Reflection/Glass Overlay */}
                <div className="absolute inset-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] pointer-events-none" />
              </div>
            </div>

            {/* Mobile Phone Overlay */}
            <div className="absolute -bottom-6 right-2 sm:-bottom-8 sm:-right-2 md:-bottom-12 md:-right-12 w-[38%] sm:w-[40%] md:w-64 max-w-[180px] sm:max-w-none rounded-3xl sm:rounded-[2.5rem] border-[4px] sm:border-[6px] border-[#1a1c29] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.9)] bg-black transform transition-transform duration-700 hover:-translate-y-6 hover:-rotate-2 hover:scale-105 z-30 cursor-pointer">
              <div className="relative aspect-[9/19] bg-black">
                {/* iPhone Dynamic Island / Notch */}
                <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-30">
                  <div className="w-24 h-6 bg-[#1a1c29] rounded-b-2xl shadow-md" />
                </div>
                
                {/* Mobile UI Screenshot Carousel */}
                {MOBILE_IMAGES.map((src, index) => (
                  <img 
                    key={src}
                    src={src} 
                    alt={`Mobile Experience ${index + 1}`}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                      index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                    }`}
                    loading={index === 0 ? "eager" : "lazy"}
                  />
                ))}
                
                <div className="absolute inset-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] pointer-events-none z-20" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
