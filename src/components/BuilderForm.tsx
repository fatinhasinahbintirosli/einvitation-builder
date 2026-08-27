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
}

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

export default function BuilderForm({ 
  data, 
  onChange, 
  onSave, 
  isSaving = false,
  slug,
  setSlug,
  generatedUrl
}: Props) {
  const [activeTab, setActiveTab] = useState<'theme' | 'cover' | 'slides'>('cover');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const updateData = (newData: CardData) => {
    onChange(newData);
  };

  // Panggilan Checkout Stripe
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

  // Pengendali Muat Naik Kertas Dinding (Wallpaper)
  const handleWallpaperUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      setUploadError('Saiz gambar melebihi 3MB. Sila pilih gambar yang lebih kecil.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      updateData({
        ...data,
        theme: {
          ...data.theme,
          bgPatternUrl: base64Url
        }
      });
    };
    reader.readAsDataURL(file);
  };

  // Muat Naik Gambar Bulat / QR Code
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
  };

  const addNewSlide = () => {
    const newSlide: SlideItem = {
      id: Math.random().toString(36).substring(2, 9),
      type: 'location',
      title: 'LOKASI MAJLIS',
      locationDetails: {
        venueName: 'Dewan Gemilang Perdana',
        address: 'No. 123, Jalan Raja Chulan, Kuala Lumpur',
        gmapsUrl: 'https://maps.google.com',
        wazeUrl: 'https://waze.com'
      }
    };
    updateData({ ...data, slides: [...data.slides, newSlide] });
  };

  const removeSlide = (index: number) => {
    if (data.slides.length <= 1) {
      alert('Kad perlu mempunyai sekurang-kurangnya 1 helaian.');
      return;
    }
    const updatedSlides = data.slides.filter((_, idx) => idx !== index);
    updateData({ ...data, slides: updatedSlides });
  };

  const handleTypeChange = (index: number, newType: SlideType) => {
    const currentSlide = data.slides[index];
    let updated: Partial<SlideItem> = { type: newType };

    if (newType === 'location' && !currentSlide.locationDetails) {
      updated.title = 'LOKASI MAJLIS';
      updated.locationDetails = {
        venueName: 'Nama Dewan / Tempat',
        address: 'Alamat Penuh Majlis',
        gmapsUrl: 'https://maps.google.com',
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
        <p className="text-xs text-slate-400 mt-1">Sesuaikan tema, muzik latar, muka depan, dan pilih fungsi setiap helaian.</p>
      </div>

      {/* Navigasi Tab */}
      <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('cover')}
          className={`flex-1 py-2.5 rounded-lg transition-all ${
            activeTab === 'cover' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          1. Muka Depan & Wallpaper
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('slides')}
          className={`flex-1 py-2.5 rounded-lg transition-all ${
            activeTab === 'slides' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          2. Pilihan Helaian ({data.slides?.length || 0})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('theme')}
          className={`flex-1 py-2.5 rounded-lg transition-all ${
            activeTab === 'theme' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          3. Muzik & Tema
        </button>
      </div>

      {/* ================= TAB 1: MUKA DEPAN & WALLPAPER ================= */}
      {activeTab === 'cover' && (
        <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
          <label className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
            Maklumat Muka Depan & Kertas Dinding
          </label>

          {/* RUANGAN UPLOAD WALLPAPER DI MUKA DEPAN */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-amber-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <i className="fa-solid fa-image" /> Kertas Dinding Kad (Wallpaper)
              </label>
              {data.theme?.bgPatternUrl && (
                <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/30">
                  Aktif
                </span>
              )}
            </div>

            {/* Pratonton Wallpaper Semasa */}
            {data.theme?.bgPatternUrl && (
              <div className="relative w-full h-24 rounded-xl overflow-hidden border border-amber-400/40 shadow-inner">
                <img 
                  src={data.theme.bgPatternUrl} 
                  alt="Wallpaper Semasa" 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <span className="text-[10px] text-white font-medium bg-black/70 px-2.5 py-1 rounded-full border border-white/20">
                    Kertas Dinding Semasa
                  </span>
                </div>
              </div>
            )}

            {/* Butang Muat Naik Wallpaper */}
            <div>
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 hover:border-amber-400/60 rounded-xl p-3 cursor-pointer bg-slate-950/60 transition-all">
                <i className="fa-solid fa-cloud-arrow-up text-lg text-amber-400 mb-1" />
                <span className="text-xs text-slate-300 font-medium">Muat Naik Gambar Wallpaper Sendiri</span>
                <span className="text-[10px] text-slate-500 mt-0.5">Format JPG, PNG, WebP (Nisbah 9:16 disyorkan)</span>
                <input type="file" accept="image/*" onChange={handleWallpaperUpload} className="hidden" />
              </label>
              {uploadError && <p className="text-xs text-red-400 mt-1">{uploadError}</p>}
            </div>

            {/* Pilihan Corak Preset Pantas */}
            <div className="pt-1">
              <span className="text-[11px] text-slate-400 block mb-1.5 font-medium">Atau pilih corak tema sedia ada:</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PRESET_WALLPAPERS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => updateData({ ...data, theme: { ...data.theme, bgPatternUrl: preset.url } })}
                    className={`relative h-14 rounded-lg overflow-hidden border transition-all ${
                      data.theme?.bgPatternUrl === preset.url
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
          
          <div>
            <label className="text-xs text-slate-400 block mb-1">Tagline / Panggilan Atas</label>
            <input
              type="text"
              value={data.cover?.tagline || ''}
              onChange={(e) => updateData({ ...data, cover: { ...data.cover, tagline: e.target.value } })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs focus:border-amber-400 outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Tajuk / Nama Utama Majlis</label>
            <input
              type="text"
              value={data.cover?.mainTitle || ''}
              onChange={(e) => updateData({ ...data, cover: { ...data.cover, mainTitle: e.target.value } })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs focus:border-amber-400 outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Tarikh Ringkas</label>
            <input
              type="text"
              value={data.cover?.dateText || ''}
              onChange={(e) => updateData({ ...data, cover: { ...data.cover, dateText: e.target.value } })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs focus:border-amber-400 outline-none"
            />
          </div>
        </div>
      )}

      {/* ================= TAB 2: HELAIAN KAD ================= */}
      {activeTab === 'slides' && (
        <div className="space-y-4 max-h-[520px] overflow-y-auto pr-1">
          {data.slides.map((slide, idx) => (
            <div key={slide.id || idx} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3.5">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  
                  <select
                    value={slide.type}
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
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={slide.title || ''}
                    onChange={(e) => updateSlide(idx, { title: e.target.value })}
                    placeholder="Tajuk Atas"
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-right text-slate-300 outline-none w-32"
                  />
                  <button
                    type="button"
                    onClick={() => removeSlide(idx)}
                    className="text-red-400 hover:text-red-300 p-1 text-xs"
                    title="Padam Helaian Ini"
                  >
                    <i className="fa-solid fa-trash-can" />
                  </button>
                </div>
              </div>

              {/* 1. INTRO */}
              {slide.type === 'intro' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Teks Ucapan Jemputan</label>
                    <textarea
                      rows={2}
                      value={slide.bodyText || ''}
                      onChange={(e) => updateSlide(idx, { bodyText: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Nama Penuh Yang Diraikan</label>
                    <input
                      type="text"
                      value={slide.subtitle || ''}
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

              {/* 2. LOCATION */}
              {slide.type === 'location' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Nama Tempat / Dewan</label>
                    <input
                      type="text"
                      value={slide.locationDetails?.venueName || ''}
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
                        onChange={(e) => updateSlide(idx, {
                          locationDetails: { ...(slide.locationDetails || { venueName: '', address: '', gmapsUrl: '', wazeUrl: '' }), gmapsUrl: e.target.value }
                        })}
                        placeholder="https://maps.google.com/..."
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Pautan Waze</label>
                      <input
                        type="text"
                        value={slide.locationDetails?.wazeUrl || ''}
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

              {/* 3. TENTATIVE */}
              {slide.type === 'tentative' && (
                <div className="space-y-2.5">
                  <label className="text-[11px] text-slate-400 block">Jadual Atur Cara Majlis:</label>
                  {(slide.timeline || []).map((tItem, tIdx) => (
                    <div key={tIdx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={tItem.time}
                        onChange={(e) => updateTimelineItem(idx, tIdx, 'time', e.target.value)}
                        placeholder="Masa"
                        className="w-24 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-amber-300 outline-none"
                      />
                      <input
                        type="text"
                        value={tItem.activity}
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

              {/* 4. IMAGE / QR CODE */}
              {slide.type === 'image_qr' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Tajuk QR / Imej</label>
                    <input
                      type="text"
                      value={slide.subtitle || ''}
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

              {/* 5. GUESTBOOK */}
              {slide.type === 'guestbook' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Tajuk Ruangan</label>
                    <input
                      type="text"
                      value={slide.subtitle || ''}
                      onChange={(e) => updateSlide(idx, { subtitle: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Penerangan / Arahan Tetamu</label>
                    <textarea
                      rows={2}
                      value={slide.bodyText || ''}
                      onChange={(e) => updateSlide(idx, { bodyText: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              )}

              {/* 6. THANK YOU */}
              {slide.type === 'thank_you' && (
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Teks Ucapan Penghargaan</label>
                  <textarea
                    rows={2}
                    value={slide.bodyText || ''}
                    onChange={(e) => updateSlide(idx, { bodyText: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs outline-none focus:border-amber-400"
                  />
                </div>
              )}

            </div>
          ))}

          <button
            type="button"
            onClick={addNewSlide}
            className="w-full py-3 rounded-2xl border-2 border-dashed border-amber-400/40 hover:border-amber-400 bg-amber-500/5 hover:bg-amber-500/10 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <i className="fa-solid fa-plus" /> Tambah Helaian Baharu
          </button>
        </div>
      )}

      {/* ================= TAB 3: MUZIK & TEMA ================= */}
      {activeTab === 'theme' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
            <label className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
              Pautan Lagu / Audio Latar (MP3 Direct URL)
            </label>
            <input
              type="text"
              placeholder="https://.../lagu.mp3"
              value={data.cover?.audioUrl || ''}
              onChange={(e) => updateData({ ...data, cover: { ...data.cover, audioUrl: e.target.value } })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs focus:border-amber-400 outline-none"
            />
          </div>
        </div>
      )}

      {/* ================= BAHAGIAN SIMPAN & STRIPE CHECKOUT ================= */}
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

              {/* BUTANG CHECKOUT SEBENAR STRIPE */}
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