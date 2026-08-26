'use client';

import React, { useState, useRef } from 'react';
import { CardData } from '@/types/invitation';

interface Props {
  data: CardData;
  isPaid?: boolean;
  guestName?: string;
}

export default function InvitationCard({ data, isPaid = false, guestName = "Dato' / Datin / Tuan / Puan" }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLockedEnd, setIsLockedEnd] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const touchStartY = useRef<number>(0);

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
      setIsLockedEnd(false);
      setIsRotating(false);
    }, 750);
  };

  const nextSlide = () => {
    if (currentSlide < data.slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      setIsOpen(false);
      setIsLockedEnd(true);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  // Sokongan Skrol Roda Tetikus (Mouse Wheel)
  const handleWheel = (e: React.WheelEvent) => {
    if (!isOpen) return;
    if (e.deltaY > 40) {
      nextSlide();
    } else if (e.deltaY < -40) {
      prevSlide();
    }
  };

  // Sokongan Leret Skrin Sentuh (Mobile Touch Swipe)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isOpen) return;
    const diff = touchStartY.current - e.changedTouches[0].clientY;
    if (diff > 50) {
      nextSlide(); // Leret ke atas -> Slaid seterusnya
    } else if (diff < -50) {
      prevSlide(); // Leret ke bawah -> Slaid sebelumnya
    }
  };

  return (
    <div 
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative w-full max-w-[400px] h-[780px] rounded-[36px] overflow-hidden shadow-2xl border-4 border-slate-700 bg-black flex flex-col justify-center items-center select-none"
    >
      {/* LAPISAN WATERMARK JIKA BELUM BAYAR */}
      {!isPaid && (
        <div className="absolute inset-0 z-[100000] pointer-events-none flex flex-col items-center justify-around opacity-30">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="text-3xl font-black tracking-widest text-red-500 uppercase -rotate-12 select-none">
              PREVIEW ONLY • UNPAID
            </div>
          ))}
        </div>
      )}

      {/* Audio Element */}
      {data.cover.audioUrl && (
        <audio ref={audioRef} loop src={data.cover.audioUrl} />
      )}

      {/* Muzik Floating Button */}
      {isOpen && (
        <button
          onClick={toggleMusic}
          className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full flex items-center justify-center text-white border border-amber-300 shadow-lg"
          style={{ backgroundColor: data.theme.primaryColor }}
        >
          <i className={`fa-solid ${isPlaying ? 'fa-compact-disc fa-spin' : 'fa-volume-xmark'}`} />
        </button>
      )}

      {/* ================= 1. COVER / SLIDING DOOR ================= */}
      <div 
        className={`absolute inset-0 z-40 transition-all duration-1000 ${
          isOpen ? 'pointer-events-none opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
      >
        {/* Pintu Kiri */}
        <div 
          className={`absolute top-0 left-0 w-1/2 h-full transition-transform duration-1000 ${
            isOpen ? '-translate-x-full' : 'translate-x-0'
          }`}
          style={{ backgroundColor: data.theme.primaryColor }}
        />

        {/* Pintu Kanan */}
        <div 
          className={`absolute top-0 right-0 w-1/2 h-full transition-transform duration-1000 flex items-center ${
            isOpen ? 'translate-x-full' : 'translate-x-0'
          }`}
          style={{ backgroundColor: data.theme.primaryColor }}
        >
          {/* Tombol Emas */}
          <div 
            onClick={isLockedEnd ? () => setIsOpen(true) : handleOpen}
            className={`-translate-x-1/2 cursor-pointer transition-transform duration-700 ${
              isRotating ? 'rotate-[360deg] scale-110' : ''
            }`}
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-600 via-amber-300 to-amber-700 border-2 border-white shadow-xl flex items-center justify-center text-xs text-amber-950 font-bold">
              Bismillah
            </div>
          </div>
        </div>

        {/* Kandungan Teks Muka Depan */}
        {!isLockedEnd && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-white z-10 pointer-events-auto">
            <div className="text-amber-300 text-lg mb-2">❧ ❦ ☙</div>
            <p className="tracking-[4px] uppercase text-xs text-slate-200" style={{ fontFamily: 'Cinzel, serif' }}>
              {data.cover.tagline}
            </p>
            <h1 className="text-4xl text-white my-3" style={{ fontFamily: 'Great Vibes, cursive' }}>
              {data.cover.mainTitle}
            </h1>
            <p className="text-xs tracking-widest text-amber-200" style={{ fontFamily: 'Cinzel, serif' }}>
              {data.cover.dateText}
            </p>

            <div className="mt-6 px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
              <span className="text-[10px] tracking-wider uppercase block text-slate-300">Kepada:</span>
              <span className="font-semibold text-sm" style={{ fontFamily: 'Playfair Display, serif' }}>
                {guestName}
              </span>
            </div>

            <button
              onClick={handleOpen}
              className="mt-6 px-6 py-2 rounded-full border border-amber-300 bg-black/40 backdrop-blur text-xs tracking-widest uppercase hover:bg-amber-500 hover:text-white transition-all flex items-center gap-2"
              style={{ fontFamily: 'Cinzel, serif' }}
            >
              <i className="fa-regular fa-envelope-open" /> BUKA JEMPUTAN
            </button>
          </div>
        )}
      </div>

      {/* ================= 2. SLIDES CONTAINER ================= */}
      <div 
        className="w-full h-full relative transition-transform duration-700 ease-out"
        style={{
          transform: `translateY(-${currentSlide * 100}%)`,
          backgroundImage: `url(${data.theme.bgPatternUrl})`,
          backgroundSize: 'cover'
        }}
      >
        {data.slides.map((slide, idx) => (
          <div key={slide.id || idx} className="w-full h-[780px] p-5 flex flex-col justify-center items-center relative">
            <div 
              className="w-full max-h-[560px] rounded-2xl p-6 text-center shadow-lg border relative flex flex-col justify-between items-center"
              style={{
                backgroundColor: data.theme.cardBackgroundColor,
                borderColor: `${data.theme.goldColor}40`,
                color: '#2c332e'
              }}
            >
              <span className="text-xs uppercase font-bold tracking-widest" style={{ color: data.theme.goldColor, fontFamily: 'Cinzel, serif' }}>
                {slide.title || 'Jemputan'}
              </span>

              {slide.type === 'intro' && (
                <>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-[280px]">
                    {slide.bodyText}
                  </p>
                  {slide.imageUrl && (
                    <div className="relative w-28 h-36 mx-auto rounded-full border-2 p-1 overflow-hidden" style={{ borderColor: data.theme.goldColor }}>
                      <img src={slide.imageUrl} alt="Visual" className="w-full h-full object-cover rounded-full" />
                    </div>
                  )}
                  <h2 className="text-xl font-bold" style={{ color: data.theme.primaryColor, fontFamily: 'Playfair Display, serif' }}>
                    {slide.subtitle}
                  </h2>
                </>
              )}

              {slide.type === 'tentative' && (
                <div className="w-full space-y-3 my-auto">
                  {slide.timeline?.map((item, tIdx) => (
                    <div key={tIdx} className="flex justify-between border-b border-dashed border-amber-900/20 pb-2 text-xs">
                      <span className="font-bold text-amber-700">{item.time}</span>
                      <span className="text-slate-700">{item.activity}</span>
                    </div>
                  ))}
                </div>
              )}

              {slide.type === 'location' && slide.locationDetails && (
                <div className="space-y-4 my-auto">
                  <h3 className="text-base font-bold" style={{ color: data.theme.primaryColor }}>
                    {slide.locationDetails.venueName}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                    {slide.locationDetails.address}
                  </p>
                  <div className="flex justify-center gap-3 pt-2">
                    <a href={slide.locationDetails.gmapsUrl} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-full text-[10px] text-white bg-slate-800 flex items-center gap-1.5">
                      <i className="fa-solid fa-map-pin" /> Google Maps
                    </a>
                    <a href={slide.locationDetails.wazeUrl} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-full text-[10px] text-white bg-cyan-700 flex items-center gap-1.5">
                      <i className="fa-brands fa-waze" /> Waze
                    </a>
                  </div>
                </div>
              )}

              {slide.type === 'thank_you' && (
                <div className="space-y-3 my-auto">
                  <div className="text-2xl text-amber-600">❧ ❦ ☙</div>
                  <p className="text-xs leading-relaxed text-slate-700">
                    {slide.bodyText || 'Sekalung penghargaan dan terima kasih atas kehadiran dan doa tulus ikhlas anda.'}
                  </p>
                  <div className="text-amber-600 text-lg">𖥸</div>
                </div>
              )}

              {/* Butang Navigasi Bawah */}
              <button 
                onClick={nextSlide} 
                className="text-[10px] uppercase tracking-widest text-amber-700 flex flex-col items-center gap-1 animate-bounce cursor-pointer mt-4"
                style={{ fontFamily: 'Cinzel, serif' }}
              >
                <i className={`fa-solid ${idx === data.slides.length - 1 ? 'fa-lock' : 'fa-chevron-down'}`} />
                {idx === data.slides.length - 1 ? 'TUTUP' : 'SELAK'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}