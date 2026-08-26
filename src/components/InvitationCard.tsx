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
  const [doorHidden, setDoorHidden] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const touchStartY = useRef<number | null>(null);

  const slides = data?.slides && data.slides.length > 0 ? data.slides : [
    { id: '1', type: 'intro' as const, title: 'Jemputan', bodyText: 'Tiada maklumat helaian.' }
  ];
  const totalSlides = slides.length;
  const currentSlideData = slides[currentSlide] || slides[0];

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
    // Padamkan sepenuhnya lapisan pintu dari aliran klik selepas animasi buka selesai
    setTimeout(() => {
      setDoorHidden(true);
    }, 700);
  };

  const handleCloseCard = () => {
    setDoorHidden(false);
    setTimeout(() => {
      setIsOpen(false);
      setCurrentSlide(0);
    }, 50);
  };

  const nextSlide = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      handleCloseCard();
    }
  };

  const prevSlide = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  // Navigasi Leretan Jari Skrin Sentuh (Touch Swipe)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isOpen || touchStartY.current === null) return;
    const diff = touchStartY.current - e.changedTouches[0].clientY;

    if (diff > 45) {
      nextSlide(); // Leret ke atas -> Slaid seterusnya
    } else if (diff < -45) {
      prevSlide(); // Leret ke bawah -> Slaid sebelumnya
    }
    touchStartY.current = null;
  };

  return (
    <div 
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative w-full max-w-[390px] h-[760px] rounded-[36px] overflow-hidden shadow-2xl border-4 border-slate-700 bg-slate-950 flex flex-col justify-between items-center select-none"
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

      {/* 3. BAR ATAS: INDIKATOR CERITA (STORY PROGRESS BARS) & BUTANG MUZIK */}
      {isOpen && (
        <div className="w-full px-5 pt-5 pb-2 z-30 flex items-center justify-between gap-3">
          {/* Progress Bars */}
          <div className="flex-1 flex gap-1.5">
            {slides.map((_, i) => (
              <div 
                key={i} 
                onClick={() => setCurrentSlide(i)}
                className="h-1.5 flex-1 rounded-full bg-white/30 overflow-hidden cursor-pointer backdrop-blur-sm"
              >
                <div 
                  className={`h-full transition-all duration-300 ${
                    i <= currentSlide ? 'bg-amber-400 w-full' : 'w-0'
                  }`} 
                />
              </div>
            ))}
          </div>

          {/* Butang Muzik */}
          <button
            onClick={toggleMusic}
            type="button"
            className="w-8 h-8 rounded-full flex items-center justify-center text-white border border-amber-300/60 shadow-lg shrink-0"
            style={{ backgroundColor: data.theme?.primaryColor || '#3d5343' }}
          >
            <i className={`fa-solid text-xs ${isPlaying ? 'fa-compact-disc fa-spin' : 'fa-volume-xmark'}`} />
          </button>
        </div>
      )}

      {/* ================= 4. KANDUNGAN UTAMA HELAIAN (SLIDE ACTIVE) ================= */}
      {isOpen && (
        <div className="w-full flex-1 px-4 py-2 flex flex-col justify-center items-center z-20">
          <div 
            key={currentSlide}
            className="w-full min-h-[500px] max-h-[540px] rounded-2xl p-6 text-center shadow-2xl border flex flex-col justify-between items-center bg-white/95 animate-fadeIn"
            style={{
              borderColor: `${data.theme?.goldColor || '#b59049'}60`,
              color: '#2c332e'
            }}
          >
            {/* Header Helaian */}
            <div className="w-full text-center">
              <span className="text-[11px] uppercase font-bold tracking-[3px] block" style={{ color: data.theme?.goldColor || '#b59049', fontFamily: 'Cinzel, serif' }}>
                {currentSlideData.title || 'Jemputan'}
              </span>
              <div className="w-8 h-0.5 mx-auto mt-1 rounded-full" style={{ backgroundColor: data.theme?.goldColor || '#b59049' }} />
            </div>

            {/* Kandungan Mengikut Jenis Slaid */}
            <div className="my-auto w-full flex flex-col items-center justify-center py-2">
              {currentSlideData.type === 'intro' && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-600 leading-relaxed max-w-[280px] mx-auto">
                    {currentSlideData.bodyText}
                  </p>
                  {currentSlideData.imageUrl && (
                    <div className="relative w-28 h-32 mx-auto rounded-full border-2 p-1 overflow-hidden shadow-inner my-2" style={{ borderColor: data.theme?.goldColor || '#b59049' }}>
                      <img src={currentSlideData.imageUrl} alt="Visual" className="w-full h-full object-cover rounded-full" />
                    </div>
                  )}
                  <h2 className="text-lg font-bold" style={{ color: data.theme?.primaryColor || '#3d5343', fontFamily: 'Playfair Display, serif' }}>
                    {currentSlideData.subtitle}
                  </h2>
                </div>
              )}

              {currentSlideData.type === 'tentative' && (
                <div className="w-full space-y-2.5 max-w-[280px]">
                  {currentSlideData.timeline?.map((item, tIdx) => (
                    <div key={tIdx} className="flex justify-between items-center border-b border-dashed border-amber-900/20 pb-1.5 text-xs">
                      <span className="font-bold text-amber-800 shrink-0">{item.time}</span>
                      <span className="text-slate-700 text-right">{item.activity}</span>
                    </div>
                  ))}
                </div>
              )}

              {currentSlideData.type === 'location' && currentSlideData.locationDetails && (
                <div className="space-y-3 max-w-[280px]">
                  <h3 className="text-base font-bold" style={{ color: data.theme?.primaryColor || '#3d5343' }}>
                    {currentSlideData.locationDetails.venueName}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                    {currentSlideData.locationDetails.address}
                  </p>
                  <div className="flex justify-center gap-2.5 pt-2">
                    <a href={currentSlideData.locationDetails.gmapsUrl} target="_blank" rel="noreferrer" className="px-3.5 py-1.5 rounded-full text-[10px] text-white bg-slate-800 hover:bg-slate-700 flex items-center gap-1.5 shadow">
                      <i className="fa-solid fa-map-pin text-red-400" /> Google Maps
                    </a>
                    <a href={currentSlideData.locationDetails.wazeUrl} target="_blank" rel="noreferrer" className="px-3.5 py-1.5 rounded-full text-[10px] text-white bg-cyan-700 hover:bg-cyan-600 flex items-center gap-1.5 shadow">
                      <i className="fa-brands fa-waze" /> Waze
                    </a>
                  </div>
                </div>
              )}

              {currentSlideData.type === 'thank_you' && (
                <div className="space-y-3">
                  <div className="text-2xl text-amber-600">❧ ❦ ☙</div>
                  <p className="text-xs leading-relaxed text-slate-700 max-w-[280px] mx-auto">
                    {currentSlideData.bodyText || 'Sekalung penghargaan dan terima kasih atas kehadiran dan doa tulus ikhlas anda.'}
                  </p>
                  <div className="text-amber-600 text-lg">𖥸</div>
                </div>
              )}
            </div>

            {/* BUTANG NAVIGASI BAWAH (SENTIASA BOLEH DITEKAN) */}
            <div className="w-full flex justify-between items-center pt-3 border-t border-slate-200">
              {currentSlide > 0 ? (
                <button 
                  onClick={prevSlide} 
                  type="button"
                  className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 text-xs font-semibold flex items-center gap-1 bg-slate-100 active:scale-95 transition-all"
                >
                  <i className="fa-solid fa-arrow-left text-[10px]" /> KEMBALI
                </button>
              ) : <div />}

              {currentSlide < totalSlides - 1 ? (
                <button 
                  onClick={nextSlide} 
                  type="button"
                  className="ml-auto px-4 py-1.5 rounded-full bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                  style={{ fontFamily: 'Cinzel, serif' }}
                >
                  SELAK <i className="fa-solid fa-arrow-right text-[10px]" />
                </button>
              ) : (
                <button 
                  onClick={handleCloseCard} 
                  type="button"
                  className="ml-auto px-4 py-1.5 rounded-full bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow active:scale-95"
                >
                  <i className="fa-solid fa-lock text-[10px]" /> TUTUP KAD
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= 5. COVER / SLIDING DOOR (DIBUANG BILA DIBUKA) ================= */}
      {!doorHidden && (
        <div 
          className={`absolute inset-0 z-40 transition-opacity duration-700 ${
            isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
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
              onClick={handleOpenCard}
              className="absolute left-0 -translate-x-1/2 cursor-pointer transition-transform hover:scale-105 active:scale-95"
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
              onClick={handleOpenCard}
              type="button"
              className="mt-6 px-6 py-2.5 rounded-full border border-amber-300 bg-black/50 backdrop-blur text-xs tracking-widest uppercase hover:bg-amber-500 hover:text-white transition-all flex items-center gap-2 cursor-pointer shadow-lg active:scale-95"
              style={{ fontFamily: 'Cinzel, serif' }}
            >
              <i className="fa-regular fa-envelope-open" /> BUKA JEMPUTAN
            </button>
          </div>
        </div>
      )}
    </div>
  );
}