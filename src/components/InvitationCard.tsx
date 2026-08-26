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
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const slides = data?.slides && data.slides.length > 0 ? data.slides : [
    { id: '1', type: 'intro' as const, title: 'Jemputan', bodyText: 'Tiada maklumat helaian.' }
  ];
  const totalSlides = slides.length;
  const current = slides[currentSlide] || slides[0];

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
    } else {
      handleCloseCard();
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  // Navigasi Sentuhan Telefon (Touch Gestures)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isOpen || touchStartX.current === null || touchStartY.current === null) return;
    
    const diffX = touchStartX.current - e.changedTouches[0].clientX;
    const diffY = touchStartY.current - e.changedTouches[0].clientY;

    // Leret ke atas ATAU ke kiri -> Slaid seterusnya
    if (diffY > 40 || diffX > 40) {
      nextSlide();
    } 
    // Leret ke bawah ATAU ke kanan -> Slaid sebelumnya
    else if (diffY < -40 || diffX < -40) {
      prevSlide();
    }

    touchStartX.current = null;
    touchStartY.current = null;
  };

  return (
    <div 
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative w-full max-w-[390px] h-[750px] rounded-[36px] overflow-hidden shadow-2xl border-4 border-slate-700 bg-slate-950 flex flex-col justify-between items-center select-none"
      style={{
        backgroundImage: `url(${data.theme?.bgPatternUrl || ''})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
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

      {/* ================= 3. MOD KAD BERTUTUP (COVER) ================= */}
      {!isOpen && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center p-6 text-white bg-slate-900/90 backdrop-blur-sm">
          <div className="text-amber-300 text-lg mb-2">❧ ❦ ☙</div>
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
            className="mt-10 px-8 py-3.5 rounded-full border-2 border-amber-400 bg-amber-500 text-slate-950 font-bold text-xs tracking-widest uppercase shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            style={{ fontFamily: 'Cinzel, serif' }}
          >
            <i className="fa-regular fa-envelope-open text-sm" /> BUKA JEMPUTAN
          </button>
        </div>
      )}

      {/* ================= 4. MOD KAD DIBUKA (SLIDES ENGINE) ================= */}
      {isOpen && (
        <div className="w-full h-full flex flex-col justify-between p-4 z-20">
          
          {/* Header Bar: Progress Story & Muzik */}
          <div className="w-full flex items-center justify-between gap-3 pt-2">
            <div className="flex-1 flex gap-1.5">
              {slides.map((_, i) => (
                <div 
                  key={i} 
                  onClick={() => setCurrentSlide(i)}
                  className="h-2 flex-1 rounded-full bg-white/30 overflow-hidden cursor-pointer"
                >
                  <div 
                    className={`h-full transition-all duration-300 ${
                      i === currentSlide ? 'bg-amber-400 w-full' : i < currentSlide ? 'bg-white w-full' : 'w-0'
                    }`} 
                  />
                </div>
              ))}
            </div>

            <button
              onClick={toggleMusic}
              type="button"
              className="w-8 h-8 rounded-full flex items-center justify-center text-white border border-amber-300 bg-slate-800 shrink-0 shadow"
            >
              <i className={`fa-solid text-xs ${isPlaying ? 'fa-compact-disc fa-spin text-amber-400' : 'fa-volume-xmark'}`} />
            </button>
          </div>

          {/* Kotak Kandungan Slaid Semasa */}
          <div className="w-full my-auto flex items-center justify-center">
            <div 
              className="w-full min-h-[500px] rounded-2xl p-6 text-center shadow-2xl border flex flex-col justify-between items-center bg-white/95 transition-all"
              style={{
                borderColor: `${data.theme?.goldColor || '#b59049'}60`,
                color: '#2c332e'
              }}
            >
              {/* Header Tajuk Helaian */}
              <div className="w-full text-center">
                <div className="flex justify-between items-center text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">
                  <span>Halaman {currentSlide + 1} / {totalSlides}</span>
                  <span className="text-amber-700">❧ ❦ ☙</span>
                </div>
                <h3 className="text-sm uppercase font-bold tracking-[2px]" style={{ color: data.theme?.goldColor || '#b59049', fontFamily: 'Cinzel, serif' }}>
                  {current.title || 'Jemputan'}
                </h3>
              </div>

              {/* Kandungan Dinamik */}
              <div className="my-auto w-full py-4 flex flex-col items-center justify-center">
                
                {/* 1. Jenis INTRO */}
                {current.type === 'intro' && (
                  <div className="space-y-4">
                    <p className="text-xs text-slate-600 leading-relaxed max-w-[280px] mx-auto">
                      {current.bodyText}
                    </p>
                    {current.imageUrl && (
                      <div className="w-28 h-32 mx-auto rounded-full border-2 p-1 overflow-hidden shadow-inner my-2" style={{ borderColor: data.theme?.goldColor || '#b59049' }}>
                        <img src={current.imageUrl} alt="Visual" className="w-full h-full object-cover rounded-full" />
                      </div>
                    )}
                    <h2 className="text-lg font-bold" style={{ color: data.theme?.primaryColor || '#3d5343', fontFamily: 'Playfair Display, serif' }}>
                      {current.subtitle}
                    </h2>
                  </div>
                )}

                {/* 2. Jenis TENTATIVE */}
                {current.type === 'tentative' && (
                  <div className="w-full space-y-3 max-w-[280px]">
                    {current.timeline?.map((item, tIdx) => (
                      <div key={tIdx} className="flex justify-between items-center border-b border-dashed border-amber-900/20 pb-2 text-xs">
                        <span className="font-bold text-amber-800">{item.time}</span>
                        <span className="text-slate-700 text-right">{item.activity}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* 3. Jenis LOCATION */}
                {current.type === 'location' && current.locationDetails && (
                  <div className="space-y-3 max-w-[280px]">
                    <h3 className="text-base font-bold" style={{ color: data.theme?.primaryColor || '#3d5343' }}>
                      {current.locationDetails.venueName}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                      {current.locationDetails.address}
                    </p>
                    <div className="flex justify-center gap-3 pt-3">
                      <a href={current.locationDetails.gmapsUrl} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-full text-[11px] font-semibold text-white bg-slate-800 flex items-center gap-1.5 shadow active:scale-95">
                        <i className="fa-solid fa-map-pin text-red-400" /> Google Maps
                      </a>
                      <a href={current.locationDetails.wazeUrl} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-full text-[11px] font-semibold text-white bg-cyan-700 flex items-center gap-1.5 shadow active:scale-95">
                        <i className="fa-brands fa-waze" /> Waze
                      </a>
                    </div>
                  </div>
                )}

                {/* 4. Jenis THANK YOU */}
                {current.type === 'thank_you' && (
                  <div className="space-y-3">
                    <div className="text-3xl text-amber-600">❧ ❦ ☙</div>
                    <p className="text-xs leading-relaxed text-slate-700 max-w-[280px] mx-auto">
                      {current.bodyText || 'Sekalung penghargaan dan terima kasih atas kehadiran dan doa tulus ikhlas anda.'}
                    </p>
                    <div className="text-amber-600 text-xl">𖥸</div>
                  </div>
                )}
              </div>

              {/* Bar Navigasi Bawah */}
              <div className="w-full flex justify-between items-center pt-3 border-t border-slate-200">
                {currentSlide > 0 ? (
                  <button 
                    onClick={prevSlide} 
                    type="button"
                    className="px-3.5 py-2 rounded-xl text-slate-700 font-bold text-xs flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all cursor-pointer"
                  >
                    <i className="fa-solid fa-arrow-left" /> KEMBALI
                  </button>
                ) : <div />}

                {currentSlide < totalSlides - 1 ? (
                  <button 
                    onClick={nextSlide} 
                    type="button"
                    className="ml-auto px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs tracking-wider flex items-center gap-2 shadow-lg active:scale-95 transition-all cursor-pointer"
                    style={{ fontFamily: 'Cinzel, serif' }}
                  >
                    SETERUSNYA <i className="fa-solid fa-arrow-right" />
                  </button>
                ) : (
                  <button 
                    onClick={handleCloseCard} 
                    type="button"
                    className="ml-auto px-5 py-2 rounded-full bg-slate-900 text-white font-semibold text-xs flex items-center gap-1.5 shadow active:scale-95 cursor-pointer"
                  >
                    <i className="fa-solid fa-lock" /> TUTUP KAD
                  </button>
                )}
              </div>

            </div>
          </div>

          {/* Panduan Ringkas Bawah */}
          <p className="text-[10px] text-white/60 text-center tracking-wider uppercase">
            Leret atas/bawah atau tekan butang untuk tukar helaian
          </p>

        </div>
      )}
    </div>
  );
}