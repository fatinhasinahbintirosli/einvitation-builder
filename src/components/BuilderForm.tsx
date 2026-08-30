'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CardData, SlideType } from '@/types/invitation';
import { supabase } from '@/lib/supabaseClient';

type SlideItem = CardData['slides'][number];

interface Props {
  data: CardData;
  onChange: (data: CardData) => void;
  onSave?: () => void | Promise<void>;
  isSaving?: boolean;
  slug?: string;
  setSlug?: (slug: string) => void;
  generatedUrl?: string | null;
  activeSlideIndex?: number | 'cover';
  onActiveSlideChange?: (index: number | 'cover') => void;
}

interface DynamicItem {
  id: string;
  name: string;
  category: string;
  url: string;
  order_index: number;
}

const FONT_PRESETS_HEADING = [
  { name: 'Cinzel (Royal Roman)', value: 'Cinzel, serif' },
  { name: 'Great Vibes (Romantic Calligraphy)', value: 'Great Vibes, cursive' },
  { name: 'Playfair Display (Luxury Serif)', value: 'Playfair Display, serif' },
  { name: 'Cormorant Garamond (Editorial Vintage)', value: 'Cormorant Garamond, serif' },
  { name: 'Montserrat (Modern Geometric)', value: 'Montserrat, sans-serif' },
  { name: 'Alex Brush (Formal Script)', value: 'Alex Brush, cursive' },
  { name: 'Poppins (Clean Chic Sans)', value: 'Poppins, sans-serif' },
];

const FONT_PRESETS_BODY = [
  { name: 'Playfair Display (Classic Serif)', value: 'Playfair Display, serif' },
  { name: 'Inter (Sleek Clean Sans)', value: 'Inter, sans-serif' },
  { name: 'Lora (Literary Modern Serif)', value: 'Lora, serif' },
  { name: 'Cinzel (Uppercase Elegance)', value: 'Cinzel, serif' },
  { name: 'Montserrat (Refined Sans)', value: 'Montserrat, sans-serif' },
];

const FONT_SIZE_PRESETS = [
  { label: 'Compact (90%)', value: 90 },
  { label: 'Standard (100%)', value: 100 },
  { label: 'Large (110%)', value: 110 },
  { label: 'X-Large (120%)', value: 120 },
];

const FONT_COLOR_PRESETS = [
  { name: 'Pure White', hex: '#ffffff' },
  { name: 'Warm Gold', hex: '#b59049' },
  { name: 'Amber Glow', hex: '#f59e0b' },
  { name: 'Champagne Cream', hex: '#fef3c7' },
  { name: 'Charcoal Dark', hex: '#1e293b' },
  { name: 'Emerald Green', hex: '#10b981' },
  { name: 'Rose Pink', hex: '#f43f5e' },
  { name: 'Navy Blue', hex: '#1e3a8a' },
];

const COLOR_PRESETS = [
  { name: 'Emerald Forest', hex: '#2d4a3e' },
  { name: 'Royal Navy', hex: '#172554' },
  { name: 'Deep Maroon', hex: '#451a24' },
  { name: 'Espresso Brown', hex: '#3e2723' },
  { name: 'Champagne Gold', hex: '#63513d' },
  { name: 'Midnight Onyx', hex: '#18181b' },
  { name: 'Dusty Rose', hex: '#5c3a4d' },
  { name: 'Classic Slate', hex: '#1e293b' },
];

const CARD_BOX_COLORS = [
  { name: 'Pure White', hex: '#ffffff' },
  { name: 'Warm Ivory', hex: '#fdfbf7' },
  { name: 'Cream Linen', hex: '#f5f0e8' },
  { name: 'Midnight Glass', hex: '#0f172a' },
  { name: 'Deep Emerald', hex: '#142820' },
  { name: 'Velvet Maroon', hex: '#2e1219' },
  { name: 'Charcoal Tint', hex: '#1e293b' },
];

const OPACITY_PRESETS = [
  { label: '0% Invisible', value: 0 },
  { label: '50% Glass', value: 50 },
  { label: '75% Frosted', value: 75 },
  { label: '90% Crisp', value: 90 },
  { label: '100% Solid', value: 100 },
];

export default function BuilderForm({ 
  data, 
  onChange, 
  onSave, 
  isSaving = false,
  slug,
  setSlug,
  generatedUrl,
  activeSlideIndex,
  onActiveSlideChange
}: Props) {
  const [activeTab, setActiveTab] = useState<'cover' | 'slides' | 'music'>('cover');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Dynamic Assets from Supabase
  const [dbWallpapers, setDbWallpapers] = useState<DynamicItem[]>([]);
  const [dbMusic, setDbMusic] = useState<DynamicItem[]>([]);
  const [dbFrames, setDbFrames] = useState<DynamicItem[]>([]);

  // Modals state
  const [isWallpaperModalOpen, setIsWallpaperModalOpen] = useState(false);
  const [wallpaperModalTarget, setWallpaperModalTarget] = useState<'cover' | 'slide'>('cover');
  const [selectedWallpaperCategory, setSelectedWallpaperCategory] = useState('All');

  const [isFrameModalOpen, setIsFrameModalOpen] = useState(false);
  const [selectedFrameCategory, setSelectedFrameCategory] = useState('All');

  const [isMusicModalOpen, setIsMusicModalOpen] = useState(false);
  const [selectedMusicCategory, setSelectedMusicCategory] = useState('All');
  const [previewTrackUrl, setPreviewTrackUrl] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const modalAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const fetchAssets = async () => {
      const { data: wpData } = await supabase.from('wallpapers').select('*').order('order_index', { ascending: true });
      if (wpData) setDbWallpapers(wpData);

      const { data: mData } = await supabase.from('music_tracks').select('*').order('order_index', { ascending: true });
      if (mData) setDbMusic(mData);

      const { data: fData } = await supabase.from('frames').select('*').order('order_index', { ascending: true });
      if (fData) setDbFrames(fData);
    };
    fetchAssets();
  }, []);

  const bgType = data.theme?.coverBgType || 'color';
  const currentOpacity = typeof data.theme?.cardOpacity === 'number' ? data.theme.cardOpacity : 90;
  const currentBoxColor = data.theme?.cardBoxColor || '#ffffff';
  const currentFrameScale = data.theme?.frameScale || 100;
  const isExtendedToBackground = data.theme?.frameExtendToBackground === true;

  // Font Colors State
  const coverHeadingColor = data.theme?.coverHeadingColor || '#ffffff';
  const coverTextColor = data.theme?.coverTextColor || '#e2e8f0';
  const slideHeadingColor = data.theme?.slideHeadingColor || data.theme?.goldColor || '#b59049';
  const slideTextColor = data.theme?.slideTextColor || '#334155';

  const updateData = (newData: CardData) => {
    onChange(newData);
  };

  const handleTabChange = (tab: 'cover' | 'slides' | 'music') => {
    setActiveTab(tab);
    if (tab === 'cover') {
      onActiveSlideChange?.('cover');
    } else if (tab === 'slides') {
      onActiveSlideChange?.(typeof activeSlideIndex === 'number' ? activeSlideIndex : 0);
    } else if (tab === 'music') {
      onActiveSlideChange?.('cover');
    }
  };

  const handleFrameUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      alert('Frame image size exceeds 4MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      updateData({
        ...data,
        theme: { ...data.theme, frameOverlayUrl: base64Url }
      });
      if (activeSlideIndex === 'cover') onActiveSlideChange?.(0);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectFrame = (url: string) => {
    updateData({
      ...data,
      theme: { ...data.theme, frameOverlayUrl: url }
    });
    setIsFrameModalOpen(false);
    if (activeSlideIndex === 'cover') onActiveSlideChange?.(0);
  };

  const handleRemoveFrame = () => {
    updateData({
      ...data,
      theme: { ...data.theme, frameOverlayUrl: undefined }
    });
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      alert('Audio file exceeds 8MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Audio = event.target?.result as string;
      updateData({ ...data, cover: { ...data.cover, audioUrl: base64Audio } });
    };
    reader.readAsDataURL(file);
  };

  const handleTogglePreviewMusic = (url: string) => {
    if (!modalAudioRef.current) return;
    const player = modalAudioRef.current;

    if (previewTrackUrl === url && isPlayingAudio) {
      player.pause();
      setIsPlayingAudio(false);
      setPreviewTrackUrl(null);
    } else {
      player.pause();
      player.src = url;
      player.currentTime = 0;
      player.load();
      setPreviewTrackUrl(url);

      player.play()
        .then(() => setIsPlayingAudio(true))
        .catch(err => {
          console.warn('Playback notice:', err);
          setIsPlayingAudio(false);
        });
    }
  };

  const handleSelectTrack = (url: string) => {
    if (modalAudioRef.current) {
      modalAudioRef.current.pause();
    }
    setIsPlayingAudio(false);
    setPreviewTrackUrl(null);
    updateData({ ...data, cover: { ...data.cover, audioUrl: url } });
    setIsMusicModalOpen(false);
  };

  const openWallpaperModal = (target: 'cover' | 'slide') => {
    setWallpaperModalTarget(target);
    setIsWallpaperModalOpen(true);
  };

  const handleSelectWallpaper = (url: string) => {
    if (wallpaperModalTarget === 'cover') {
      updateData({
        ...data,
        theme: { ...data.theme, coverBgType: 'image', coverBgUrl: url }
      });
      onActiveSlideChange?.('cover');
    } else {
      updateData({
        ...data,
        theme: { ...data.theme, slideBgUrl: url, bgPatternUrl: url }
      });
      if (activeSlideIndex === 'cover') onActiveSlideChange?.(0);
    }
    setIsWallpaperModalOpen(false);
  };

  const handleCoverWallpaperUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      setUploadError('Image exceeds 3MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      updateData({
        ...data,
        theme: { ...data.theme, coverBgType: 'image', coverBgUrl: base64Url }
      });
      onActiveSlideChange?.('cover');
    };
    reader.readAsDataURL(file);
  };

  const handleSlideWallpaperUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      setUploadError('Image exceeds 3MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      updateData({
        ...data,
        theme: { ...data.theme, slideBgUrl: base64Url, bgPatternUrl: base64Url }
      });
      if (activeSlideIndex === 'cover') onActiveSlideChange?.(0);
    };
    reader.readAsDataURL(file);
  };

  const handleSlideImageUpload = (slideIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      const updatedSlides = [...data.slides];
      updatedSlides[slideIndex] = { ...updatedSlides[slideIndex], imageUrl: base64Url };
      updateData({ ...data, slides: updatedSlides });
      onActiveSlideChange?.(slideIndex);
    };
    reader.readAsDataURL(file);
  };

  const updateSlide = (index: number, updatedFields: Partial<SlideItem>) => {
    const updatedSlides = [...data.slides];
    updatedSlides[index] = { ...updatedSlides[index], ...updatedFields };
    updateData({ ...data, slides: updatedSlides });
    onActiveSlideChange?.(index);
  };

  const addNewSlide = () => {
    const newSlide: SlideItem = {
      id: Math.random().toString(36).substring(2, 9),
      type: 'location',
      title: 'EVENT LOCATION',
      locationDetails: {
        venueName: 'The Grand Ballroom',
        address: '123 Luxury Boulevard, Suite 500, New York',
        gmapsUrl: 'http://googleusercontent.com/maps.google.com/4',
        wazeUrl: 'https://waze.com'
      }
    };
    const newIndex = data.slides.length;
    updateData({ ...data, slides: [...data.slides, newSlide] });
    onActiveSlideChange?.(newIndex);
  };

  const removeSlide = (index: number) => {
    if (data.slides.length <= 1) {
      alert('The card requires at least 1 slide.');
      return;
    }
    const updatedSlides = data.slides.filter((_, idx) => idx !== index);
    updateData({ ...data, slides: updatedSlides });
    onActiveSlideChange?.(Math.max(0, index - 1));
  };

  const handleTypeChange = (index: number, newType: SlideType) => {
    const currentSlide = data.slides[index];
    let updated: Partial<SlideItem> = { type: newType };

    if (newType === 'location' && !currentSlide.locationDetails) {
      updated.title = 'EVENT VENUE';
      updated.locationDetails = {
        venueName: 'Grand Estate & Ballroom',
        address: 'Full address details here...',
        gmapsUrl: 'http://googleusercontent.com/maps.google.com/4',
        wazeUrl: 'https://waze.com'
      };
    } else if (newType === 'tentative' && !currentSlide.timeline) {
      updated.title = 'EVENT SCHEDULE';
      updated.timeline = [
        { time: '05:00 PM', activity: 'Guest Arrival & Welcome Drinks' },
        { time: '06:30 PM', activity: 'Solemnization / Main Ceremony' },
        { time: '08:00 PM', activity: 'Gala Dinner & Speeches' }
      ];
    } else if (newType === 'image_qr') {
      updated.title = 'GIFT REGISTRY / QR';
      updated.subtitle = 'Digital Angpow & Blessings';
      updated.bodyText = 'Scan the QR code below for your warm gift and thoughts.';
    } else if (newType === 'guestbook') {
      updated.title = 'GUESTBOOK & WISHES';
      updated.subtitle = 'Leave a Warm Blessing';
      updated.bodyText = 'May your presence and prayers bring joy to our new chapter.';
    } else if (newType === 'thank_you') {
      updated.title = 'WITH GRATITUDE';
      updated.bodyText = 'Heartfelt thanks for being part of our special celebration.';
    }

    updateSlide(index, updated);
  };

  const addTimelineItem = (slideIndex: number) => {
    const slide = data.slides[slideIndex];
    const currentTimeline = slide.timeline || [];
    const newTimeline = [...currentTimeline, { time: '07:00 PM', activity: 'New Activity' }];
    updateSlide(slideIndex, { timeline: newTimeline });
  };

  const removeTimelineItem = (slideIndex: number, itemIndex: number) => {
    const slide = data.slides[slideIndex];
    const newTimeline = (slide.timeline || []).filter((_, idx) => idx !== itemIndex);
    updateSlide(slideIndex, { timeline: newTimeline });
  };

  const updateTimelineItem = (slideIndex: number, itemIndex: number, field: 'time' | 'activity', value: string) => {
    const slide = data.slides[slideIndex];
    const newTimeline = [...(slide.timeline || [])];
    newTimeline[itemIndex] = { ...newTimeline[itemIndex], [field]: value };
    updateSlide(slideIndex, { timeline: newTimeline });
  };

  const handleStripeCheckout = async () => {
    if (!slug) return;
    setIsCheckingOut(true);

    try {
      if (onSave) await onSave();

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: slug.trim().toLowerCase() }),
      });

      const resData = await res.json();
      if (resData.url) {
        window.location.href = resData.url;
      } else {
        alert('Error starting checkout: ' + (resData.error || 'Please try again.'));
      }
    } catch (err: any) {
      alert('Network error: ' + err.message);
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Categories
  const wallpaperCategories = ['All', ...Array.from(new Set(dbWallpapers.map(w => w.category).filter(Boolean)))];
  const musicCategories = ['All', ...Array.from(new Set(dbMusic.map(m => m.category).filter(Boolean)))];
  const frameCategories = ['All', ...Array.from(new Set(dbFrames.map(f => f.category).filter(Boolean)))];

  const filteredWallpapers = selectedWallpaperCategory === 'All' 
    ? dbWallpapers 
    : dbWallpapers.filter(w => w.category === selectedWallpaperCategory);

  const filteredMusic = selectedMusicCategory === 'All'
    ? dbMusic
    : dbMusic.filter(m => m.category === selectedMusicCategory);

  const filteredFrames = selectedFrameCategory === 'All'
    ? dbFrames
    : dbFrames.filter(f => f.category === selectedFrameCategory);

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 text-slate-200 shadow-2xl space-y-5">
      
      {/* Hidden Audio Player for Preview Modal */}
      <audio 
        ref={modalAudioRef} 
        onEnded={() => {
          setIsPlayingAudio(false);
          setPreviewTrackUrl(null);
        }}
        onError={() => {
          setIsPlayingAudio(false);
          setPreviewTrackUrl(null);
        }}
      />

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-wide">Digital Invitation Studio</h2>
        <p className="text-xs text-slate-400 mt-1">Independent cover & slide font typography, colors, frames & transparency.</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs font-semibold">
        <button
          type="button"
          onClick={() => handleTabChange('cover')}
          className={`flex-1 py-2.5 rounded-lg transition-all ${
            activeTab === 'cover' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          1. Cover Page
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('slides')}
          className={`flex-1 py-2.5 rounded-lg transition-all ${
            activeTab === 'slides' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          2. Slides, Box & Frame ({data.slides?.length || 0})
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('music')}
          className={`flex-1 py-2.5 rounded-lg transition-all ${
            activeTab === 'music' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          3. Music & Sound
        </button>
      </div>

      {/* ================= TAB 1: COVER PAGE ONLY ================= */}
      {activeTab === 'cover' && (
        <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
          
          {/* 1. COVER TYPOGRAPHY & FONT COLORS */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-amber-500/25 space-y-4">
            <label className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <i className="fa-solid fa-font" /> Cover Typography & Font Colors
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1 font-medium">Cover Header Font</label>
                <select
                  value={data.theme?.coverHeadingFont || 'Cinzel, serif'}
                  onChange={(e) => updateData({ ...data, theme: { ...data.theme, coverHeadingFont: e.target.value } })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-amber-300 text-xs font-semibold outline-none cursor-pointer focus:border-amber-400"
                >
                  {FONT_PRESETS_HEADING.map((f) => (
                    <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1 font-medium">Cover Guest Name Font</label>
                <select
                  value={data.theme?.coverBodyFont || 'Playfair Display, serif'}
                  onChange={(e) => updateData({ ...data, theme: { ...data.theme, coverBodyFont: e.target.value } })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs font-medium outline-none cursor-pointer focus:border-amber-400"
                >
                  {FONT_PRESETS_BODY.map((f) => (
                    <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* COLOR PICKERS FOR COVER */}
            <div className="pt-2 border-t border-slate-800 space-y-3">
              <span className="text-[11px] text-slate-300 font-semibold block">Cover Font Colors:</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Title / Accent Color */}
                <div className="space-y-1.5 p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] text-slate-400 font-medium">Title & Accent Color</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={coverHeadingColor}
                        onChange={(e) => updateData({ ...data, theme: { ...data.theme, coverHeadingColor: e.target.value } })}
                        className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
                      />
                      <span className="text-[10px] font-mono text-amber-300 font-bold">{coverHeadingColor}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 overflow-x-auto pt-1">
                    {FONT_COLOR_PRESETS.map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => updateData({ ...data, theme: { ...data.theme, coverHeadingColor: c.hex } })}
                        className={`w-6 h-6 rounded-md border shrink-0 transition-transform ${coverHeadingColor === c.hex ? 'border-amber-400 scale-110 shadow' : 'border-slate-700'}`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Subtitle / Text Color */}
                <div className="space-y-1.5 p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] text-slate-400 font-medium">Tagline & Date Color</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={coverTextColor}
                        onChange={(e) => updateData({ ...data, theme: { ...data.theme, coverTextColor: e.target.value } })}
                        className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
                      />
                      <span className="text-[10px] font-mono text-amber-300 font-bold">{coverTextColor}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 overflow-x-auto pt-1">
                    {FONT_COLOR_PRESETS.map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => updateData({ ...data, theme: { ...data.theme, coverTextColor: c.hex } })}
                        className={`w-6 h-6 rounded-md border shrink-0 transition-transform ${coverTextColor === c.hex ? 'border-amber-400 scale-110 shadow' : 'border-slate-700'}`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Cover Font Size Scaling */}
            <div className="pt-2 border-t border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-300 font-medium">Cover Font Scaling:</span>
                <span className="text-xs font-mono font-bold text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30">
                  {data.theme?.coverFontSizeScale || 100}%
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {FONT_SIZE_PRESETS.map((scalePreset) => (
                  <button
                    key={scalePreset.value}
                    type="button"
                    onClick={() => updateData({ ...data, theme: { ...data.theme, coverFontSizeScale: scalePreset.value } })}
                    className={`py-1.5 px-2 rounded-lg text-[10px] font-semibold border transition-all ${
                      (data.theme?.coverFontSizeScale || 100) === scalePreset.value
                        ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow'
                        : 'bg-slate-950 text-slate-300 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    {scalePreset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 2. COVER BACKGROUND */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                Cover Background (Front Page Only)
              </label>
              <div className="flex rounded-lg bg-slate-950 p-0.5 border border-slate-800 text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    updateData({ ...data, theme: { ...data.theme, coverBgType: 'color' } });
                    onActiveSlideChange?.('cover');
                  }}
                  className={`px-3 py-1 rounded-md transition-all ${
                    bgType === 'color' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <i className="fa-solid fa-palette mr-1" /> Solid Color
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateData({ ...data, theme: { ...data.theme, coverBgType: 'image' } });
                    onActiveSlideChange?.('cover');
                  }}
                  className={`px-3 py-1 rounded-md transition-all ${
                    bgType === 'image' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <i className="fa-solid fa-image mr-1" /> Image / Wallpaper
                </button>
              </div>
            </div>

            {bgType === 'color' && (
              <div className="space-y-3 pt-1">
                <span className="text-[11px] text-slate-400 block font-medium">Select a theme palette color:</span>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {COLOR_PRESETS.map((color) => (
                    <button
                      key={color.hex}
                      type="button"
                      onClick={() => {
                        updateData({
                          ...data,
                          theme: { ...data.theme, coverBgColor: color.hex, primaryColor: color.hex }
                        });
                        onActiveSlideChange?.('cover');
                      }}
                      className={`h-10 rounded-xl border-2 transition-transform flex items-center justify-center ${
                        (data.theme?.coverBgColor || data.theme?.primaryColor) === color.hex
                          ? 'border-amber-400 scale-105 shadow-md'
                          : 'border-slate-700 hover:scale-100'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    >
                      {(data.theme?.coverBgColor || data.theme?.primaryColor) === color.hex && (
                        <i className="fa-solid fa-check text-white text-xs" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <label className="text-[11px] text-slate-400">Custom Hex Color:</label>
                  <input
                    type="color"
                    value={data.theme?.coverBgColor || data.theme?.primaryColor || '#2d4a3e'}
                    onChange={(e) => {
                      updateData({
                        ...data,
                        theme: { ...data.theme, coverBgColor: e.target.value, primaryColor: e.target.value }
                      });
                      onActiveSlideChange?.('cover');
                    }}
                    className="w-8 h-8 rounded-lg bg-transparent cursor-pointer border border-slate-700"
                  />
                  <span className="text-xs text-amber-300 font-mono font-bold">
                    {data.theme?.coverBgColor || data.theme?.primaryColor || '#2d4a3e'}
                  </span>
                </div>
              </div>
            )}

            {bgType === 'image' && (
              <div className="space-y-3 pt-1">
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={() => openWallpaperModal('cover')}
                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-400/50 hover:bg-amber-500/30 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <i className="fa-solid fa-images text-base" /> Choose Cover Wallpaper ({dbWallpapers.length} Items)
                  </button>

                  <label className="py-3 px-4 rounded-xl bg-slate-950 border border-slate-700 hover:border-amber-400/60 text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all">
                    <i className="fa-solid fa-cloud-arrow-up text-amber-400" /> Upload Image
                    <input type="file" accept="image/*" onChange={handleCoverWallpaperUpload} className="hidden" />
                  </label>
                </div>
                {uploadError && <p className="text-xs text-red-400">{uploadError}</p>}
              </div>
            )}
          </div>
          
          {/* Cover Text Inputs */}
          <div>
            <label className="text-xs text-slate-400 block mb-1">Top Tagline / Sub-Header</label>
            <input
              type="text"
              value={data.cover?.tagline || ''}
              onFocus={() => onActiveSlideChange?.('cover')}
              onChange={(e) => updateData({ ...data, cover: { ...data.cover, tagline: e.target.value } })}
              placeholder="e.g. The Wedding Celebration Of"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs focus:border-amber-400 outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Main Event Title / Couple Names</label>
            <input
              type="text"
              value={data.cover?.mainTitle || ''}
              onFocus={() => onActiveSlideChange?.('cover')}
              onChange={(e) => updateData({ ...data, cover: { ...data.cover, mainTitle: e.target.value } })}
              placeholder="e.g. Emma & Liam"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs focus:border-amber-400 outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Event Date (Short Display)</label>
            <input
              type="text"
              value={data.cover?.dateText || ''}
              onFocus={() => onActiveSlideChange?.('cover')}
              onChange={(e) => updateData({ ...data, cover: { ...data.cover, dateText: e.target.value } })}
              placeholder="e.g. SUNDAY, OCTOBER 18, 2026"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs focus:border-amber-400 outline-none"
            />
          </div>
        </div>
      )}

      {/* ================= TAB 2: SLIDES, BOX, TYPOGRAPHY & FOREGROUND FRAME ================= */}
      {activeTab === 'slides' && (
        <div className="space-y-4">
          
          {/* 1. FOREGROUND DECORATIVE FRAME, TICK BOX & ZOOM CONTROLS */}
          <div className="p-4 rounded-2xl bg-slate-950/90 border border-emerald-500/30 space-y-3.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                <i className="fa-solid fa-leaf" /> Foreground Decorative Frame (Bingkai Hadapan)
              </label>
              {data.theme?.frameOverlayUrl && (
                <button
                  type="button"
                  onClick={handleRemoveFrame}
                  className="text-[10px] text-red-400 hover:text-red-300 font-semibold underline cursor-pointer"
                >
                  Remove Frame
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => setIsFrameModalOpen(true)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 border border-emerald-400/50 hover:bg-emerald-500/30 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <i className="fa-solid fa-border-all" /> Choose Frame ({dbFrames.length} Items)
              </button>

              <label className="py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-700 hover:border-emerald-400/60 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all">
                <i className="fa-solid fa-cloud-arrow-up text-emerald-400" /> Upload PNG File
                <input type="file" accept="image/*" onChange={handleFrameUpload} className="hidden" />
              </label>
            </div>

            {/* CONTROLS IF FRAME IS ACTIVE */}
            {data.theme?.frameOverlayUrl && (
              <div className="pt-2 border-t border-slate-800 space-y-3">
                <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-900 border border-emerald-500/30 cursor-pointer hover:border-emerald-400 transition-all select-none">
                  <input
                    type="checkbox"
                    checked={isExtendedToBackground}
                    onChange={(e) => {
                      updateData({
                        ...data,
                        theme: { ...data.theme, frameExtendToBackground: e.target.checked }
                      });
                      if (activeSlideIndex === 'cover') onActiveSlideChange?.(0);
                    }}
                    className="w-4 h-4 mt-0.5 accent-emerald-500 rounded cursor-pointer shrink-0"
                  />
                  <div>
                    <span className="text-xs font-bold text-emerald-300 block">
                      Limpah Bingkai ke Wallpaper Belakang (Full Bleed Mode)
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Tandakan tick untuk membiarkan daun keluar melepasi kotak putih hingga ke hujung skrin.
                    </span>
                  </div>
                </label>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                      <i className="fa-solid fa-magnifying-glass-plus text-emerald-400" /> Frame Zoom In / Out Scale:
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30">
                      {currentFrameScale}%
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-400 font-bold">70% (Zoom Out)</span>
                    <input
                      type="range"
                      min="70"
                      max="150"
                      step="2"
                      value={currentFrameScale}
                      onChange={(e) => {
                        updateData({
                          ...data,
                          theme: { ...data.theme, frameScale: Number(e.target.value) }
                        });
                        if (activeSlideIndex === 'cover') onActiveSlideChange?.(0);
                      }}
                      className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-900 rounded-lg"
                    />
                    <span className="text-[10px] text-slate-400 font-bold">150% (Zoom In)</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. SLIDE TYPOGRAPHY & FONT COLORS */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <label className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <i className="fa-solid fa-font" /> Slide Typography & Font Colors
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1 font-medium">Slide Header Font</label>
                <select
                  value={data.theme?.slideHeadingFont || 'Cinzel, serif'}
                  onChange={(e) => updateData({ ...data, theme: { ...data.theme, slideHeadingFont: e.target.value } })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-amber-300 text-xs font-semibold outline-none cursor-pointer focus:border-amber-400"
                >
                  {FONT_PRESETS_HEADING.map((f) => (
                    <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1 font-medium">Slide Content Font</label>
                <select
                  value={data.theme?.slideBodyFont || 'Playfair Display, serif'}
                  onChange={(e) => updateData({ ...data, theme: { ...data.theme, slideBodyFont: e.target.value } })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs font-medium outline-none cursor-pointer focus:border-amber-400"
                >
                  {FONT_PRESETS_BODY.map((f) => (
                    <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* COLOR PICKERS FOR SLIDES */}
            <div className="pt-2 border-t border-slate-800 space-y-3">
              <span className="text-[11px] text-slate-300 font-semibold block">Slide Font Colors:</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Slide Header & Accent Color */}
                <div className="space-y-1.5 p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] text-slate-400 font-medium">Header & Gold Accent</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={slideHeadingColor}
                        onChange={(e) => updateData({ ...data, theme: { ...data.theme, slideHeadingColor: e.target.value, goldColor: e.target.value } })}
                        className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
                      />
                      <span className="text-[10px] font-mono text-amber-300 font-bold">{slideHeadingColor}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 overflow-x-auto pt-1">
                    {FONT_COLOR_PRESETS.map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => updateData({ ...data, theme: { ...data.theme, slideHeadingColor: c.hex, goldColor: c.hex } })}
                        className={`w-6 h-6 rounded-md border shrink-0 transition-transform ${slideHeadingColor === c.hex ? 'border-amber-400 scale-110 shadow' : 'border-slate-700'}`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Slide Body / Content Color */}
                <div className="space-y-1.5 p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] text-slate-400 font-medium">Body / Content Text</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={slideTextColor}
                        onChange={(e) => updateData({ ...data, theme: { ...data.theme, slideTextColor: e.target.value } })}
                        className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
                      />
                      <span className="text-[10px] font-mono text-amber-300 font-bold">{slideTextColor}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 overflow-x-auto pt-1">
                    {FONT_COLOR_PRESETS.map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => updateData({ ...data, theme: { ...data.theme, slideTextColor: c.hex } })}
                        className={`w-6 h-6 rounded-md border shrink-0 transition-transform ${slideTextColor === c.hex ? 'border-amber-400 scale-110 shadow' : 'border-slate-700'}`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Slide Font Size Scaling */}
            <div className="pt-2 border-t border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-300 font-medium">Slide Content Scaling:</span>
                <span className="text-xs font-mono font-bold text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30">
                  {data.theme?.slideFontSizeScale || 100}%
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {FONT_SIZE_PRESETS.map((scalePreset) => (
                  <button
                    key={scalePreset.value}
                    type="button"
                    onClick={() => updateData({ ...data, theme: { ...data.theme, slideFontSizeScale: scalePreset.value } })}
                    className={`py-1.5 px-2 rounded-lg text-[10px] font-semibold border transition-all ${
                      (data.theme?.slideFontSizeScale || 100) === scalePreset.value
                        ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow'
                        : 'bg-slate-950 text-slate-300 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    {scalePreset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. CARD BOX COLOR & 0-100% OPACITY */}
          <div className="p-4 rounded-2xl bg-slate-950/90 border border-amber-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <i className="fa-solid fa-box-open" /> Card Box Color & Transparency (0% - 100%)
              </label>
              <span className="text-xs font-mono font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                {currentOpacity === 0 ? '0% (Invisible Box)' : `${currentOpacity}% Opacity`}
              </span>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] text-slate-400 block font-medium">Select Card Box Color:</span>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {CARD_BOX_COLORS.map((color) => (
                  <button
                    key={color.hex}
                    type="button"
                    onClick={() => updateData({ ...data, theme: { ...data.theme, cardBoxColor: color.hex } })}
                    className={`h-9 rounded-xl border-2 transition-transform flex items-center justify-center ${
                      currentBoxColor === color.hex ? 'border-amber-400 scale-105 shadow' : 'border-slate-700'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  >
                    {currentBoxColor === color.hex && (
                      <i className={`fa-solid fa-check text-xs ${color.hex === '#ffffff' || color.hex === '#fdfbf7' || color.hex === '#f5f0e8' ? 'text-slate-900' : 'text-white'}`} />
                    )}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <label className="text-[11px] text-slate-400">Custom Box Color:</label>
                <input
                  type="color"
                  value={currentBoxColor}
                  onChange={(e) => updateData({ ...data, theme: { ...data.theme, cardBoxColor: e.target.value } })}
                  className="w-7 h-7 rounded-lg bg-transparent cursor-pointer border border-slate-700"
                />
                <span className="text-xs text-amber-300 font-mono font-bold">{currentBoxColor}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-slate-400 font-bold">0% (Invisible)</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={currentOpacity}
                  onChange={(e) => {
                    updateData({
                      ...data,
                      theme: { ...data.theme, cardOpacity: Number(e.target.value) }
                    });
                    if (activeSlideIndex === 'cover') onActiveSlideChange?.(0);
                  }}
                  className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-900 rounded-lg"
                />
                <span className="text-[10px] text-slate-400 font-bold">100% (Solid)</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                {OPACITY_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => {
                      updateData({
                        ...data,
                        theme: { ...data.theme, cardOpacity: preset.value }
                      });
                      if (activeSlideIndex === 'cover') onActiveSlideChange?.(0);
                    }}
                    className={`py-1 px-2 rounded-lg text-[10px] font-medium border transition-all ${
                      currentOpacity === preset.value
                        ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow'
                        : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 4. INNER SLIDE WALLPAPER */}
          <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3">
            <label className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <i className="fa-solid fa-layer-group" /> Inner Slide Wallpaper
            </label>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => openWallpaperModal('slide')}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-400/50 hover:bg-amber-500/30 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <i className="fa-solid fa-images" /> Choose Slide Wallpaper ({dbWallpapers.length} Items)
              </button>

              <label className="py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-400/60 text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all">
                <i className="fa-solid fa-cloud-arrow-up text-amber-400" /> Upload File
                <input type="file" accept="image/*" onChange={handleSlideWallpaperUpload} className="hidden" />
              </label>
            </div>
          </div>

          {/* 5. SLIDE LIST */}
          <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
            {data.slides.map((slide, idx) => {
              const isCurrentlyActive = activeSlideIndex === idx;

              return (
                <div 
                  key={slide.id || idx} 
                  onClick={() => onActiveSlideChange?.(idx)}
                  className={`p-4 rounded-2xl bg-slate-950/80 border transition-all space-y-3.5 ${
                    isCurrentlyActive ? 'border-amber-400 ring-2 ring-amber-400/30 shadow-lg' : 'border-slate-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                        isCurrentlyActive ? 'bg-amber-500 text-slate-950' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {idx + 1}
                      </span>
                      
                      <select
                        value={slide.type}
                        onFocus={() => onActiveSlideChange?.(idx)}
                        onChange={(e) => handleTypeChange(idx, e.target.value as SlideType)}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 border border-amber-400/40 text-amber-300 text-xs font-semibold outline-none cursor-pointer focus:border-amber-400"
                      >
                        <option value="intro">✨ Introduction & Welcome</option>
                        <option value="location">📍 Location & Maps (Google / Waze)</option>
                        <option value="tentative">📅 Schedule & Timeline</option>
                        <option value="image_qr">📷 Gift Registry / QR Code</option>
                        <option value="guestbook">📖 Guestbook & Wishes</option>
                        <option value="thank_you">🙏 Thank You & Closing Note</option>
                      </select>

                      {isCurrentlyActive && (
                        <span className="text-[9px] text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                          Active in Preview
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={slide.title || ''}
                        onFocus={() => onActiveSlideChange?.(idx)}
                        onChange={(e) => updateSlide(idx, { title: e.target.value })}
                        placeholder="Slide Header"
                        className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-right text-slate-300 outline-none w-32"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeSlide(idx);
                        }}
                        className="text-red-400 hover:text-red-300 p-1 text-xs"
                        title="Delete This Slide"
                      >
                        <i className="fa-solid fa-trash-can" />
                      </button>
                    </div>
                  </div>

                  {/* INTRO */}
                  {slide.type === 'intro' && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Welcome Message</label>
                        <textarea
                          rows={2}
                          value={slide.bodyText || ''}
                          onFocus={() => onActiveSlideChange?.(idx)}
                          onChange={(e) => updateSlide(idx, { bodyText: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Celebrant / Couple Full Name</label>
                        <input
                          type="text"
                          value={slide.subtitle || ''}
                          onFocus={() => onActiveSlideChange?.(idx)}
                          onChange={(e) => updateSlide(idx, { subtitle: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Center Portrait Photo</label>
                        <div className="flex items-center gap-3">
                          {slide.imageUrl && (
                            <img src={slide.imageUrl} alt="Preview" className="w-10 h-10 rounded-full object-cover border border-amber-400" />
                          )}
                          <label className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs cursor-pointer border border-slate-700">
                            Choose Photo File
                            <input type="file" accept="image/*" onChange={(e) => handleSlideImageUpload(idx, e)} className="hidden" />
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* LOCATION */}
                  {slide.type === 'location' && slide.locationDetails && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Venue / Ballroom Name</label>
                        <input
                          type="text"
                          value={slide.locationDetails?.venueName || ''}
                          onFocus={() => onActiveSlideChange?.(idx)}
                          onChange={(e) => updateSlide(idx, {
                            locationDetails: { ...(slide.locationDetails || { venueName: '', address: '', gmapsUrl: '', wazeUrl: '' }), venueName: e.target.value }
                          })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Full Venue Address</label>
                        <textarea
                          rows={2}
                          value={slide.locationDetails?.address || ''}
                          onFocus={() => onActiveSlideChange?.(idx)}
                          onChange={(e) => updateSlide(idx, {
                            locationDetails: { ...(slide.locationDetails || { venueName: '', address: '', gmapsUrl: '', wazeUrl: '' }), address: e.target.value }
                          })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs outline-none focus:border-amber-400"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">Google Maps URL</label>
                          <input
                            type="text"
                            value={slide.locationDetails?.gmapsUrl || ''}
                            onFocus={() => onActiveSlideChange?.(idx)}
                            onChange={(e) => updateSlide(idx, {
                              locationDetails: { ...(slide.locationDetails || { venueName: '', address: '', gmapsUrl: '', wazeUrl: '' }), gmapsUrl: e.target.value }
                            })}
                            placeholder="http://googleusercontent.com/maps.google.com/4..."
                            className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs outline-none focus:border-amber-400"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">Waze Navigation URL</label>
                          <input
                            type="text"
                            value={slide.locationDetails?.wazeUrl || ''}
                            onFocus={() => onActiveSlideChange?.(idx)}
                            onChange={(e) => updateSlide(idx, {
                              locationDetails: { ...(slide.locationDetails || { venueName: '', address: '', gmapsUrl: '', wazeUrl: '' }), wazeUrl: e.target.value }
                            })}
                            placeholder="https://waze.com/ul/..."
                            className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TENTATIVE */}
                  {slide.type === 'tentative' && (
                    <div className="space-y-2.5">
                      <label className="text-[11px] text-slate-400 block">Itinerary / Timeline Table:</label>
                      {(slide.timeline || []).map((tItem, tIdx) => (
                        <div key={tIdx} className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={tItem.time}
                            onFocus={() => onActiveSlideChange?.(idx)}
                            onChange={(e) => updateTimelineItem(idx, tIdx, 'time', e.target.value)}
                            placeholder="Time"
                            className="w-24 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-amber-300 outline-none"
                          />
                          <input
                            type="text"
                            value={tItem.activity}
                            onFocus={() => onActiveSlideChange?.(idx)}
                            onChange={(e) => updateTimelineItem(idx, tIdx, 'activity', e.target.value)}
                            placeholder="Activity / Program"
                            className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => removeTimelineItem(idx, tIdx)}
                            className="text-red-400 hover:text-red-300 px-1 text-xs"
                          >
                            <i className="fa-solid fa-trash" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addTimelineItem(idx)}
                        className="text-xs text-amber-400 font-semibold hover:underline pt-1 flex items-center gap-1 cursor-pointer"
                      >
                        <i className="fa-solid fa-plus text-[10px]" /> Add Timeline Row
                      </button>
                    </div>
                  )}

                  {/* IMAGE_QR */}
                  {slide.type === 'image_qr' && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">QR Title / Label</label>
                        <input
                          type="text"
                          value={slide.subtitle || ''}
                          onFocus={() => onActiveSlideChange?.(idx)}
                          onChange={(e) => updateSlide(idx, { subtitle: e.target.value })}
                          placeholder="e.g. Gift Registry / Digital Angpow"
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Brief Description</label>
                        <input
                          type="text"
                          value={slide.bodyText || ''}
                          onFocus={() => onActiveSlideChange?.(idx)}
                          onChange={(e) => updateSlide(idx, { bodyText: e.target.value })}
                          placeholder="Scan the QR code below for your warm gift."
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Upload QR Code Image</label>
                        <div className="flex items-center gap-3">
                          {slide.imageUrl && (
                            <img src={slide.imageUrl} alt="QR" className="w-12 h-12 rounded-xl object-contain border border-amber-400 bg-white p-1" />
                          )}
                          <label className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs cursor-pointer border border-slate-700">
                            Choose QR Image
                            <input type="file" accept="image/*" onChange={(e) => handleSlideImageUpload(idx, e)} className="hidden" />
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* GUESTBOOK */}
                  {slide.type === 'guestbook' && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Section Title</label>
                        <input
                          type="text"
                          value={slide.subtitle || ''}
                          onFocus={() => onActiveSlideChange?.(idx)}
                          onChange={(e) => updateSlide(idx, { subtitle: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Guest Instructions</label>
                        <textarea
                          rows={2}
                          value={slide.bodyText || ''}
                          onFocus={() => onActiveSlideChange?.(idx)}
                          onChange={(e) => updateSlide(idx, { bodyText: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>
                  )}

                  {/* THANK_YOU */}
                  {slide.type === 'thank_you' && (
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Closing Note of Appreciation</label>
                      <textarea
                        rows={2}
                        value={slide.bodyText || ''}
                        onFocus={() => onActiveSlideChange?.(idx)}
                        onChange={(e) => updateSlide(idx, { bodyText: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs outline-none focus:border-amber-400"
                      />
                    </div>
                  )}

                </div>
              );
            })}

            <button
              type="button"
              onClick={addNewSlide}
              className="w-full py-3 rounded-2xl border-2 border-dashed border-amber-400/40 hover:border-amber-400 bg-amber-500/5 hover:bg-amber-500/10 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <i className="fa-solid fa-plus" /> Add New Slide
            </button>
          </div>
        </div>
      )}

      {/* ================= TAB 3: MUSIC & SOUND ================= */}
      {activeTab === 'music' && (
        <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
          <label className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
            Background Music & Audio Track
          </label>

          {/* 1. SELECT FROM DATABASE MUSIC LIBRARY */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-amber-500/30 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-white block">Curated Music Library ({dbMusic.length} Songs)</span>
                <span className="text-[11px] text-slate-400 block">Click the play button to preview audio before selecting.</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMusicModalOpen(true)}
                className="py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg flex items-center gap-2 cursor-pointer transition-all whitespace-nowrap"
              >
                <i className="fa-solid fa-compact-disc fa-spin" /> Open Music Library ({dbMusic.length} Tracks)
              </button>
            </div>

            {data.cover?.audioUrl && (
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-amber-300">
                <span className="font-semibold flex items-center gap-2 truncate">
                  <i className="fa-solid fa-music text-amber-400" /> Active Audio: {dbMusic.find(m => m.url === data.cover?.audioUrl)?.name || (data.cover?.audioUrl.startsWith('data:audio') ? 'Custom Uploaded Audio File' : 'Custom Audio URL')}
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold border border-emerald-500/40">
                  Ready
                </span>
              </div>
            )}
          </div>

          {/* 2. DIRECT AUDIO FILE UPLOAD */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/30 space-y-2">
            <span className="text-xs font-bold text-white block">Or Upload Your Own MP3 File</span>
            <label className="w-full py-2.5 px-4 rounded-xl bg-slate-950 border border-slate-700 hover:border-emerald-400/70 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all">
              <i className="fa-solid fa-cloud-arrow-up text-emerald-400" /> Choose MP3 from Device (Max 8MB)
              <input type="file" accept="audio/*" onChange={handleAudioUpload} className="hidden" />
            </label>
          </div>
        </div>
      )}

      {/* ================= SAVE & CHECKOUT ================= */}
      {onSave && (
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 pt-3">
          {setSlug && slug !== undefined && (
            <div>
              <label className="text-xs text-slate-400 block mb-1">Invitation URL Path (Slug)</label>
              <div className="flex items-center rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs">
                <span className="text-slate-500 select-none">/e/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.replace(/\s+/g, '-').toLowerCase())}
                  className="bg-transparent border-none outline-none text-amber-300 w-full ml-1"
                />
              </div>
            </div>
          )}

          <button
            onClick={onSave}
            disabled={isSaving}
            type="button"
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs tracking-wider uppercase transition-all shadow-lg active:scale-98 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {isSaving ? 'Generating Invitation...' : 'Save & Generate Invitation Links'}
          </button>

          {generatedUrl && (
            <div className="p-4 rounded-2xl bg-slate-900 border border-amber-500/30 space-y-3.5">
              <div className="text-center">
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  🎉 Your Invitation Link is Ready!
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-1.5">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-emerald-400 font-bold">1. Free Link (2 Slides, Clean / No Watermark)</span>
                  <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">FREE</span>
                </div>
                <a href={generatedUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-slate-200 underline break-all block hover:text-white">
                  {generatedUrl}
                </a>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/40 space-y-1.5">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-amber-400 font-bold">2. Premium Preview Link (All Slides, Watermarked)</span>
                  <span className="text-[9px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">PREVIEW</span>
                </div>
                <a href={`${generatedUrl}?v=premium`} target="_blank" rel="noreferrer" className="text-xs font-bold text-amber-300 underline break-all block hover:text-amber-200">
                  {`${generatedUrl}?v=premium`}
                </a>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                <div className="text-left">
                  <span className="text-xs font-bold text-amber-200 block">Unlock Full Access Without Watermark</span>
                  <span className="text-[10px] text-slate-400 block">One-time instant unlock via Card / FPX.</span>
                </div>
                <button
                  type="button"
                  onClick={handleStripeCheckout}
                  disabled={isCheckingOut}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider text-center shadow-lg active:scale-95 transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2"
                >
                  {isCheckingOut ? 'Opening Stripe...' : 'Unlock Full Access (RM 15)'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= MODAL: DYNAMIC WALLPAPERS ================= */}
      {isWallpaperModalOpen && (
        <div className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <i className="fa-solid fa-images text-amber-400" /> 
                  Wallpaper Gallery ({wallpaperModalTarget === 'cover' ? 'Cover Page' : 'Inner Slides'})
                </h3>
                <p className="text-xs text-slate-400">Choose from {dbWallpapers.length} high-resolution portrait textures.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsWallpaperModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm cursor-pointer"
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <div className="px-4 py-3 bg-slate-950/60 border-b border-slate-800 flex gap-2 overflow-x-auto no-scrollbar">
              {wallpaperCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedWallpaperCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedWallpaperCategory === cat ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 flex-1">
              {filteredWallpapers.map((wp) => {
                const isSelected = wallpaperModalTarget === 'cover' 
                  ? data.theme?.coverBgUrl === wp.url
                  : (data.theme?.slideBgUrl === wp.url || data.theme?.bgPatternUrl === wp.url);

                return (
                  <div
                    key={wp.id}
                    onClick={() => handleSelectWallpaper(wp.url)}
                    className={`group relative rounded-2xl overflow-hidden border-2 cursor-pointer transition-all aspect-[9/16] ${
                      isSelected ? 'border-amber-400 ring-4 ring-amber-400/40 scale-[1.02]' : 'border-slate-800 hover:border-amber-400/70 hover:scale-[1.02]'
                    }`}
                  >
                    <img src={wp.url} alt={wp.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-2.5">
                      <span className="text-[11px] font-bold text-white line-clamp-1">{wp.name}</span>
                      <span className="text-[9px] text-amber-300/90 font-medium">{wp.category}</span>
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs shadow-md">
                        <i className="fa-solid fa-check" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: DYNAMIC FOREGROUND FRAMES ================= */}
      {isFrameModalOpen && (
        <div className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <i className="fa-solid fa-leaf text-emerald-400" /> 
                  Decorative Frames Gallery ({dbFrames.length} Items)
                </h3>
                <p className="text-xs text-slate-400">Choose a transparent frame overlay for your card foreground.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsFrameModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm cursor-pointer"
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <div className="px-4 py-3 bg-slate-950/60 border-b border-slate-800 flex gap-2 overflow-x-auto no-scrollbar">
              {frameCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedFrameCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedFrameCategory === cat ? 'bg-emerald-500 text-slate-950 font-bold shadow' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 flex-1">
              {filteredFrames.map((frame) => {
                const isSelected = data.theme?.frameOverlayUrl === frame.url;

                return (
                  <div
                    key={frame.id}
                    onClick={() => handleSelectFrame(frame.url)}
                    className={`group relative rounded-2xl overflow-hidden border-2 cursor-pointer transition-all aspect-[9/16] bg-slate-950/80 p-2 flex flex-col justify-between ${
                      isSelected ? 'border-emerald-400 ring-4 ring-emerald-400/40 scale-[1.02]' : 'border-slate-800 hover:border-emerald-400/70 hover:scale-[1.02]'
                    }`}
                  >
                    <img src={frame.url} alt={frame.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    <div className="bg-black/75 p-1.5 rounded-lg mt-1 text-center">
                      <span className="text-[10px] font-bold text-white line-clamp-1">{frame.name}</span>
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-xs shadow-md">
                        <i className="fa-solid fa-check" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: DYNAMIC MUSIC TRACKS ================= */}
      {isMusicModalOpen && (
        <div className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-3xl h-[88vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <i className="fa-solid fa-compact-disc text-amber-400" /> Event Music Library
                </h3>
                <p className="text-xs text-slate-400">Click the Play / Pause (▶️ / ⏸️) button to preview songs.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (modalAudioRef.current) modalAudioRef.current.pause();
                  setIsPlayingAudio(false);
                  setIsMusicModalOpen(false);
                }}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm cursor-pointer"
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <div className="px-4 py-3 bg-slate-950/60 border-b border-slate-800 flex gap-2 overflow-x-auto no-scrollbar">
              {musicCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedMusicCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedMusicCategory === cat ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto space-y-2.5 flex-1">
              {filteredMusic.map((track) => {
                const isSelected = data.cover?.audioUrl === track.url;
                const isCurrentPreview = previewTrackUrl === track.url && isPlayingAudio;

                return (
                  <div
                    key={track.id}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                      isSelected ? 'bg-amber-500/15 border-amber-400 shadow-md ring-1 ring-amber-400/40' : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleTogglePreviewMusic(track.url)}
                        className={`w-11 h-11 rounded-full flex items-center justify-center text-base transition-transform active:scale-90 cursor-pointer ${
                          isCurrentPreview ? 'bg-amber-500 text-slate-950 shadow-lg ring-2 ring-amber-400' : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30'
                        }`}
                        title={isCurrentPreview ? 'Stop Audio' : 'Play Audio'}
                      >
                        {isCurrentPreview ? <i className="fa-solid fa-pause" /> : <i className="fa-solid fa-play ml-0.5 text-sm" />}
                      </button>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white block">{track.name}</span>
                          {isCurrentPreview && (
                            <span className="flex items-center gap-1 text-amber-400 text-[10px] font-bold animate-pulse">
                              <i className="fa-solid fa-volume-high" /> Playing
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-amber-300/80 font-medium">{track.category}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isSelected ? (
                        <span className="px-3.5 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                          <i className="fa-solid fa-check" /> Selected
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSelectTrack(track.url)}
                          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow transition-transform active:scale-95 cursor-pointer whitespace-nowrap"
                        >
                          Select Track
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}