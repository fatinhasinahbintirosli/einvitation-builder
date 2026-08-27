'use client';

import React, { useState } from 'react';
import { CardData, SlideType } from '@/types/invitation';

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

const COLOR_PRESETS = [
  { name: 'Hijau Zamrud', hex: '#2d4a3e' },
  { name: 'Biru Gelap', hex: '#172554' },
  { name: 'Maroon Diraja', hex: '#451a24' },
  { name: 'Coklat Tanah', hex: '#3e2723' },
  { name: 'Champagne Emas', hex: '#63513d' },
  { name: 'Hitam Elegan', hex: '#18181b' },
  { name: 'Dusty Rose', hex: '#5c3a4d' },
  { name: 'Teal Klasik', hex: '#134e4a' },
];

const PRESET_WALLPAPERS = [
  {
    id: 'songket_gold',
    name: 'Songket Emas Warisan',
    url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1080&auto=format&fit=crop',
  },
  {
    id: 'dark_floral',
    name: 'Botanikal Bunga Klasik',
    url: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?q=80&w=1080&auto=format&fit=crop',
  },
  {
    id: 'royal_emerald',
    name: 'Hijau Zamrud Mewah',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1080&auto=format&fit=crop',
  },
  {
    id: 'cream_texture',
    name: 'Tekstur Krim Elegan',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1080&auto=format&fit=crop',
  }
];

const MUSIC_PRESETS = [
  {
    name: 'Melodi Piano Lembut (Lalai)',
    url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=soft-piano-112349.mp3',
  },
  {
    name: 'Gitar Akustik Kasih',
    url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=romantic-acoustic-guitar-15286.mp3',
  },
  {
    name: 'Ketenangan Jiwa & Doa (Ambient)',
    url: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_12b0c7443c.mp3?filename=peaceful-garden-healing-light-ambient-music-7789.mp3',
  },
  {
    name: 'Sentuhan Nostalgia Klasik',
    url: 'https://cdn.pixabay.com/download/audio/2022/11/06/audio_03d98d414a.mp3?filename=piano-moment-125010.mp3',
  }
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

  const bgType = data.theme?.coverBgType || 'color';

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

  const handleStripeCheckout = async () => {
    if (!slug) return;
    setIsCheckingOut(true);

    try {
      if (onSave) {
        await onSave();
      }

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: slug.trim().toLowerCase() }),
      });

      const resData = await res.json();
      if (resData.url) {
        window.location.href = resData.url;
      } else {
        alert('Ralat memulakan pembayaran: ' + (resData.error || 'Sila cuba lagi.'));
      }
    } catch (err: any) {
      alert('Ralat rangkaian: ' + err.message);
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleWallpaperUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      setUploadError('Saiz gambar melebihi 3MB. Sila pilih gambar lebih kecil.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      updateData({
        ...data,
        theme: {
          ...data.theme,
          coverBgType: 'image',
          coverBgUrl: base64Url,
          bgPatternUrl: base64Url
        }
      });
      onActiveSlideChange?.('cover');
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
      updatedSlides[slideIndex] = {
        ...updatedSlides[slideIndex],
        imageUrl: base64Url
      };
      updateData({ ...data, slides: updatedSlides });
      onActiveSlideChange?.(slideIndex);
    };
    reader.readAsDataURL(file);
  };

  const updateSlide = (index: number, updatedFields: Partial<SlideItem>) => {
    const updatedSlides = [...data.slides];
    updatedSlides[index] = {
      ...updatedSlides[index],
      ...updatedFields
    };
    updateData({ ...data, slides: updatedSlides });
    onActiveSlideChange?.(index);
  };

  const addNewSlide = () => {
    const newSlide: SlideItem = {
      id: Math.random().toString(36).substring(2, 9),
      type: 'location',
      title: 'LOKASI MAJLIS',
      locationDetails: {
        venueName: 'Dewan Gemilang Perdana',
        address: 'No. 123, Jalan Raja Chulan, Kuala Lumpur',
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
      alert('Kad perlu mempunyai sekurang-kurangnya 1 helaian.');
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
      updated.title = 'LOKASI MAJLIS';
      updated.locationDetails = {
        venueName: 'Nama Dewan / Tempat',
        address: 'Alamat Penuh Majlis',
        gmapsUrl: 'http://googleusercontent.com/maps.google.com/4',
        wazeUrl: 'https://waze.com'
      };
    } else if (newType === 'tentative' && !currentSlide.timeline) {
      updated.title = 'SUSUNAN MAJLIS';
      updated.timeline = [
        { time: '11:00 AM', activity: 'Ketibaan Tetamu' },
        { time: '12:00 PM', activity: 'Jamuan Makan' },
        { time: '04:00 PM', activity: 'Majlis Bersurai' }
      ];
    } else if (newType === 'image_qr') {
      updated.title = 'KOD QR / HADIAH';
      updated.subtitle = 'DuitNow / Salam Kausar';
      updated.bodyText = 'Imbas kod QR di bawah untuk ingatan tulus ikhlas anda.';
    } else if (newType === 'guestbook') {
      updated.title = 'BUKU UCAPAN';
      updated.subtitle = 'Titipan Doa & Ucapan';
      updated.bodyText = 'Semoga kehadiran anda membawa seribu keberkatan buat kami.';
    } else if (newType === 'thank_you') {
      updated.title = 'PENGHARGAAN';
      updated.bodyText = 'Sekalung penghargaan dan terima kasih atas kehadiran dan doa tulus ikhlas anda sekeluarga.';
    }

    updateSlide(index, updated);
  };

  const addTimelineItem = (slideIndex: number) => {
    const slide = data.slides[slideIndex];
    const currentTimeline = slide.timeline || [];
    const newTimeline = [...currentTimeline, { time: '12:00 PM', activity: 'Aktiviti Baru' }];
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

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 text-slate-200 shadow-2xl space-y-5">
      
      <div>
        <h2 className="text-2xl font-bold text-white tracking-wide">Pereka Kad Jemputan Digital</h2>
        <p className="text-xs text-slate-400 mt-1">Ubah suai muka depan, susunan helaian, dan pilihan lagu majlis.</p>
      </div>

      {/* Navigasi Tab */}
      <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs font-semibold">
        <button
          type="button"
          onClick={() => handleTabChange('cover')}
          className={`flex-1 py-2.5 rounded-lg transition-all ${
            activeTab === 'cover' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          1. Muka Depan & Wallpaper
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('slides')}
          className={`flex-1 py-2.5 rounded-lg transition-all ${
            activeTab === 'slides' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          2. Pilihan Helaian ({data.slides?.length || 0})
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('music')}
          className={`flex-1 py-2.5 rounded-lg transition-all ${
            activeTab === 'music' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          3. Lagu & Muzik Latar
        </button>
      </div>

      {/* ================= TAB 1: MUKA DEPAN & WALLPAPER ================= */}
      {activeTab === 'cover' && (
        <div 
          onClick={() => onActiveSlideChange?.('cover')}
          className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4"
        >
          <div className="p-4 rounded-2xl bg-slate-900 border border-amber-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                Latar Belakang Muka Depan
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
                  <i className="fa-solid fa-palette mr-1" /> Warna
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
                  <i className="fa-solid fa-image mr-1" /> Gambar
                </button>
              </div>
            </div>

            {bgType === 'color' && (
              <div className="space-y-3 pt-1">
                <span className="text-[11px] text-slate-400 block font-medium">Pilih warna tema muka depan:</span>
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
                  <label className="text-[11px] text-slate-400">Atau kod warna tersendiri (Hex):</label>
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
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 hover:border-amber-400/60 rounded-xl p-3 cursor-pointer bg-slate-950/60 transition-all">
                  <i className="fa-solid fa-cloud-arrow-up text-lg text-amber-400 mb-1" />
                  <span className="text-xs text-slate-300 font-medium">Muat Naik Gambar Latar Belakang</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">Format JPG/PNG (9:16 disyorkan)</span>
                  <input type="file" accept="image/*" onChange={handleWallpaperUpload} className="hidden" />
                </label>
                {uploadError && <p className="text-xs text-red-400 mt-1">{uploadError}</p>}

                <div>
                  <span className="text-[11px] text-slate-400 block mb-1.5 font-medium">Atau pilih corak tema sedia ada:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {PRESET_WALLPAPERS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          updateData({
                            ...data,
                            theme: { ...data.theme, coverBgUrl: preset.url, bgPatternUrl: preset.url }
                          });
                          onActiveSlideChange?.('cover');
                        }}
                        className={`relative h-14 rounded-lg overflow-hidden border transition-all ${
                          data.theme?.coverBgUrl === preset.url
                            ? 'border-amber-400 ring-2 ring-amber-400/40 scale-[1.02]'
                            : 'border-slate-700 opacity-75 hover:opacity-100'
                        }`}
                      >
                        <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-1">
                          <span className="text-[9px] text-white text-center font-medium leading-tight">{preset.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div>
            <label className="text-xs text-slate-400 block mb-1">Tagline / Panggilan Atas</label>
            <input
              type="text"
              value={data.cover?.tagline || ''}
              onFocus={() => onActiveSlideChange?.('cover')}
              onChange={(e) => updateData({ ...data, cover: { ...data.cover, tagline: e.target.value } })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs focus:border-amber-400 outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Tajuk / Nama Utama Majlis</label>
            <input
              type="text"
              value={data.cover?.mainTitle || ''}
              onFocus={() => onActiveSlideChange?.('cover')}
              onChange={(e) => updateData({ ...data, cover: { ...data.cover, mainTitle: e.target.value } })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs focus:border-amber-400 outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Tarikh Ringkas</label>
            <input
              type="text"
              value={data.cover?.dateText || ''}
              onFocus={() => onActiveSlideChange?.('cover')}
              onChange={(e) => updateData({ ...data, cover: { ...data.cover, dateText: e.target.value } })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs focus:border-amber-400 outline-none"
            />
          </div>
        </div>
      )}

      {/* ================= TAB 2: HELAIAN KAD ================= */}
      {activeTab === 'slides' && (
        <div className="space-y-4 max-h-[520px] overflow-y-auto pr-1">
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
                      <option value="intro">✨ Pengenalan & Ucapan</option>
                      <option value="location">📍 Lokasi & Peta (Maps / Waze)</option>
                      <option value="tentative">📅 Susunan Majlis (Tentatif)</option>
                      <option value="image_qr">📷 Kod QR / DuitNow / Galeri</option>
                      <option value="guestbook">📖 Buku Ucapan & Doa</option>
                      <option value="thank_you">🙏 Ucapan Penghargaan & Penutup</option>
                    </select>

                    {isCurrentlyActive && (
                      <span className="text-[9px] text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                        Live di Preview
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={slide.title || ''}
                      onFocus={() => onActiveSlideChange?.(idx)}
                      onChange={(e) => updateSlide(idx, { title: e.target.value })}
                      placeholder="Tajuk Atas"
                      className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-right text-slate-300 outline-none w-32"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSlide(idx);
                      }}
                      className="text-red-400 hover:text-red-300 p-1 text-xs"
                      title="Padam Helaian Ini"
                    >
                      <i className="fa-solid fa-trash-can" />
                    </button>
                  </div>
                </div>

                {/* INTRO */}
                {slide.type === 'intro' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Teks Ucapan Jemputan</label>
                      <textarea
                        rows={2}
                        value={slide.bodyText || ''}
                        onFocus={() => onActiveSlideChange?.(idx)}
                        onChange={(e) => updateSlide(idx, { bodyText: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Nama Penuh Yang Diraikan</label>
                      <input
                        type="text"
                        value={slide.subtitle || ''}
                        onFocus={() => onActiveSlideChange?.(idx)}
                        onChange={(e) => updateSlide(idx, { subtitle: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Gambar Bulat Tengah</label>
                      <div className="flex items-center gap-3">
                        {slide.imageUrl && (
                          <img src={slide.imageUrl} alt="Preview" className="w-10 h-10 rounded-full object-cover border border-amber-400" />
                        )}
                        <label className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs cursor-pointer border border-slate-700">
                          Pilih Gambar Foto
                          <input type="file" accept="image/*" onChange={(e) => handleSlideImageUpload(idx, e)} className="hidden" />
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* LOCATION */}
                {slide.type === 'location' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Nama Tempat / Dewan</label>
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
                      <label className="text-[11px] text-slate-400 block mb-1">Alamat Penuh Majlis</label>
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
                        <label className="text-[10px] text-slate-400 block mb-0.5">Pautan Google Maps</label>
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
                        <label className="text-[10px] text-slate-400 block mb-0.5">Pautan Waze</label>
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
                    <label className="text-[11px] text-slate-400 block">Jadual Atur Cara Majlis:</label>
                    {(slide.timeline || []).map((tItem, tIdx) => (
                      <div key={tIdx} className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={tItem.time}
                          onFocus={() => onActiveSlideChange?.(idx)}
                          onChange={(e) => updateTimelineItem(idx, tIdx, 'time', e.target.value)}
                          placeholder="Masa"
                          className="w-24 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-amber-300 outline-none"
                        />
                        <input
                          type="text"
                          value={tItem.activity}
                          onFocus={() => onActiveSlideChange?.(idx)}
                          onChange={(e) => updateTimelineItem(idx, tIdx, 'activity', e.target.value)}
                          placeholder="Aktiviti"
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
                      <i className="fa-solid fa-plus text-[10px]" /> Tambah Baris Masa
                    </button>
                  </div>
                )}

                {/* IMAGE_QR */}
                {slide.type === 'image_qr' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Tajuk QR / Imej</label>
                      <input
                        type="text"
                        value={slide.subtitle || ''}
                        onFocus={() => onActiveSlideChange?.(idx)}
                        onChange={(e) => updateSlide(idx, { subtitle: e.target.value })}
                        placeholder="Contoh: Kod QR DuitNow / Hadiah"
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Penerangan Ringkas</label>
                      <input
                        type="text"
                        value={slide.bodyText || ''}
                        onFocus={() => onActiveSlideChange?.(idx)}
                        onChange={(e) => updateSlide(idx, { bodyText: e.target.value })}
                        placeholder="Imbas kod QR di bawah untuk ingatan tulus ikhlas anda."
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Muat Naik Kod QR / Gambar</label>
                      <div className="flex items-center gap-3">
                        {slide.imageUrl && (
                          <img src={slide.imageUrl} alt="QR" className="w-12 h-12 rounded-xl object-contain border border-amber-400 bg-white p-1" />
                        )}
                        <label className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs cursor-pointer border border-slate-700">
                          Pilih Gambar QR
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
                      <label className="text-[11px] text-slate-400 block mb-1">Tajuk Ruangan</label>
                      <input
                        type="text"
                        value={slide.subtitle || ''}
                        onFocus={() => onActiveSlideChange?.(idx)}
                        onChange={(e) => updateSlide(idx, { subtitle: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Penerangan / Arahan Tetamu</label>
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
                    <label className="text-[11px] text-slate-400 block mb-1">Teks Ucapan Penghargaan</label>
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
            <i className="fa-solid fa-plus" /> Tambah Helaian Baharu
          </button>
        </div>
      )}

      {/* ================= TAB 3: LAGU & MUZIK LATAR ================= */}
      {activeTab === 'music' && (
        <div 
          onClick={() => onActiveSlideChange?.('cover')}
          className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4"
        >
          <label className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
            Pilihan Lagu & Audio Latar
          </label>

          <div className="space-y-2">
            <span className="text-[11px] text-slate-400 block font-medium">Klik untuk terus mendengar lagu pilihan:</span>
            <div className="space-y-2">
              {MUSIC_PRESETS.map((track) => {
                const isSelected = data.cover?.audioUrl === track.url;

                return (
                  <div 
                    key={track.url}
                    onClick={() => {
                      updateData({ ...data, cover: { ...data.cover, audioUrl: track.url } });
                    }}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-400/60 shadow-md ring-1 ring-amber-400/40'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-colors ${
                        isSelected ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                      }`}>
                        <i className={`fa-solid ${isSelected ? 'fa-volume-high text-slate-950' : 'fa-music'}`} />
                      </div>
                      <span className="text-xs font-medium text-slate-200">{track.name}</span>
                    </div>

                    {isSelected && (
                      <span className="text-[10px] font-bold text-amber-300 uppercase px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/30">
                        Sedang Dimainkan
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 space-y-1.5">
            <label className="text-[11px] text-slate-400 block font-medium">Atau masukkan pautan URL MP3 anda sendiri:</label>
            <input
              type="text"
              placeholder="https://.../lagu-pilihan.mp3"
              value={data.cover?.audioUrl || ''}
              onChange={(e) => updateData({ ...data, cover: { ...data.cover, audioUrl: e.target.value } })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs focus:border-amber-400 outline-none"
            />
          </div>
        </div>
      )}

      {/* ================= BAHAGIAN SIMPAN & CHECKOUT ================= */}
      {onSave && (
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 pt-3">
          {setSlug && slug !== undefined && (
            <div>
              <label className="text-xs text-slate-400 block mb-1">Pautan URL Kad (Slug)</label>
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
            {isSaving ? (
              <>
                <i className="fa-solid fa-spinner fa-spin" /> Menyimpan...
              </>
            ) : (
              <>
                <i className="fa-solid fa-paper-plane" /> Sahkan & Jana Pautan Kad
              </>
            )}
          </button>

          {/* DUAL LINK SECTION */}
          {generatedUrl && (
            <div className="p-4 rounded-2xl bg-slate-900 border border-amber-500/30 space-y-3.5">
              <div className="text-center">
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  🎉 Pautan Kad Anda Berjaya Dijana!
                </span>
              </div>

              {/* 1. LINK PERCUMA */}
              <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-1.5">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-emerald-400 font-bold">1. Pautan Percuma (2 Helaian, Tanpa Watermark)</span>
                  <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">FREE</span>
                </div>
                <a 
                  href={generatedUrl} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-xs font-bold text-slate-200 underline break-all block hover:text-white"
                >
                  {generatedUrl}
                </a>
              </div>

              {/* 2. LINK PREMIUM PREVIEW */}
              <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/40 space-y-1.5">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-amber-400 font-bold">2. Pautan Premium Preview (Semua Helaian, Ada Watermark)</span>
                  <span className="text-[9px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">PREVIEW</span>
                </div>
                <a 
                  href={`${generatedUrl}?v=premium`} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-xs font-bold text-amber-300 underline break-all block hover:text-amber-200"
                >
                  {`${generatedUrl}?v=premium`}
                </a>
              </div>

              {/* BUTANG CHECKOUT STRIPE */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                <div className="text-left">
                  <span className="text-xs font-bold text-amber-200 block">Buka Kunci Rasmi Tanpa Watermark</span>
                  <span className="text-[10px] text-slate-400 block">Bayaran sekali sahaja via kad / FPX melalui Stripe.</span>
                </div>
                <button
                  type="button"
                  onClick={handleStripeCheckout}
                  disabled={isCheckingOut}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider text-center shadow-lg active:scale-95 transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2"
                >
                  {isCheckingOut ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin" /> Membuka Stripe...
                    </>
                  ) : (
                    <>
                      <i className="fa-brands fa-stripe text-base" /> Buka Kunci (RM 15)
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}