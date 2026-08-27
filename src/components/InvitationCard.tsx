'use client';

import React, { useState, useRef, useEffect } from 'react';
import { CardData } from '@/types/invitation';

interface Props {
  data: CardData;
  showWatermark?: boolean;
  maxSlides?: number;
  guestName?: string;
}

// Komponen Typing Effect
function TypewriterText({ 
  text = '', 
  speed = 45, 
  delay = 200, 
  className = '', 
  style 
}: { 
  text?: string; 
  speed?: number; 
  delay?: number; 
  className?: string; 
  style?: React.CSSProperties 
}) {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    setDisplayedText('');
    let index = 0;
    let intervalId: NodeJS.Timeout;

    const timeoutId = setTimeout(() => {
      intervalId = setInterval(() => {
        if (index < text.length) {
          setDisplayedText(text.slice(0, index + 1));
          index++;
        } else {
          clearInterval(intervalId);
        }
      }, speed);
    }, delay);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [text, speed, delay]);

  return <span className={className} style={style}>{displayedText}</span>;
}

export function InvitationCard({ 
  data, 
  showWatermark = false, 
  maxSlides, 
  guestName = "Dato' / Datin / Tuan / Puan" 
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isTransitioning = useRef<boolean>(false);

  const rawSlides = data?.slides && data.slides.length > 0 ? data.slides : [
    { id: '1', type: 'intro', title: 'Jemputan', bodyText: 'Tiada maklumat helaian.' }
  ];

  const slides = maxSlides && maxSlides > 0 ? rawSlides.slice(0, maxSlides) : rawSlides;
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
    if (isTransitioning.current) return;
    if (currentSlide < totalSlides - 1) {
      isTransitioning.current = true;
      setCurrentSlide(prev => prev + 1);
      setTimeout(() => { isTransitioning.current = false; }, 1100);
    }
  };

  const prevSlide = () => {
    if (isTransitioning.current) return;
    if (currentSlide > 0) {
      isTransitioning.current = true;
      setCurrentSlide(prev => prev - 1);
      setTimeout(() => { isTransitioning.current = false; }, 1100);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!isOpen || isTransitioning.current) return;
    if (e.deltaY > 30) {
      nextSlide();
    } else if (e.deltaY < -30) {
      prevSlide();
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isOpen || touchStartY.current === null || isTransitioning.current) return;
    const diffY = touchStartY.current - e.changedTouches[0].clientY;

    if (diffY > 40) {
      nextSlide();
    } else if (diffY < -40) {
      prevSlide();
    }
    touchStartY.current = null;
  };

  // Penentuan Latar Muka Depan (Warna vs Gambar)
  const isCoverImage = data?.theme?.coverBgType === 'image' && data?.theme?.coverBgUrl;
  const coverBgColor = data?.theme?.coverBgColor || data?.theme?.primaryColor || '#2d4a3e';

  return (
    <div 
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative w-full max-w-[430px] h-[100dvh] sm:h-[840px] overflow-hidden shadow-2xl sm:rounded-[36px] bg-slate-950 flex flex-col justify-between items-center select-none"
      style={{
        backgroundImage: data?.theme?.bgPatternUrl ? `url(${data.theme.bgPatternUrl})` : undefined,
        backgroundColor: '#0f172a',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* 1. WATERMARK UNTUK PREVIEW */}
      {showWatermark && (
        <div className="absolute inset-0 z-[100] pointer-events-none flex flex-col items-center justify-around opacity-25">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="text-3xl font-black tracking-widest text-red-500 uppercase -rotate-12 select-none">
              PREVIEW ONLY • UNPAID
            </div>
          ))}
        </div>
      )}

      {/* 2. AUDIO ENGINE */}
      {data?.cover?.audioUrl && (
        <audio ref={audioRef} loop src={data.cover.audioUrl} />
      )}

      {/* 3. BUTANG MUZIK */}
      <button
        onClick={toggleMusic}
        type="button"
        className="absolute top-6 right-6 z-40 w-10 h-10 rounded-full flex items-center justify-center text-amber-200 border-2 border-amber-400/80 bg-slate-900/90 backdrop-blur shadow-2xl transition-transform active:scale-90"
      >
        <i className={`fa-solid text-sm ${isPlaying ? 'fa-compact-disc fa-spin text-amber-300' : 'fa-volume-xmark text-slate-400'}`} />
      </button>

      {/* ================= 4. MUKA DEPAN ================= */}
      <div 
        className={`absolute inset-0 z-50 flex flex-col items-center justify-center p-6 text-white transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? '-translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100 pointer-events-auto'
        }`}
        style={{
          backgroundColor: isCoverImage ? undefined : coverBgColor,
          backgroundImage: isCoverImage ? `url(${data?.theme?.coverBgUrl})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Lapisan Tint Gelap Jika Cover Menggunakan Gambar */}
        {isCoverImage && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] pointer-events-none" />
        )}

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="text-amber-300 text-xl mb-3 animate-pulse">❧ ❦ ☙</div>
          
          <p className="tracking-[4px] uppercase text-xs text-slate-200 text-center" style={{ fontFamily: 'Cinzel, serif' }}>
            {data?.cover?.tagline}
          </p>

          <h1 className="text-4xl text-white my-4 text-center font-normal drop-shadow-md" style={{ fontFamily: 'Great Vibes, cursive' }}>
            {data?.cover?.mainTitle}
          </h1>

          <p className="text-xs tracking-widest text-amber-200 text-center" style={{ fontFamily: 'Cinzel, serif' }}>
            {data?.cover?.dateText}
          </p>

          <div className="mt-8 px-6 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-amber-300/30 text-center shadow-lg">
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
      </div>

      {/* ================= 5. HELAIAN KAD ================= */}
      <div className="relative w-full h-full overflow-hidden flex flex-col justify-center items-center">
        {slides.map((slide, idx) => {
          const offset = idx - currentSlide;
          const isCurrent = offset === 0;

          return (
            <div
              key={slide.id || idx}
              className="absolute inset-0 w-full h-full p-6 flex flex-col justify-center items-center transition-all duration-[1100ms] ease-[cubic-bezier(0.19,1,0.22,1)]"
              style={{
                transform: `translateY(${offset * 100}%) scale(${isCurrent ? 1 : 0.96})`,
                opacity: isCurrent ? 1 : 0,
                pointerEvents: isCurrent ? 'auto' : 'none',
                zIndex: isCurrent ? 20 : 10
              }}
            >
              <div 
                className="w-full max-w-[345px] h-[78%] max-h-[540px] rounded-[28px] p-6 text-center shadow-2xl border border-amber-200/40 flex flex-col justify-between items-center bg-white/95 backdrop-blur-sm relative"
                style={{ color: '#2c332e' }}
              >
                <div className="w-full flex justify-between items-center text-amber-700/60 text-xs px-1">
                  <span>❧</span>
                  <span className="text-[11px] font-bold uppercase tracking-[2px]" style={{ color: data?.theme?.goldColor || '#b59049', fontFamily: 'Cinzel, serif' }}>
                    {slide.title || 'JEMPUTAN MAJLIS'}
                  </span>
                  <span>☙</span>
                </div>

                <div className="my-auto w-full py-1 flex flex-col items-center justify-center">
                  {/* INTRO */}
                  {slide.type === 'intro' && (
                    <div className="space-y-3 w-full">
                      <p className="text-sm text-slate-800 font-arabic leading-loose">
                        بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                      </p>
                      <p className="text-xs text-slate-600 leading-relaxed max-w-[270px] mx-auto min-h-[46px]">
                        {isCurrent ? <TypewriterText text={slide.bodyText || ''} speed={50} delay={250} /> : slide.bodyText}
                      </p>
                      {slide.imageUrl && (
                        <div className="relative my-2 flex flex-col items-center">
                          <div className="w-32 h-40 rounded-full border-2 p-1 overflow-hidden shadow-md bg-white" style={{ borderColor: data?.theme?.goldColor || '#c49a45' }}>
                            <img src={slide.imageUrl} alt="Visual" className="w-full h-full object-cover rounded-full" />
                          </div>
                        </div>
                      )}
                      <h3 className="text-lg font-bold" style={{ color: data?.theme?.primaryColor || '#3d5343', fontFamily: 'Playfair Display, serif' }}>
                        {isCurrent ? <TypewriterText text={slide.subtitle || ''} speed={60} delay={800} /> : slide.subtitle}
                      </h3>
                    </div>
                  )}

                  {/* LOCATION */}
                  {slide.type === 'location' && slide.locationDetails && (
                    <div className="space-y-3.5 max-w-[280px] w-full flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-700 text-lg shadow-sm">
                        <i className="fa-solid fa-map-location-dot" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-base font-bold" style={{ color: data?.theme?.primaryColor || '#3d5343' }}>
                          {slide.locationDetails.venueName}
                        </h3>
                        <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line min-h-[44px]">
                          {isCurrent ? <TypewriterText text={slide.locationDetails.address} speed={40} delay={250} /> : slide.locationDetails.address}
                        </p>
                      </div>
                      <div className="flex justify-center gap-2.5 pt-2 w-full">
                        {slide.locationDetails.gmapsUrl && (
                          <a href={slide.locationDetails.gmapsUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold text-white bg-slate-900 flex items-center justify-center gap-1.5 shadow active:scale-95">
                            <i className="fa-solid fa-location-arrow text-red-400 text-xs" /> Maps
                          </a>
                        )}
                        {slide.locationDetails.wazeUrl && (
                          <a href={slide.locationDetails.wazeUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold text-white bg-cyan-700 flex items-center justify-center gap-1.5 shadow active:scale-95">
                            <i className="fa-brands fa-waze text-white text-xs" /> Waze
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TENTATIVE */}
                  {slide.type === 'tentative' && (
                    <div className="w-full space-y-3 max-w-[270px]">
                      {slide.timeline?.map((item, tIdx) => (
                        <div key={tIdx} className="flex justify-between items-center border-b border-dashed border-amber-900/20 pb-2 text-xs">
                          <span className="font-bold text-amber-800 shrink-0">{item.time}</span>
                          <span className="text-slate-700 text-right">
                            {isCurrent ? <TypewriterText text={item.activity} speed={45} delay={tIdx * 300 + 150} /> : item.activity}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* IMAGE_QR */}
                  {slide.type === 'image_qr' && (
                    <div className="space-y-3 max-w-[270px] flex flex-col items-center">
                      {slide.imageUrl ? (
                        <div className="w-40 h-40 p-2 rounded-2xl bg-white border-2 border-amber-400/60 shadow-md flex items-center justify-center">
                          <img src={slide.imageUrl} alt="QR" className="w-full h-full object-contain rounded-xl" />
                        </div>
                      ) : (
                        <div className="w-36 h-36 rounded-2xl bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-xs">
                          <i className="fa-solid fa-qrcode text-3xl" />
                        </div>
                      )}
                      <h4 className="text-sm font-bold text-slate-800" style={{ color: data?.theme?.primaryColor || '#3d5343' }}>
                        {slide.subtitle || 'Kod QR Hadiah'}
                      </h4>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        {slide.bodyText || 'Imbas kod QR di atas untuk ingatan tulus ikhlas anda.'}
                      </p>
                    </div>
                  )}

                  {/* GUESTBOOK */}
                  {slide.type === 'guestbook' && (
                    <div className="space-y-3 max-w-[270px] w-full text-center">
                      <div className="w-10 h-10 mx-auto rounded-full bg-amber-500/10 flex items-center justify-center text-amber-700">
                        <i className="fa-solid fa-book-open-reader" />
                      </div>
                      <h4 className="text-sm font-bold" style={{ color: data?.theme?.primaryColor || '#3d5343' }}>
                        {slide.subtitle || 'Buku Ucapan & Doa'}
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {slide.bodyText || 'Titipkan ucapan dan doa selamat buat kami sekeluarga.'}
                      </p>
                    </div>
                  )}

                  {/* THANK_YOU */}
                  {slide.type === 'thank_you' && (
                    <div className="space-y-3">
                      <div className="text-3xl text-amber-600">❧ ❦ ☙</div>
                      <p className="text-xs leading-relaxed text-slate-700 max-w-[270px] mx-auto min-h-[44px]">
                        {isCurrent ? <TypewriterText text={slide.bodyText || 'Sekalung penghargaan dan terima kasih atas kehadiran anda.'} speed={50} delay={250} /> : slide.bodyText}
                      </p>
                      <div className="text-amber-600 text-xl">𖥸</div>
                    </div>
                  )}
                </div>

                {/* Butang Navigasi */}
                <div className="w-full flex flex-col items-center gap-1">
                  {idx < totalSlides - 1 ? (
                    <button 
                      onClick={nextSlide} 
                      type="button"
                      className="text-amber-800/80 hover:text-amber-900 text-[10px] tracking-[3px] uppercase font-bold flex flex-col items-center gap-1 transition-transform active:scale-95 cursor-pointer"
                      style={{ fontFamily: 'Cinzel, serif' }}
                    >
                      <i className="fa-solid fa-chevron-down text-[10px] animate-bounce" />
                      SELAK
                    </button>
                  ) : (
                    <button 
                      onClick={handleCloseCard} 
                      type="button"
                      className="px-5 py-1.5 rounded-full bg-slate-900 text-white font-semibold text-xs flex items-center gap-1.5 shadow active:scale-95 cursor-pointer"
                    >
                      <i className="fa-solid fa-lock text-[10px]" /> TUTUP
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

export default InvitationCard;