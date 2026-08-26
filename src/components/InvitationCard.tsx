'use client';

import React, { useState, useRef, useEffect } from 'react';
import { CardData } from '@/types/invitation';

interface Props {
  data: CardData;
  isPaid?: boolean;
  guestName?: string;
}

// Komponen Typing Effect Khas (Tanpa Simbol |)
function TypewriterText({ 
  text = '', 
  speed = 30, 
  delay = 100, 
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
  const isTransitioning = useRef<boolean>(false);

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
    if (isTransitioning.current) return;
    if (currentSlide < totalSlides - 1) {
      isTransitioning.current = true;
      setCurrentSlide(prev => prev + 1);
      setTimeout(() => { isTransitioning.current = false; }, 700);
    }
  };

  const prevSlide = () => {
    if (isTransitioning.current) return;
    if (currentSlide > 0) {
      isTransitioning.current = true;
      setCurrentSlide(prev => prev - 1);
      setTimeout(() => { isTransitioning.current = false; }, 700);
    }
  };

  // Navigasi Roda Tetikus PC (Mouse Wheel) Menegak
  const handleWheel = (e: React.WheelEvent) => {
    if (!isOpen || isTransitioning.current) return;
    
    if (e.deltaY > 35) {
      nextSlide();
    } else if (e.deltaY < -35) {
      prevSlide();
    }
  };

  // Navigasi Sentuhan Telefon (Touch Gestures)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isOpen || touchStartY.current === null || isTransitioning.current) return;
    
    const diffY = touchStartY.current - e.changedTouches[0].clientY;

    if (diffY > 40) {
      nextSlide(); // Leret ke atas -> Slaid seterusnya
    } else if (diffY < -40) {
      prevSlide(); // Leret ke bawah -> Slaid sebelumnya
    }
    touchStartY.current = null;
  };

  return (
    <div 
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative w-full max-w-[420px] h-[92vh] max-h-[820px] min-h-[660px] rounded-[36px] overflow-hidden shadow-2xl border-[5px] border-amber-500/40 outline outline-4 outline-amber-700/20 bg-slate-950 flex flex-col justify-between items-center select-none"
      style={{
        backgroundImage: `url(${data.theme?.bgPatternUrl || ''})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* ================= 1. BINGKAI DEKORATIF MEWAH (ROYAL FRAME) ================= */}
      <div className="absolute inset-2.5 rounded-[28px] border border-amber-300/30 pointer-events-none z-30 flex flex-col justify-between p-3">
        <div className="flex justify-between items-center text-[10px] text-amber-300/60">
          <span>❖</span>
          <span className="tracking-[3px] uppercase text-[8px]">E-Invitation</span>
          <span>❖</span>
        </div>
        <div className="flex justify-between items-center text-[10px] text-amber-300/60">
          <span>❖</span>
          <span>❧ ❦ ☙</span>
          <span>❖</span>
        </div>
      </div>

      {/* 2. LAPISAN WATERMARK JIKA BELUM BAYAR */}
      {!isPaid && (
        <div className="absolute inset-0 z-[100] pointer-events-none flex flex-col items-center justify-around opacity-25">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="text-3xl font-black tracking-widest text-red-500 uppercase -rotate-12 select-none">
              PREVIEW ONLY • UNPAID
            </div>
          ))}
        </div>
      )}

      {/* 3. AUDIO ENGINE */}
      {data.cover?.audioUrl && (
        <audio ref={audioRef} loop src={data.cover.audioUrl} />
      )}

      {/* 4. BUTANG MUZIK TERAPUNG */}
      {isOpen && (
        <button
          onClick={toggleMusic}
          type="button"
          className="absolute top-5 right-5 z-40 w-9 h-9 rounded-full flex items-center justify-center text-white border border-amber-300 bg-slate-900/80 backdrop-blur shadow-xl transition-transform active:scale-90"
        >
          <i className={`fa-solid text-xs ${isPlaying ? 'fa-compact-disc fa-spin text-amber-400' : 'fa-volume-xmark text-slate-400'}`} />
        </button>
      )}

      {/* 5. INDIKATOR TITIK MENEGAK */}
      {isOpen && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-2 bg-black/50 backdrop-blur-md py-3 px-1.5 rounded-full border border-amber-400/20 shadow-xl">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                if (!isTransitioning.current) setCurrentSlide(i);
              }}
              className={`w-2 rounded-full transition-all duration-700 ease-out ${
                currentSlide === i ? 'bg-amber-400 h-6' : 'bg-white/30 h-2 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      )}

      {/* ================= 6. MUKA DEPAN (SLIDE NAIK SECARA LEMBUT) ================= */}
      <div 
        className={`absolute inset-0 z-50 flex flex-col items-center justify-center p-6 text-white transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? '-translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100 pointer-events-auto'
        }`}
        style={{
          backgroundColor: data.theme?.primaryColor || '#1e293b'
        }}
      >
        <div className="text-amber-300 text-xl mb-3 animate-pulse">❧ ❦ ☙</div>
        
        <p className="tracking-[4px] uppercase text-xs text-slate-200 text-center" style={{ fontFamily: 'Cinzel, serif' }}>
          {data.cover?.tagline}
        </p>

        <h1 className="text-4xl text-white my-4 text-center font-normal drop-shadow-md" style={{ fontFamily: 'Great Vibes, cursive' }}>
          {data.cover?.mainTitle}
        </h1>

        <p className="text-xs tracking-widest text-amber-200 text-center" style={{ fontFamily: 'Cinzel, serif' }}>
          {data.cover?.dateText}
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

      {/* ================= 7. ENJIN HELAIAN MENEGAK ULTRA-LANCAR ================= */}
      <div className="relative w-full h-full overflow-hidden">
        {slides.map((slide, idx) => {
          const offset = idx - currentSlide;
          const isCurrent = offset === 0;

          return (
            <div
              key={slide.id || idx}
              className="absolute inset-0 w-full h-full p-6 flex flex-col justify-center items-center transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{
                transform: `translateY(${offset * 100}%) scale(${isCurrent ? 1 : 0.94})`,
                opacity: isCurrent ? 1 : 0,
                pointerEvents: isCurrent ? 'auto' : 'none',
                zIndex: isCurrent ? 20 : 10
              }}
            >
              {/* Kotak Kandungan Helaian */}
              <div 
                className="w-full h-[82%] max-h-[580px] rounded-3xl p-6 text-center shadow-2xl border flex flex-col justify-between items-center bg-white/95 backdrop-blur-sm relative"
                style={{
                  borderColor: `${data.theme?.goldColor || '#b59049'}60`,
                  color: '#2c332e'
                }}
              >
                {/* Bingkai Dalaman Halus */}
                <div className="absolute inset-2 border border-amber-900/10 rounded-2xl pointer-events-none" />

                {/* Bahagian Atas Kad */}
                <div className="w-full z-10">
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                    <span>Helaian {idx + 1} / {totalSlides}</span>
                    <span className="text-amber-700">❧ ❦ ☙</span>
                  </div>
                  <h2 className="text-sm font-bold uppercase tracking-[2px]" style={{ color: data.theme?.goldColor || '#b59049', fontFamily: 'Cinzel, serif' }}>
                    {slide.title || 'Jemputan'}
                  </h2>
                  <div className="w-10 h-0.5 mx-auto mt-1 rounded-full" style={{ backgroundColor: data.theme?.goldColor || '#b59049' }} />
                </div>

                {/* Bahagian Kandungan Slaid Dengan Typing Effect */}
                <div className="my-auto w-full py-2 flex flex-col items-center justify-center z-10">
                  
                  {/* Slaid: INTRO */}
                  {slide.type === 'intro' && (
                    <div className="space-y-3">
                      <p className="text-xs text-slate-600 leading-relaxed max-w-[280px] mx-auto min-h-[48px]">
                        {isCurrent ? (
                          <TypewriterText text={slide.bodyText || ''} speed={25} delay={150} />
                        ) : (
                          slide.bodyText
                        )}
                      </p>

                      {slide.imageUrl && (
                        <div className="w-28 h-32 mx-auto rounded-full border-2 p-1 overflow-hidden shadow-inner my-2" style={{ borderColor: data.theme?.goldColor || '#b59049' }}>
                          <img src={slide.imageUrl} alt="Visual" className="w-full h-full object-cover rounded-full" />
                        </div>
                      )}

                      <h3 className="text-lg font-bold" style={{ color: data.theme?.primaryColor || '#3d5343', fontFamily: 'Playfair Display, serif' }}>
                        {isCurrent ? (
                          <TypewriterText text={slide.subtitle || ''} speed={35} delay={600} />
                        ) : (
                          slide.subtitle
                        )}
                      </h3>
                    </div>
                  )}

                  {/* Slaid: TENTATIVE */}
                  {slide.type === 'tentative' && (
                    <div className="w-full space-y-3 max-w-[280px]">
                      {slide.timeline?.map((item, tIdx) => (
                        <div key={tIdx} className="flex justify-between items-center border-b border-dashed border-amber-900/20 pb-2 text-xs">
                          <span className="font-bold text-amber-800 shrink-0">{item.time}</span>
                          <span className="text-slate-700 text-right">
                            {isCurrent ? (
                              <TypewriterText text={item.activity} speed={25} delay={tIdx * 200 + 100} />
                            ) : (
                              item.activity
                            )}
                          </span>
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
                      <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line min-h-[40px]">
                        {isCurrent ? (
                          <TypewriterText text={slide.locationDetails.address} speed={20} delay={150} />
                        ) : (
                          slide.locationDetails.address
                        )}
                      </p>
                      <div className="flex justify-center gap-3 pt-2">
                        <a href={slide.locationDetails.gmapsUrl} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-full text-[11px] font-semibold text-white bg-slate-800 hover:bg-slate-700 flex items-center gap-1.5 shadow active:scale-95 transition-transform">
                          <i className="fa-solid fa-map-pin text-red-400" /> Google Maps
                        </a>
                        <a href={slide.locationDetails.wazeUrl} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-full text-[11px] font-semibold text-white bg-cyan-700 hover:bg-cyan-600 flex items-center gap-1.5 shadow active:scale-95 transition-transform">
                          <i className="fa-brands fa-waze" /> Waze
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Slaid: THANK YOU */}
                  {slide.type === 'thank_you' && (
                    <div className="space-y-3">
                      <div className="text-3xl text-amber-600">❧ ❦ ☙</div>
                      <p className="text-xs leading-relaxed text-slate-700 max-w-[280px] mx-auto min-h-[40px]">
                        {isCurrent ? (
                          <TypewriterText text={slide.bodyText || 'Sekalung penghargaan dan terima kasih atas kehadiran dan doa tulus ikhlas anda.'} speed={25} delay={150} />
                        ) : (
                          slide.bodyText
                        )}
                      </p>
                      <div className="text-amber-600 text-xl">𖥸</div>
                    </div>
                  )}
                </div>

                {/* Bahagian Navigasi Bawah Kad */}
                <div className="w-full flex flex-col items-center gap-1.5 pt-2 border-t border-slate-200 z-10">
                  {idx < totalSlides - 1 ? (
                    <button 
                      onClick={nextSlide} 
                      type="button"
                      className="px-6 py-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs tracking-wider flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                      style={{ fontFamily: 'Cinzel, serif' }}
                    >
                      SELAK KE BAWAH <i className="fa-solid fa-chevron-down text-xs animate-bounce" />
                    </button>
                  ) : (
                    <button 
                      onClick={handleCloseCard} 
                      type="button"
                      className="px-6 py-2 rounded-full bg-slate-900 text-white font-semibold text-xs flex items-center gap-1.5 shadow active:scale-95 cursor-pointer"
                    >
                      <i className="fa-solid fa-lock text-xs" /> TUTUP JEMPUTAN
                    </button>
                  )}

                  {idx > 0 && (
                    <button 
                      onClick={prevSlide} 
                      type="button"
                      className="text-[10px] text-slate-500 hover:text-slate-800 font-semibold uppercase tracking-wider flex items-center gap-1 py-0.5"
                    >
                      <i className="fa-solid fa-chevron-up text-[8px]" /> Helaian Atas
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