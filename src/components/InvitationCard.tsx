'use client';

import React, { useState, useRef, useEffect } from 'react';
import { CardData } from '@/types/invitation';

interface Props {
  data: CardData;
  isPaid?: boolean;
  guestName?: string;
}

export default function InvitationCard({ 
  data, 
  isPaid = false, 
  guestName = "Dato' / Datin / Tuan / Puan" 
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isThrottled = useRef(false);

  const totalSlides = data.slides?.length || 1;

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleOpen = () => {
    setIsRotating(true);
    if (audioRef.current && !isPlaying) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
    setTimeout(() => {
      setIsOpen(true);
      setIsRotating(false);
    }, 600);
  };

  const goToSlide = (index: number) => {
    if (index >= 0 && index < totalSlides) {
      setCurrentSlide(index);
    }
  };

  const nextSlide = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  // Navigasi Roda Tetikus (Wheel) dengan Throttling
  const handleWheel = (e: React.WheelEvent) => {
    if (!isOpen || isThrottled.current) return;
    
    if (e.deltaY > 25) {
      isThrottled.current = true;
      nextSlide();
      setTimeout(() => { isThrottled.current = false; }, 400);
    } else if (e.deltaY < -25) {
      isThrottled.current = true;
      prevSlide();
      setTimeout(() => { isThrottled.current = false; }, 400);
    }
  };

  // Navigasi Sentuhan Telefon (Touch Swipe)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isOpen || touchStartY.current === null) return;
    
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY;

    if (diff > 40) {
      nextSlide(); // Leret ke atas -> Slaid seterusnya
    } else if (diff < -40) {
      prevSlide(); // Leret ke bawah -> Slaid sebelumnya
    }
    touchStartY.current = null;
  };

  return (
    <div 
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative w-full max-w-[400px] h-[780px] rounded-[36px] overflow-hidden shadow-2xl border-4 border-slate-700 bg-slate-950 flex flex-col justify-center items-center select-none"
    >
      {/* 1. LAPISAN WATERMARK JIKA BELUM BAYAR */}
      {!isPaid && (
        <div className="absolute inset-0 z-[100] pointer-events-none flex flex-col items-center justify-around opacity-25">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="text-3xl font-black tracking-widest text-red-500 uppercase -rotate-12 select-none">
              PREVIEW ONLY • UNPAID
            </div>
          ))}
        </div>
      )}

      {/* 2. AUDIO ENGINE */}
      {data.cover?.audioUrl && (
        <audio ref={audioRef} loop src={data.cover.audioUrl} />
      )}

      {/* 3. BUTANG KAWALAN MUZIK */}
      {isOpen && (
        <button
          onClick={toggleMusic}
          type="button"
          className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full flex items-center justify-center text-white border border-amber-300 shadow-xl transition-transform active:scale-90"
          style={{ backgroundColor: data.theme?.primaryColor || '#3d5343' }}
        >
          <i className={`fa-solid ${isPlaying ? 'fa-compact-disc fa-spin' : 'fa-volume-xmark'}`} />
        </button>
      )}

      {/* 4. PENUNJUK INDIKATOR TITIK (SLIDE DOTS) */}
      {isOpen && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2 bg-black/30 backdrop-blur-md py-2.5 px-1.5 rounded-full border border-white/10">
          {data.slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                currentSlide === i ? 'bg-amber-400 h-5' : 'bg-white/40 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      )}

      {/* ================= 5. COVER / SLIDING DOOR ================= */}
      <div 
        className={`absolute inset-0 z-40 transition-all duration-700 ${
          isOpen ? 'opacity-0 pointer-events-none invisible' : 'opacity-100 pointer-events-auto visible'
        }`}
      >
        {/* Pintu Kiri */}
        <div 
          className={`absolute top-0 left-0 w-1/2 h-full transition-transform duration-700 ${
            isOpen ? '-translate-x-full' : 'translate-x-0'
          }`}
          style={{ backgroundColor: data.theme?.primaryColor || '#3d5343' }}
        />

        {/* Pintu Kanan */}
        <div 
          className={`absolute top-0 right-0 w-1/2 h-full transition-transform duration-700 flex items-center ${
            isOpen ? 'translate-x-full' : 'translate-x-0'
          }`}
          style={{ backgroundColor: data.theme?.primaryColor || '#3d5343' }}
        >
          {/* Tombol Bismillah */}
          <div 
            onClick={handleOpen}
            className={`-translate-x-1/2 cursor-pointer transition-transform duration-500 hover:scale-105 active:scale-95 ${
              isRotating ? 'rotate-[360deg] scale-110' : ''
            }`}
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-600 via-amber-300 to-amber-700 border-2 border-white shadow-2xl flex items-center justify-center text-xs text-amber-950 font-bold">
              Bismillah
            </div>
          </div>
        </div>

        {/* Kandungan Muka Depan */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-white z-10">
          <div className="text-amber-300 text-lg mb-2">❧ ❦ ☙</div>
          <p className="tracking-[4px] uppercase text-xs text-slate-200" style={{ fontFamily: 'Cinzel, serif' }}>
            {data.cover?.tagline}
          </p>
          <h1 className="text-4xl text-white my-3" style={{ fontFamily: 'Great Vibes, cursive' }}>
            {data.cover?.mainTitle}
          </h1>
          <p className="text-xs tracking-widest text-amber-200" style={{ fontFamily: 'Cinzel, serif' }}>
            {data.cover?.dateText}
          </p>

          <div className="mt-6 px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
            <span className="text-[10px] tracking-wider uppercase block text-slate-300">Kepada:</span>
            <span className="font-semibold text-sm" style={{ fontFamily: 'Playfair Display, serif' }}>
              {guestName}
            </span>
          </div>

          <button
            onClick={handleOpen}
            type="button"
            className="mt-6 px-6 py-2.5 rounded-full border border-amber-300 bg-black/50 backdrop-blur text-xs tracking-widest uppercase hover:bg-amber-500 hover:text-white transition-all flex items-center gap-2 cursor-pointer shadow-lg active:scale-95"
            style={{ fontFamily: 'Cinzel, serif' }}
          >
            <i className="fa-regular fa-envelope-open" /> BUKA JEMPUTAN
          </button>
        </div>
      </div>

      {/* ================= 6. SLIDES CONTAINER ================= */}
      <div 
        className="w-full h-full relative transition-transform duration-500 ease-out"
        style={{
          transform: `translateY(-${currentSlide * 100}%)`,
          backgroundImage: `url(${data.theme?.bgPatternUrl || ''})`,
          backgroundSize: 'cover'
        }}
      >
        {data.slides.map((slide, idx) => (
          <div key={slide.id || idx} className="w-full h-[780px] p-5 flex flex-col justify-center items-center relative">
            <div 
              className="w-full max-h-[580px] rounded-2xl p-6 text-center shadow-2xl border relative flex flex-col justify-between items-center bg-white/95"
              style={{
                borderColor: `${data.theme?.goldColor || '#b59049'}50`,
                color: '#2c332e'
              }}
            >
              <span className="text-xs uppercase font-bold tracking-widest" style={{ color: data.theme?.goldColor || '#b59049', fontFamily: 'Cinzel, serif' }}>
                {slide.title || 'Jemputan'}
              </span>

              {/* Jenis: INTRO */}
              {slide.type === 'intro' && (
                <div className="space-y-4 my-auto">
                  <p className="text-xs text-slate-600 leading-relaxed max-w-[280px] mx-auto">
                    {slide.bodyText}
                  </p>
                  {slide.imageUrl && (
                    <div className="relative w-28 h-36 mx-auto rounded-full border-2 p-1 overflow-hidden shadow-inner" style={{ borderColor: data.theme?.goldColor || '#b59049' }}>
                      <img src={slide.imageUrl} alt="Visual" className="w-full h-full object-cover rounded-full" />
                    </div>
                  )}
                  <h2 className="text-xl font-bold" style={{ color: data.theme?.primaryColor || '#3d5343', fontFamily: 'Playfair Display, serif' }}>
                    {slide.subtitle}
                  </h2>
                </div>
              )}

              {/* Jenis: TENTATIVE */}
              {slide.type === 'tentative' && (
                <div className="w-full space-y-3 my-auto">
                  {slide.timeline?.map((item, tIdx) => (
                    <div key={tIdx} className="flex justify-between border-b border-dashed border-amber-900/20 pb-2 text-xs">
                      <span className="font-bold text-amber-800">{item.time}</span>
                      <span className="text-slate-700">{item.activity}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Jenis: LOCATION */}
              {slide.type === 'location' && slide.locationDetails && (
                <div className="space-y-4 my-auto">
                  <h3 className="text-base font-bold" style={{ color: data.theme?.primaryColor || '#3d5343' }}>
                    {slide.locationDetails.venueName}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                    {slide.locationDetails.address}
                  </p>
                  <div className="flex justify-center gap-3 pt-2">
                    <a href={slide.locationDetails.gmapsUrl} target="_blank" rel="noreferrer" className="px-3.5 py-2 rounded-full text-[11px] text-white bg-slate-800 hover:bg-slate-700 flex items-center gap-1.5 shadow">
                      <i className="fa-solid fa-map-pin text-red-400" /> Google Maps
                    </a>
                    <a href={slide.locationDetails.wazeUrl} target="_blank" rel="noreferrer" className="px-3.5 py-2 rounded-full text-[11px] text-white bg-cyan-700 hover:bg-cyan-600 flex items-center gap-1.5 shadow">
                      <i className="fa-brands fa-waze" /> Waze
                    </a>
                  </div>
                </div>
              )}

              {/* Jenis: THANK YOU */}
              {slide.type === 'thank_you' && (
                <div className="space-y-3 my-auto">
                  <div className="text-2xl text-amber-600">❧ ❦ ☙</div>
                  <p className="text-xs leading-relaxed text-slate-700">
                    {slide.bodyText || 'Sekalung penghargaan dan terima kasih atas kehadiran dan doa tulus ikhlas anda.'}
                  </p>
                  <div className="text-amber-600 text-lg">𖥸</div>
                </div>
              )}

              {/* BUTANG NAVIGASI BAWAH */}
              <div className="w-full flex justify-between items-center pt-2 mt-auto border-t border-slate-200/60">
                {idx > 0 ? (
                  <button 
                    onClick={prevSlide} 
                    type="button"
                    className="text-[10px] uppercase tracking-widest text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold px-2 py-1"
                  >
                    <i className="fa-solid fa-chevron-up text-xs" /> KEMBALI
                  </button>
                ) : <div />}

                {idx < totalSlides - 1 ? (
                  <button 
                    onClick={nextSlide} 
                    type="button"
                    className="text-[11px] uppercase tracking-widest text-amber-800 font-bold flex items-center gap-1.5 animate-bounce px-3 py-1 rounded-full bg-amber-500/10 hover:bg-amber-500/20"
                    style={{ fontFamily: 'Cinzel, serif' }}
                  >
                    SETERUSNYA <i className="fa-solid fa-chevron-down text-xs" />
                  </button>
                ) : (
                  <button 
                    onClick={() => setIsOpen(false)} 
                    type="button"
                    className="text-[10px] uppercase tracking-widest text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold px-2 py-1"
                  >
                    <i className="fa-solid fa-lock text-xs" /> TUTUP KAD
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}