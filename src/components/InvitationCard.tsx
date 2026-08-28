'use client';

import React, { useState, useRef, useEffect } from 'react';
import { CardData } from '@/types/invitation';

interface Props {
  data: CardData;
  showWatermark?: boolean;
  maxSlides?: number;
  guestName?: string;
  activeSlideIndex?: number | 'cover';
}

function hexToRgba(hex: string = '#ffffff', opacity: number = 90): string {
  const cleanHex = hex.replace('#', '');
  let r = 255, g = 255, b = 255;

  if (cleanHex.length === 6) {
    r = parseInt(cleanHex.substring(0, 2), 16);
    g = parseInt(cleanHex.substring(2, 4), 16);
    b = parseInt(cleanHex.substring(4, 6), 16);
  } else if (cleanHex.length === 3) {
    r = parseInt(cleanHex[0] + cleanHex[0], 16);
    g = parseInt(cleanHex[1] + cleanHex[1], 16);
    b = parseInt(cleanHex[2] + cleanHex[2], 16);
  }

  const alpha = Math.max(0, Math.min(100, opacity)) / 100;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function TypewriterText({ 
  text = '', 
  speed = 40, 
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
  guestName = "Honored Guest / Family & Friends",
  activeSlideIndex
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isTransitioning = useRef<boolean>(false);

  const rawSlides = data?.slides && data.slides.length > 0 ? data.slides : [
    { id: '1', type: 'intro', title: 'Invitation', bodyText: 'No slide details configured.' }
  ];

  const slides = maxSlides && maxSlides > 0 ? rawSlides.slice(0, maxSlides) : rawSlides;
  const totalSlides = slides.length;

  // Auto-reload and synchronize music on select
  useEffect(() => {
    if (audioRef.current && data?.cover?.audioUrl) {
      const audio = audioRef.current;
      audio.pause();
      audio.currentTime = 0;
      audio.src = data.cover.audioUrl;
      audio.load();
      if (isPlaying) {
        audio.play().catch(() => {});
      }
    }
  }, [data?.cover?.audioUrl, isPlaying]);

  // Auto-flip to active slide / cover during builder editing
  useEffect(() => {
    if (activeSlideIndex === 'cover') {
      setIsOpen(false);
      setCurrentSlide(0);
    } else if (typeof activeSlideIndex === 'number' && activeSlideIndex >= 0) {
      setIsOpen(true);
      const targetIndex = Math.min(activeSlideIndex, totalSlides - 1);
      setCurrentSlide(targetIndex);
    }
  }, [activeSlideIndex, totalSlides]);

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
      setTimeout(() => { isTransitioning.current = false; }, 850);
    }
  };

  const prevSlide = () => {
    if (isTransitioning.current) return;
    if (currentSlide > 0) {
      isTransitioning.current = true;
      setCurrentSlide(prev => prev - 1);
      setTimeout(() => { isTransitioning.current = false; }, 850);
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

  // 1. Cover Background Resolution
  const isCoverImage = data?.theme?.coverBgType === 'image' && data?.theme?.coverBgUrl;
  const coverBgColor = data?.theme?.coverBgColor || data?.theme?.primaryColor || '#1e293b';

  // 2. Inner Slide Wallpaper Resolution
  const slideWallpaperUrl = data?.theme?.slideBgUrl || data?.theme?.bgPatternUrl;

  // 3. Card Box Color & 0-100% Opacity
  const boxBaseColor = data?.theme?.cardBoxColor || '#ffffff';
  const rawOpacity = typeof data?.theme?.cardOpacity === 'number' ? data.theme.cardOpacity : 90;
  const opacityVal = Math.min(100, Math.max(0, rawOpacity));
  const isCompletelyTransparent = opacityVal === 0;
  const cardBgStyle = isCompletelyTransparent ? 'transparent' : hexToRgba(boxBaseColor, opacityVal);

  // 4. Typography: Cover vs Slide Sizing & Fonts
  const coverHeadingFont = data?.theme?.coverHeadingFont || 'Cinzel, serif';
  const coverBodyFont = data?.theme?.coverBodyFont || 'Playfair Display, serif';
  const coverScale = (data?.theme?.coverFontSizeScale || 100) / 100;

  const slideHeadingFont = data?.theme?.slideHeadingFont || 'Cinzel, serif';
  const slideBodyFont = data?.theme?.slideBodyFont || 'Playfair Display, serif';
  const slideScale = (data?.theme?.slideFontSizeScale || 100) / 100;

  return (
    <div 
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative w-full max-w-[430px] h-[100dvh] sm:h-[840px] overflow-hidden shadow-2xl sm:rounded-[36px] bg-slate-950 flex flex-col justify-between items-center select-none"
      style={{
        backgroundImage: slideWallpaperUrl ? `url(${slideWallpaperUrl})` : undefined,
        backgroundColor: '#0f172a',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* 1. PREVIEW WATERMARK */}
      {showWatermark && (
        <div className="absolute inset-0 z-[100] pointer-events-none flex flex-col items-center justify-around opacity-25">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="text-3xl font-black tracking-widest text-red-500 uppercase -rotate-12 select-none">
              PREVIEW ONLY • UNPAID
            </div>
          ))}
        </div>
      )}

      {/* 2. AUDIO STREAMING ELEMENT */}
      {data?.cover?.audioUrl && (
        <audio 
          ref={audioRef} 
          loop 
          src={data.cover.audioUrl} 
        />
      )}

      {/* 3. MUSIC TOGGLE BUTTON */}
      <button
        onClick={toggleMusic}
        type="button"
        className="absolute top-6 right-6 z-40 w-10 h-10 rounded-full flex items-center justify-center text-amber-200 border-2 border-amber-400/80 bg-slate-900/90 backdrop-blur shadow-2xl transition-transform active:scale-90 cursor-pointer"
      >
        <i className={`fa-solid text-sm ${isPlaying ? 'fa-compact-disc fa-spin text-amber-300' : 'fa-volume-xmark text-slate-400'}`} />
      </button>

      {/* ================= 4. COVER SECTION ================= */}
      <div 
        className={`absolute inset-0 z-50 flex flex-col items-center justify-center p-6 text-white transition-transform duration-[1000ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? '-translate-y-full pointer-events-none' : 'translate-y-0 pointer-events-auto'
        }`}
        style={{
          backgroundColor: isCoverImage ? undefined : coverBgColor,
          backgroundImage: isCoverImage ? `url(${data?.theme?.coverBgUrl})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {isCoverImage && (
          <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px] pointer-events-none" />
        )}

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="text-amber-300 text-xl mb-3 animate-pulse">❧ ❦ ☙</div>
          
          <p 
            className="tracking-[4px] uppercase text-slate-200 text-center" 
            style={{ fontFamily: coverHeadingFont, fontSize: `${12 * coverScale}px` }}
          >
            {data?.cover?.tagline || 'The Wedding Celebration Of'}
          </p>

          <h1 
            className="text-white my-4 text-center font-normal drop-shadow-md" 
            style={{ fontFamily: 'Great Vibes, cursive', fontSize: `${44 * coverScale}px` }}
          >
            {data?.cover?.mainTitle || 'Emma & Liam'}
          </h1>

          <p 
            className="tracking-widest text-amber-200 text-center" 
            style={{ fontFamily: coverHeadingFont, fontSize: `${12 * coverScale}px` }}
          >
            {data?.cover?.dateText || 'SUNDAY, OCTOBER 18, 2026'}
          </p>

          <div className="mt-8 px-6 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-amber-300/30 text-center shadow-lg">
            <span className="text-[10px] tracking-wider uppercase block text-slate-300">Cordially Invited:</span>
            <span className="font-semibold" style={{ fontFamily: coverBodyFont, fontSize: `${14 * coverScale}px` }}>
              {guestName}
            </span>
          </div>

          <button
            onClick={handleOpenCard}
            type="button"
            className="mt-10 px-8 py-3.5 rounded-full border-2 border-amber-300 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs tracking-widest uppercase shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            style={{ fontFamily: coverHeadingFont }}
          >
            <i className="fa-regular fa-envelope-open text-sm" /> OPEN INVITATION
          </button>
        </div>
      </div>

      {/* ================= 5. SLIDES SECTION ================= */}
      <div className="relative w-full h-full overflow-hidden flex flex-col justify-center items-center">
        {slides.map((slide, idx) => {
          const offset = idx - currentSlide;
          const isCurrent = offset === 0;
          const isNearby = Math.abs(offset) <= 1;

          return (
            <div
              key={slide.id || idx}
              className="absolute inset-0 w-full h-full p-4 sm:p-5 flex flex-col justify-center items-center transition-transform duration-[850ms] ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform"
              style={{
                transform: `translate3d(0, ${offset * 100}%, 0)`,
                visibility: isNearby ? 'visible' : 'hidden',
                pointerEvents: isCurrent ? 'auto' : 'none',
                zIndex: isCurrent ? 20 : 10
              }}
            >
              <div 
                className={`w-full max-w-[375px] h-[84%] max-h-[600px] rounded-[32px] p-6 sm:p-7 text-center flex flex-col justify-between items-center relative transition-all duration-300 ${
                  isCompletelyTransparent 
                    ? 'border-transparent shadow-none bg-transparent' 
                    : 'shadow-2xl border border-white/50 backdrop-blur-md'
                }`}
                style={{ 
                  backgroundColor: cardBgStyle,
                  color: isCompletelyTransparent ? '#ffffff' : '#1e293b',
                  textShadow: isCompletelyTransparent ? '0 2px 8px rgba(0,0,0,0.85)' : undefined,
                  transform: 'translateZ(0)'
                }}
              >
                <div className="w-full flex justify-between items-center text-xs px-1" style={{ color: data?.theme?.goldColor || '#b59049' }}>
                  <span>❧</span>
                  <span 
                    className="font-bold uppercase tracking-[2.5px]" 
                    style={{ 
                      color: data?.theme?.goldColor || '#b59049', 
                      fontFamily: slideHeadingFont,
                      fontSize: `${12 * slideScale}px`
                    }}
                  >
                    {slide.title || 'SPECIAL INVITATION'}
                  </span>
                  <span>☙</span>
                </div>

                <div className="my-auto w-full py-1 flex flex-col items-center justify-center">
                  
                  {/* INTRO */}
                  {slide.type === 'intro' && (
                    <div className="space-y-3.5 w-full flex flex-col items-center">
                      <p 
                        className="leading-relaxed max-w-[310px] mx-auto min-h-[48px] font-normal"
                        style={{ 
                          fontFamily: slideBodyFont, 
                          fontSize: `${13.5 * slideScale}px`,
                          color: isCompletelyTransparent ? '#f8fafc' : '#334155'
                        }}
                      >
                        {isCurrent ? <TypewriterText text={slide.bodyText || ''} speed={40} delay={250} /> : slide.bodyText}
                      </p>

                      {slide.imageUrl && (
                        <div className="relative my-2 flex flex-col items-center">
                          <div 
                            className="w-36 h-44 rounded-full border-[2.5px] p-1 overflow-hidden shadow-lg bg-white/90" 
                            style={{ borderColor: data?.theme?.goldColor || '#c49a45' }}
                          >
                            <img src={slide.imageUrl} alt="Feature Visual" className="w-full h-full object-cover rounded-full" />
                          </div>
                        </div>
                      )}

                      <h3 
                        className="font-bold tracking-wide" 
                        style={{ 
                          color: isCompletelyTransparent ? '#fbbf24' : (data?.theme?.primaryColor || '#1e293b'), 
                          fontFamily: slideHeadingFont,
                          fontSize: `${18 * slideScale}px`
                        }}
                      >
                        {isCurrent ? <TypewriterText text={slide.subtitle || ''} speed={50} delay={700} /> : slide.subtitle}
                      </h3>
                    </div>
                  )}

                  {/* LOCATION */}
                  {slide.type === 'location' && slide.locationDetails && (
                    <div className="space-y-4 max-w-[310px] w-full flex flex-col items-center">
                      <div className="w-14 h-14 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-500 text-xl shadow-sm">
                        <i className="fa-solid fa-map-location-dot" />
                      </div>

                      <div className="space-y-1.5 text-center">
                        <h3 
                          className="font-bold" 
                          style={{ 
                            color: isCompletelyTransparent ? '#fbbf24' : (data?.theme?.primaryColor || '#1e293b'),
                            fontFamily: slideHeadingFont,
                            fontSize: `${17 * slideScale}px`
                          }}
                        >
                          {slide.locationDetails.venueName}
                        </h3>
                        <p 
                          className="leading-relaxed whitespace-pre-line min-h-[48px]"
                          style={{ 
                            fontFamily: slideBodyFont, 
                            fontSize: `${13 * slideScale}px`,
                            color: isCompletelyTransparent ? '#f8fafc' : '#334155'
                          }}
                        >
                          {isCurrent ? <TypewriterText text={slide.locationDetails.address} speed={35} delay={250} /> : slide.locationDetails.address}
                        </p>
                      </div>

                      <div className="flex justify-center gap-3 pt-2 w-full">
                        {slide.locationDetails.gmapsUrl && (
                          <a href={slide.locationDetails.gmapsUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold text-white bg-slate-900/90 hover:bg-slate-900 flex items-center justify-center gap-2 shadow-md active:scale-95 transition-transform border border-white/20">
                            <i className="fa-solid fa-location-arrow text-red-400 text-xs" /> Google Maps
                          </a>
                        )}
                        {slide.locationDetails.wazeUrl && (
                          <a href={slide.locationDetails.wazeUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold text-white bg-cyan-700/90 hover:bg-cyan-700 flex items-center justify-center gap-2 shadow-md active:scale-95 transition-transform border border-white/20">
                            <i className="fa-brands fa-waze text-white text-xs" /> Waze
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TENTATIVE */}
                  {slide.type === 'tentative' && (
                    <div className="w-full space-y-3.5 max-w-[300px]">
                      {slide.timeline?.map((item, tIdx) => (
                        <div key={tIdx} className="flex justify-between items-center border-b border-dashed border-amber-500/30 pb-2.5">
                          <span 
                            className="font-bold shrink-0 text-amber-400"
                            style={{ fontFamily: slideHeadingFont, fontSize: `${13 * slideScale}px` }}
                          >
                            {item.time}
                          </span>
                          <span 
                            className="text-right font-medium"
                            style={{ 
                              fontFamily: slideBodyFont, 
                              fontSize: `${13 * slideScale}px`,
                              color: isCompletelyTransparent ? '#f8fafc' : '#1e293b'
                            }}
                          >
                            {isCurrent ? <TypewriterText text={item.activity} speed={40} delay={tIdx * 250 + 150} /> : item.activity}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* IMAGE_QR */}
                  {slide.type === 'image_qr' && (
                    <div className="space-y-3.5 max-w-[300px] flex flex-col items-center">
                      {slide.imageUrl ? (
                        <div className="w-44 h-44 p-2 rounded-2xl bg-white border-2 border-amber-400/60 shadow-md flex items-center justify-center">
                          <img src={slide.imageUrl} alt="QR Code" className="w-full h-full object-contain rounded-xl" />
                        </div>
                      ) : (
                        <div className="w-40 h-40 rounded-2xl bg-slate-100/90 border border-dashed border-slate-300 flex items-center justify-center text-slate-500 text-sm">
                          <i className="fa-solid fa-qrcode text-4xl" />
                        </div>
                      )}
                      <h4 
                        className="font-bold" 
                        style={{ 
                          color: isCompletelyTransparent ? '#fbbf24' : (data?.theme?.primaryColor || '#1e293b'),
                          fontFamily: slideHeadingFont,
                          fontSize: `${16 * slideScale}px`
                        }}
                      >
                        {slide.subtitle || 'Registry & Gift QR'}
                      </h4>
                      <p 
                        className="leading-relaxed"
                        style={{ 
                          fontFamily: slideBodyFont, 
                          fontSize: `${12.5 * slideScale}px`,
                          color: isCompletelyTransparent ? '#f8fafc' : '#334155'
                        }}
                      >
                        {slide.bodyText || 'Scan the QR code above for your warm gift.'}
                      </p>
                    </div>
                  )}

                  {/* GUESTBOOK */}
                  {slide.type === 'guestbook' && (
                    <div className="space-y-3.5 max-w-[300px] w-full text-center">
                      <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 text-lg">
                        <i className="fa-solid fa-book-open-reader" />
                      </div>
                      <h4 
                        className="font-bold" 
                        style={{ 
                          color: isCompletelyTransparent ? '#fbbf24' : (data?.theme?.primaryColor || '#1e293b'),
                          fontFamily: slideHeadingFont,
                          fontSize: `${16 * slideScale}px`
                        }}
                      >
                        {slide.subtitle || 'Wishes & Blessings'}
                      </h4>
                      <p 
                        className="leading-relaxed"
                        style={{ 
                          fontFamily: slideBodyFont, 
                          fontSize: `${13 * slideScale}px`,
                          color: isCompletelyTransparent ? '#f8fafc' : '#334155'
                        }}
                      >
                        {slide.bodyText || 'May your presence and prayers bring joy to our new chapter.'}
                      </p>
                    </div>
                  )}

                  {/* THANK_YOU */}
                  {slide.type === 'thank_you' && (
                    <div className="space-y-3.5 max-w-[300px] mx-auto">
                      <div className="text-3xl text-amber-500">❧ ❦ ☙</div>
                      <p 
                        className="leading-relaxed min-h-[48px]"
                        style={{ 
                          fontFamily: slideBodyFont, 
                          fontSize: `${13.5 * slideScale}px`,
                          color: isCompletelyTransparent ? '#f8fafc' : '#334155'
                        }}
                      >
                        {isCurrent ? <TypewriterText text={slide.bodyText || 'With heartfelt gratitude for your love, support, and presence.'} speed={45} delay={250} /> : slide.bodyText}
                      </p>
                      <div className="text-amber-500 text-xl">𖥸</div>
                    </div>
                  )}
                </div>

                {/* Bottom Navigation */}
                <div className="w-full flex flex-col items-center gap-1 pt-1">
                  {idx < totalSlides - 1 ? (
                    <button 
                      onClick={nextSlide} 
                      type="button"
                      className="text-amber-500 hover:text-amber-400 text-[11px] tracking-[3px] uppercase font-bold flex flex-col items-center gap-1 transition-transform active:scale-95 cursor-pointer"
                      style={{ fontFamily: slideHeadingFont }}
                    >
                      <i className="fa-solid fa-chevron-down text-[11px] animate-bounce" />
                      NEXT
                    </button>
                  ) : (
                    <button 
                      onClick={handleCloseCard} 
                      type="button"
                      className="px-6 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg active:scale-95 cursor-pointer transition-transform border border-white/20"
                    >
                      <i className="fa-solid fa-lock text-[10px]" /> CLOSE
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