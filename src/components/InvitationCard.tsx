'use client';

import React, { useState, useRef } from 'react';
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
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isScrolling = useRef<boolean>(false);

  const slides = data?.slides && data.slides.length > 0 ? data.slides : [
    { id: '1', type: 'intro' as const, title: 'Jemputan', bodyText: 'Tiada maklumat helaian.' }
  ];
  const totalSlides = slides.length;

  const toggleMusic = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleOpenCard = () => {
    if (audioRef.current && !isPlaying) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
    setIsOpen(true);
    setCurrentSlide(0);
  };

  const handleCloseCard = () => {
    setIsOpen(false);
    setCurrentSlide(0);
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

  // Navigasi Roda Tetikus PC (Mouse Wheel) Menegak
  const handleWheel = (e: React.WheelEvent) => {
    if (!isOpen || isScrolling.current) return;
    
    if (e.deltaY > 30) {
      isScrolling.current = true;
      nextSlide();
      setTimeout(() => { isScrolling.current = false; }, 600);
    } else if (e.deltaY < -30) {
      isScrolling.current = true;
      prevSlide();
      setTimeout(() => { isScrolling.current = false; }, 600);
    }
  };

  // Navigasi Leretan Skrin Telefon (Mobile Touch Swipe) Menegak
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isOpen || touchStartY.current === null) return;
    
    const diffY = touchStartY.current - e.changedTouches[0].clientY;

    if (diffY > 40) {
      nextSlide(); // Leret ke atas -> Helaian seterusnya turun
    } else if (diffY < -40) {
      prevSlide(); // Leret ke bawah -> Helaian sebelumnya naik
    }
    touchStartY.current = null;
  };

  return (
    <div 
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative w-full max-w-[400px] h-[760px] rounded-[36px] overflow-hidden shadow-2xl border-4 border-slate-700 bg-slate-950 flex flex-col justify-between items-center select-none"
      style={{
        backgroundImage: `url(${data.theme?.bgPatternUrl || ''})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* 1. LAPISAN WATERMARK JIKA BELUM DIBAYAR */}
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

      {/* 3. BUTANG MUZIK (TERAPUNG ATAS KANAN) */}
      {isOpen && (
        <button
          onClick={toggleMusic}
          type="button"
          className="absolute top-5 right-5 z-40 w-9 h-9 rounded-full flex items-center justify-center text-white border border-amber-300 bg-slate-900/80 backdrop-blur shadow-xl transition-transform active:scale-90"
        >
          <i className={`fa-solid text-xs ${isPlaying ? 'fa-compact-disc fa-spin text-amber-400' : 'fa-volume-xmark text-slate-400'}`} />
        </button>
      )}

      {/* 4. PENUNJUK INDIKATOR TITIK MENEGAK (KANAN KAD) */}
      {isOpen && (
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-2 bg-black/40 backdrop-blur-md py-3 px-1.5 rounded-full border border-white/10 shadow-lg">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`w-2 rounded-full transition-all duration-500 ${
                currentSlide === i ? 'bg-amber-400 h-6' : 'bg-white/40 h-2 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      )}

      {/* ================= 5. MUKA DEPAN (SLIDE NAIK KE ATAS APABILA DIBUKA) ================= */}
      <div 
        className={`absolute inset-0 z-50 flex flex-col items-center justify-center p-6 text-white bg-slate-900 transition-transform duration-1000 ease-[cubic-bezier(0.77,0,0.175,1)] ${
          isOpen ? '-translate-y-full pointer-events-none' : 'translate-y-0 pointer-events-auto'
        }`}
        style={{
          backgroundColor: data.theme?.primaryColor || '#1e293b'
        }}
      >
        <div className="text-amber-300 text-xl mb-3">❧ ❦ ☙</div>
        <p className="tracking-[4px] uppercase text-xs text-slate-200 text-center" style={{ fontFamily: 'Cinzel, serif' }}>
          {data.cover?.tagline}
        </p>
        <h1 className="text-4xl text-white my-4 text-center" style={{ fontFamily: 'Great Vibes, cursive' }}>
          {data.cover?.mainTitle}
        </h1>
        <p className="text-xs tracking-widest text-amber-200 text-center" style={{ fontFamily: 'Cinzel, serif' }}>
          {data.cover?.dateText}
        </p>

        <div className="mt-8 px-6 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-center">
          <span className="text-[10px] tracking-wider uppercase block text-slate-300">Kepada:</span>
          <span className="font-semibold text-sm" style={{ fontFamily: 'Playfair Display, serif' }}>
            {guestName}
          </span>
        </div>

        <button
          onClick={handleOpenCard}
          type="button"
          className="mt-10 px-8 py-3.5 rounded-full border-2 border-amber-300 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs tracking-widest uppercase shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          style={{ fontFamily: 'Cinzel, serif' }}
        >
          <i className="fa-regular fa-envelope-open text-sm" /> BUKA JEMPUTAN
        </button>
      </div>

      {/* ================= 6. ENJIN HELAIAN MENEGAK (VERTICAL SLIDES) ================= */}
      <div className="relative w-full h-full overflow-hidden">
        {slides.map((slide, idx) => {
          // Kira kedudukan relatif menegak bagi setiap slaid
          const offset = idx - currentSlide;
          
          return (
            <div
              key={slide.id || idx}
              className={`absolute inset-0 w-full h-full p-5 flex flex-col justify-center items-center transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${
                offset === 0 ? 'pointer-events-auto opacity-100 z-20' : 'pointer-events-none opacity-0 z-10'
              }`}
              style={{
                transform: `translateY(${offset * 100}%)`,
              }}
            >
              {/* Kotak Kad Putih */}
              <div 
                className="w-full max-h-[580px] min-h-[520px] rounded-3xl p-6 text-center shadow-2xl border flex flex-col justify-between items-center bg-white/95"
                style={{
                  borderColor: `${data.theme?.goldColor || '#b59049'}60`,
                  color: '#2c332e'
                }}
              >
                {/* Bahagian Atas Kad */}
                <div className="w-full">
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                    <span>Helaian {idx + 1} / {totalSlides}</span>
                    <span className="text-amber-700">❧ ❦ ☙</span>
                  </div>
                  <h2 className="text-sm font-bold uppercase tracking-[2px]" style={{ color: data.theme?.goldColor || '#b59049', fontFamily: 'Cinzel, serif' }}>
                    {slide.title || 'Jemputan'}
                  </h2>
                  <div className="w-10 h-0.5 mx-auto mt-1.5 rounded-full" style={{ backgroundColor: data.theme?.goldColor || '#b59049' }} />
                </div>

                {/* Bahagian Kandungan Slaid */}
                <div className="my-auto w-full py-2 flex flex-col items-center justify-center">
                  
                  {/* Slaid: INTRO */}
                  {slide.type === 'intro' && (
                    <div className="space-y-3">
                      <p className="text-xs text-slate-600 leading-relaxed max-w-[280px] mx-auto">
                        {slide.bodyText}
                      </p>
                      {slide.imageUrl && (
                        <div className="w-28 h-32 mx-auto rounded-full border-2 p-1 overflow-hidden shadow-inner my-2" style={{ borderColor: data.theme?.goldColor || '#b59049' }}>
                          <img src={slide.imageUrl} alt="Visual" className="w-full h-full object-cover rounded-full" />
                        </div>
                      )}
                      <h3 className="text-lg font-bold" style={{ color: data.theme?.primaryColor || '#3d5343', fontFamily: 'Playfair Display, serif' }}>
                        {slide.subtitle}
                      </h3>
                    </div>
                  )}

                  {/* Slaid: TENTATIVE */}
                  {slide.type === 'tentative' && (
                    <div className="w-full space-y-3 max-w-[280px]">
                      {slide.timeline?.map((item, tIdx) => (
                        <div key={tIdx} className="flex justify-between items-center border-b border-dashed border-amber-900/20 pb-2 text-xs">
                          <span className="font-bold text-amber-800 shrink-0">{item.time}</span>
                          <span className="text-slate-700 text-right">{item.activity}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Slaid: LOCATION */}
                  {slide.type === 'location' && slide.locationDetails && (
                    <div className="space-y-3 max-w-[280px]">
                      <h3 className="text-base font-bold" style={{ color: data.theme?.primaryColor || '#3d5343' }}>
                        {slide.locationDetails.venueName}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                        {slide.locationDetails.address}
                      </p>
                      <div className="flex justify-center gap-3 pt-2">
                        <a href={slide.locationDetails.gmapsUrl} target="_blank" rel="noreferrer" className="px-3.5 py-2 rounded-full text-[11px] font-semibold text-white bg-slate-800 hover:bg-slate-700 flex items-center gap-1.5 shadow active:scale-95">
                          <i className="fa-solid fa-map-pin text-red-400" /> Google Maps
                        </a>
                        <a href={slide.locationDetails.wazeUrl} target="_blank" rel="noreferrer" className="px-3.5 py-2 rounded-full text-[11px] font-semibold text-white bg-cyan-700 hover:bg-cyan-600 flex items-center gap-1.5 shadow active:scale-95">
                          <i className="fa-brands fa-waze" /> Waze
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Slaid: THANK YOU */}
                  {slide.type === 'thank_you' && (
                    <div className="space-y-3">
                      <div className="text-3xl text-amber-600">❧ ❦ ☙</div>
                      <p className="text-xs leading-relaxed text-slate-700 max-w-[280px] mx-auto">
                        {slide.bodyText || 'Sekalung penghargaan dan terima kasih atas kehadiran dan doa tulus ikhlas anda.'}
                      </p>
                      <div className="text-amber-600 text-xl">𖥸</div>
                    </div>
                  )}
                </div>

                {/* Navigasi Bawah Kad */}
                <div className="w-full flex flex-col items-center gap-2 pt-2 border-t border-slate-200">
                  {idx < totalSlides - 1 ? (
                    <button 
                      onClick={nextSlide} 
                      type="button"
                      className="px-5 py-2 rounded-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs tracking-wider flex items-center gap-1.5 animate-bounce shadow-md active:scale-95 transition-all cursor-pointer"
                      style={{ fontFamily: 'Cinzel, serif' }}
                    >
                      SELAK KE BAWAH <i className="fa-solid fa-chevron-down text-xs" />
                    </button>
                  ) : (
                    <button 
                      onClick={handleCloseCard} 
                      type="button"
                      className="px-5 py-2 rounded-full bg-slate-900 text-white font-semibold text-xs flex items-center gap-1.5 shadow active:scale-95 cursor-pointer"
                    >
                      <i className="fa-solid fa-lock text-xs" /> TUTUP JEMPUTAN
                    </button>
                  )}

                  {idx > 0 && (
                    <button 
                      onClick={prevSlide} 
                      type="button"
                      className="text-[10px] text-slate-500 hover:text-slate-800 font-semibold uppercase tracking-wider flex items-center gap-1 pt-1"
                    >
                      <i className="fa-solid fa-chevron-up text-[9px]" /> Helaian Atas
                    </button>
                  )}
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}